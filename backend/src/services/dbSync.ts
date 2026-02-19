/**
 * TrackBuddy -- On-Chain to Database Sync Service
 *
 * Listens to contract events from the IndexerListener
 * and persists them into the PostgreSQL database.
 *
 * Handles all 6 contract methods:
 * createCommitment, verifySession, applyPenalty,
 * logDiscipline, bridgeIntent, settleBridge
 */

import { getDbClient } from '../db';
import { getIndexerListener, ContractEvent } from '../web3/listener';

// ── Event Handlers ──

/**
 * Process a createCommitment event.
 * Links the on-chain tx ID to the matching DB commitment.
 */
async function handleCreateCommitment(event: ContractEvent): Promise<void> {
    const db = getDbClient();

    const commitment = await db.commitment.findFirst({
        where: {
            user: { walletAddress: event.sender },
            status: 'ACTIVE',
            onChainTxId: null,
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!commitment) {
        console.log(`[SYNC] No pending commitment for ${event.sender}`);
        return;
    }

    await db.commitment.update({
        where: { id: commitment.id },
        data: { onChainTxId: event.txId },
    });

    console.log(`[SYNC] Linked commitment ${commitment.id} to tx ${event.txId}`);
}

/**
 * Process a verifySession event.
 * Updates commitment status based on success/failure.
 */
async function handleVerifySession(event: ContractEvent): Promise<void> {
    const db = getDbClient();

    const accountArg = event.args[0];
    const successFlag = event.args[1];
    const newStatus = successFlag === '1' ? 'COMPLETED' : 'FAILED';

    const commitment = await db.commitment.findFirst({
        where: {
            user: { walletAddress: accountArg },
            status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!commitment) {
        console.log(`[SYNC] No active commitment for ${accountArg}`);
        return;
    }

    await db.commitment.update({
        where: { id: commitment.id },
        data: {
            status: newStatus,
            endTime: new Date(),
        },
    });

    console.log(`[SYNC] Commitment ${commitment.id} -> ${newStatus}`);
}

/**
 * Process an applyPenalty event.
 * Creates a violation record and updates commitment penalty.
 */
async function handleApplyPenalty(event: ContractEvent): Promise<void> {
    const db = getDbClient();

    const accountArg = event.args[0];

    const commitment = await db.commitment.findFirst({
        where: {
            user: { walletAddress: accountArg },
            status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!commitment) {
        console.log(`[SYNC] No active commitment for penalty on ${accountArg}`);
        return;
    }

    const penaltyAmount = commitment.stakeAmount * 0.1;

    await db.violation.create({
        data: {
            commitmentId: commitment.id,
            userId: commitment.userId,
            type: 'MISSED_SESSION',
            penaltyAmount,
            onChainTxId: event.txId,
            occurredAt: new Date(event.roundTime * 1000),
        },
    });

    console.log(`[SYNC] Violation recorded for commitment ${commitment.id}`);
}

/**
 * Process a logDiscipline event.
 * Creates a discipline score record with on-chain reference.
 */
async function handleLogDiscipline(event: ContractEvent): Promise<void> {
    const db = getDbClient();

    const accountArg = event.args[0];
    const scoreStr = event.args[1];

    let scoreValue = 0;
    try {
        scoreValue = parseInt(scoreStr, 10) || 0;
    } catch {
        scoreValue = 0;
    }

    const user = await db.user.findFirst({
        where: { walletAddress: accountArg },
    });

    if (!user) {
        console.log(`[SYNC] No user found for wallet ${accountArg}`);
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.disciplineScore.upsert({
        where: {
            userId_date: { userId: user.id, date: today },
        },
        update: {
            overallScore: scoreValue,
            onChainTxId: event.txId,
        },
        create: {
            userId: user.id,
            date: today,
            overallScore: scoreValue,
            focusScore: 0,
            consistencyScore: 0,
            onChainTxId: event.txId,
        },
    });

    console.log(`[SYNC] Discipline score ${scoreValue} logged for user ${user.id}`);
}

/**
 * Process a bridgeIntent event.
 * Creates a bridge transaction record with PENDING status.
 */
async function handleBridgeIntent(event: ContractEvent): Promise<void> {
    const db = getDbClient();

    const user = await db.user.findFirst({
        where: { walletAddress: event.sender },
    });

    if (!user) {
        console.log(`[SYNC] No user for bridge intent from ${event.sender}`);
        return;
    }

    const algoAmount = event.paymentAmount
        ? event.paymentAmount / 1_000_000
        : 0;

    await db.bridgeTransaction.create({
        data: {
            userId: user.id,
            algoAmount,
            algoTxId: event.txId,
            exchangeRate: 0,    // Set by settlement logic
            inrAmount: 0,       // Set by settlement logic
            status: 'PENDING',
            onChainIntentTxId: event.txId,
            createdAt: new Date(event.roundTime * 1000),
        },
    });

    console.log(`[SYNC] Bridge intent: ${algoAmount} ALGO from user ${user.id}`);
}

/**
 * Process a settleBridge event.
 * Updates bridge transaction to SETTLED status.
 */
async function handleSettleBridge(event: ContractEvent): Promise<void> {
    const db = getDbClient();

    const accountArg = event.args[0];

    const bridge = await db.bridgeTransaction.findFirst({
        where: {
            user: { walletAddress: accountArg },
            status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!bridge) {
        console.log(`[SYNC] No pending bridge for ${accountArg}`);
        return;
    }

    await db.bridgeTransaction.update({
        where: { id: bridge.id },
        data: {
            status: 'SETTLED',
            onChainSettleTxId: event.txId,
            settledAt: new Date(event.roundTime * 1000),
        },
    });

    console.log(`[SYNC] Bridge ${bridge.id} settled`);
}

// ── Event Router ──

const EVENT_HANDLERS: Record<string, (event: ContractEvent) => Promise<void>> = {
    createCommitment: handleCreateCommitment,
    verifySession: handleVerifySession,
    applyPenalty: handleApplyPenalty,
    logDiscipline: handleLogDiscipline,
    bridgeIntent: handleBridgeIntent,
    settleBridge: handleSettleBridge,
};

/**
 * Initialize the DB sync service.
 * Connects to the IndexerListener and routes events to handlers.
 */
export function startDbSync(): void {
    const listener = getIndexerListener();

    listener.on('contract-event', async (event: ContractEvent) => {
        const handler = EVENT_HANDLERS[event.method];
        if (!handler) {
            console.log(`[SYNC] Unknown method: ${event.method}`);
            return;
        }

        try {
            await handler(event);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`[SYNC] Error processing ${event.method}:`, message);
        }
    });

    listener.start().catch(err => {
        console.error('[SYNC] Failed to start indexer listener:', err.message);
    });

    console.log('[SYNC] DB sync service initialized');
}

/**
 * Stop the DB sync service.
 */
export function stopDbSync(): void {
    const listener = getIndexerListener();
    listener.stop();
    console.log('[SYNC] DB sync service stopped');
}
