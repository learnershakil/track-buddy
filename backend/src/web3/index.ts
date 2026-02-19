/**
 * TrackBuddy -- Algorand Integration Service
 *
 * Provides algosdk client setup, signer configuration,
 * and contract call helpers for the backend.
 *
 * All on-chain interactions go through this module.
 */

import algosdk from 'algosdk';
import { config } from '../config';
import * as fs from 'fs';
import * as path from 'path';

// ── Algorand Client Instances ──

let algodClient: algosdk.Algodv2;
let indexerClient: algosdk.Indexer;

/**
 * Get singleton Algod client for transaction submission.
 */
export function getAlgodClient(): algosdk.Algodv2 {
    if (!algodClient) {
        algodClient = new algosdk.Algodv2(
            config.algorand.algodToken,
            config.algorand.algodUrl,
            ''
        );
    }
    return algodClient;
}

/**
 * Get singleton Indexer client for on-chain queries.
 */
export function getIndexerClient(): algosdk.Indexer {
    if (!indexerClient) {
        indexerClient = new algosdk.Indexer(
            '',
            config.algorand.indexerUrl,
            ''
        );
    }
    return indexerClient;
}

// ── Account Helpers ──

/**
 * Derive account from mnemonic.
 * Used for backend admin operations (verify, penalty, settle).
 */
export function getAdminAccount(): algosdk.Account {
    if (!config.algorand.mnemonic) {
        throw new Error('ALGO_MNEMONIC not configured');
    }
    return algosdk.mnemonicToSecretKey(config.algorand.mnemonic);
}

/**
 * Get the deployed contract App ID.
 */
export function getAppId(): number {
    const appId = config.algorand.appId;
    if (!appId || appId === 0) {
        throw new Error('ALGO_APP_ID not configured -- deploy contract first');
    }
    return appId;
}

/**
 * Get the application address (escrow) for payment transactions.
 */
export function getAppAddress(): string {
    return algosdk.getApplicationAddress(getAppId());
}

// ── Contract Call Helpers ──

/**
 * Build a NoOp app call transaction.
 */
export async function buildAppCallTxn(
    sender: string,
    appArgs: Uint8Array[],
    accounts?: string[],
): Promise<algosdk.Transaction> {
    const algod = getAlgodClient();
    const params = await algod.getTransactionParams().do();

    return algosdk.makeApplicationNoOpTxnFromObject({
        from: sender,
        suggestedParams: params,
        appIndex: getAppId(),
        appArgs,
        accounts,
    });
}

/**
 * Build a payment transaction (for stake/bridge payments).
 */
export async function buildPaymentTxn(
    sender: string,
    amount: number,
): Promise<algosdk.Transaction> {
    const algod = getAlgodClient();
    const params = await algod.getTransactionParams().do();

    return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: sender,
        to: getAppAddress(),
        amount,
        suggestedParams: params,
    });
}

/**
 * Build an opt-in transaction for a user.
 */
export async function buildOptInTxn(
    sender: string,
): Promise<algosdk.Transaction> {
    const algod = getAlgodClient();
    const params = await algod.getTransactionParams().do();

    return algosdk.makeApplicationOptInTxnFromObject({
        from: sender,
        suggestedParams: params,
        appIndex: getAppId(),
    });
}

/**
 * Sign and submit a transaction using admin account.
 * Used for backend-initiated calls (verifySession, applyPenalty, etc.).
 */
export async function signAndSubmitAdmin(
    txn: algosdk.Transaction
): Promise<{ txId: string; confirmedRound: number }> {
    const algod = getAlgodClient();
    const admin = getAdminAccount();

    const signed = txn.signTxn(admin.sk);
    const { txid } = await algod.sendRawTransaction(signed).do();

    const result = await algosdk.waitForConfirmation(algod, txid, 4);
    return {
        txId: txid,
        confirmedRound: Number(result['confirmed-round']),
    };
}

/**
 * Sign and submit an atomic group using admin account.
 */
export async function signAndSubmitGroupAdmin(
    txns: algosdk.Transaction[]
): Promise<{ txId: string; confirmedRound: number }> {
    const algod = getAlgodClient();
    const admin = getAdminAccount();

    algosdk.assignGroupID(txns);
    const signed = txns.map(txn => txn.signTxn(admin.sk));
    const { txid } = await algod.sendRawTransaction(signed).do();

    const result = await algosdk.waitForConfirmation(algod, txid, 4);
    return {
        txId: txid,
        confirmedRound: Number(result['confirmed-round']),
    };
}

/**
 * Read local state for a user on the discipline contract.
 */
export async function readUserState(userAddress: string): Promise<Record<string, unknown>> {
    const algod = getAlgodClient();
    const appId = getAppId();

    const info = await algod.accountApplicationInformation(userAddress, appId).do();
    const localState = info['app-local-state']?.['key-value'] || [];

    const state: Record<string, unknown> = {};
    for (const item of localState) {
        const key = Buffer.from(item.key, 'base64').toString();
        if (item.value.type === 1) {
            state[key] = Buffer.from(item.value.bytes, 'base64').toString('hex');
        } else {
            state[key] = item.value.uint;
        }
    }
    return state;
}

/**
 * Read global state of the discipline contract.
 */
export async function readGlobalState(): Promise<Record<string, unknown>> {
    const algod = getAlgodClient();
    const appId = getAppId();

    const info = await algod.getApplicationByID(appId).do();
    const globalState = info['params']['global-state'] || [];

    const state: Record<string, unknown> = {};
    for (const item of globalState) {
        const key = Buffer.from(item.key, 'base64').toString();
        if (item.value.type === 1) {
            state[key] = Buffer.from(item.value.bytes, 'base64').toString('hex');
        } else {
            state[key] = item.value.uint;
        }
    }
    return state;
}

/**
 * Load compiled TEAL from contract artifacts.
 */
export function loadContractArtifacts(): { approval: string; clear: string; metadata: Record<string, unknown> } {
    const artifactsDir = path.resolve(__dirname, '..', '..', '..', 'contracts', 'artifacts');

    return {
        approval: fs.readFileSync(path.join(artifactsDir, 'approval.teal'), 'utf-8'),
        clear: fs.readFileSync(path.join(artifactsDir, 'clear.teal'), 'utf-8'),
        metadata: JSON.parse(fs.readFileSync(path.join(artifactsDir, 'contract.json'), 'utf-8')),
    };
}
