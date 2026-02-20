/**
 * TrackBuddy -- Algorand Indexer Listener
 *
 * Polls the Algorand Indexer for new transactions on the
 * discipline contract. Detects method calls and emits events
 * for the DB sync service to process.
 */

import { getIndexerClient, getAppId } from './index';
import { EventEmitter } from 'events';

// ── Types ──

export interface ContractEvent {
    txId: string;
    method: string;
    sender: string;
    args: string[];
    roundTime: number;
    confirmedRound: number;
    groupId?: string;
    paymentAmount?: number;
}

// ── Constants ──

const KNOWN_METHODS = [
    'createCommitment',
    'verifySession',
    'applyPenalty',
    'logDiscipline',
    'bridgeIntent',
    'settleBridge',
];

const POLL_INTERVAL_MS = 5000;

// ── Listener Class ──

export class IndexerListener extends EventEmitter {
    private appId: number;
    private lastRound: number = 0;
    private pollTimer: ReturnType<typeof setInterval> | null = null;
    private isRunning = false;

    constructor() {
        super();
        this.appId = 0;
    }

    /**
     * Start polling the indexer for new contract transactions.
     */
    async start(): Promise<void> {
        try {
            this.appId = getAppId();
        } catch {
            console.log('[INDEXER] No App ID configured, listener disabled');
            return;
        }

        if (this.isRunning) {
            console.log('[INDEXER] Already running');
            return;
        }

        this.lastRound = await this.loadCursor();
        this.isRunning = true;

        console.log(`[INDEXER] Started polling for App ID: ${this.appId}`);
        console.log(`[INDEXER] Starting from round: ${this.lastRound}`);

        await this.poll();

        this.pollTimer = setInterval(() => {
            this.poll().catch(err => {
                console.error('[INDEXER] Poll error:', err.message);
            });
        }, POLL_INTERVAL_MS);
    }

    /**
     * Stop the indexer listener.
     */
    stop(): void {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
        this.isRunning = false;
        console.log('[INDEXER] Stopped');
    }

    /**
     * Poll for new transactions since last processed round.
     */
    private async poll(): Promise<void> {
        try {
            const indexer = getIndexerClient();

            let search = indexer
                .searchForTransactions()
                .applicationID(this.appId)
                .txType('appl');

            if (this.lastRound > 0) {
                search = search.minRound(this.lastRound + 1);
            }

            const response = await search.do();
            const transactions = (response as unknown as Record<string, unknown>).transactions as Array<Record<string, unknown>> || [];

            if (transactions.length === 0) return;

            for (const txn of transactions) {
                const event = this.parseTransaction(txn);
                if (event) {
                    this.emit('contract-event', event);
                }

                const round = (txn.confirmedRound || txn['confirmed-round'] || 0) as number;
                if (round > this.lastRound) {
                    this.lastRound = round;
                }
            }

            await this.saveCursor(this.lastRound);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (!message.includes('no such application')) {
                console.error('[INDEXER] Query error:', message);
            }
        }
    }

    /**
     * Parse an Algorand transaction into a ContractEvent.
     */
    private parseTransaction(txn: Record<string, unknown>): ContractEvent | null {
        const appCallData = (txn.applicationTransaction || txn['application-transaction']) as Record<string, unknown> | undefined;
        if (!appCallData) return null;

        const rawArgs = (appCallData.applicationArgs || appCallData['application-args'] || []) as string[];
        if (rawArgs.length === 0) return null;

        // Decode base64 args
        const args = rawArgs.map(arg => Buffer.from(arg, 'base64').toString());
        const method = args[0];

        if (!KNOWN_METHODS.includes(method)) return null;

        // Check for payment in inner txns
        let paymentAmount: number | undefined;
        const innerTxns = (txn.innerTxns || txn['inner-txns']) as Array<Record<string, unknown>> | undefined;
        if (innerTxns) {
            for (const inner of innerTxns) {
                const payTxn = (inner.paymentTransaction || inner['payment-transaction']) as Record<string, unknown> | undefined;
                if (payTxn) {
                    paymentAmount = (payTxn.amount || payTxn['amount']) as number;
                }
            }
        }

        const confirmedRound = (txn.confirmedRound || txn['confirmed-round'] || 0) as number;
        const roundTime = (txn.roundTime || txn['round-time'] || 0) as number;

        return {
            txId: (txn.id || txn['id']) as string,
            method,
            sender: txn.sender as string,
            args: args.slice(1),
            roundTime,
            confirmedRound,
            groupId: (txn.group || txn['group']) as string | undefined,
            paymentAmount,
        };
    }

    /**
     * Load the last processed round from persistent storage.
     */
    private async loadCursor(): Promise<number> {
        try {
            const fs = await import('fs/promises');
            const data = await fs.readFile('.indexer_cursor', 'utf-8');
            return parseInt(data.trim(), 10) || 0;
        } catch {
            return 0;
        }
    }

    /**
     * Save the last processed round to persistent storage.
     */
    private async saveCursor(round: number): Promise<void> {
        try {
            const fs = await import('fs/promises');
            await fs.writeFile('.indexer_cursor', String(round));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error('[INDEXER] Failed to save cursor:', message);
        }
    }
}

// ── Singleton ──

let listener: IndexerListener | null = null;

export function getIndexerListener(): IndexerListener {
    if (!listener) {
        listener = new IndexerListener();
    }
    return listener;
}
