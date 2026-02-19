/**
 * TrackBuddy -- Commitment Service
 *
 * Handles commitment creation, retrieval, and lifecycle management.
 * Bridges between database records and on-chain state.
 */

import { getDbClient } from '../db';
import {
    buildAppCallTxn,
    buildPaymentTxn,
    buildOptInTxn,
    getAppAddress,
    getAppId,
} from '../web3';
import algosdk from 'algosdk';
import * as crypto from 'crypto';

// ── Types ──

export interface CreateCommitmentInput {
    userId: string;
    title: string;
    description?: string;
    category: 'CODING' | 'STUDY' | 'GYM' | 'SLEEP' | 'GENERAL';
    duration: number;       // minutes
    stakeAmount: number;    // in ALGO (will convert to microAlgos)
    walletAddress: string;
}

export interface CommitmentResponse {
    id: string;
    title: string;
    category: string;
    stakeAmount: number;
    status: string;
    startTime: Date;
    // On-chain transaction details (unsigned, for wallet signing)
    unsignedTxns?: Array<{
        txnBase64: string;
        type: string;
    }>;
    appId: number;
    appAddress: string;
}

// ── Service Functions ──

/**
 * Create a new commitment with on-chain stake.
 *
 * Returns unsigned transactions for the user's wallet to sign.
 * The frontend/mobile app signs and submits; we record in DB.
 */
export async function createCommitment(
    input: CreateCommitmentInput
): Promise<CommitmentResponse> {
    const db = getDbClient();

    // Generate commitment hash (used on-chain)
    const commitmentData = JSON.stringify({
        title: input.title,
        category: input.category,
        duration: input.duration,
        timestamp: Date.now(),
    });
    const commitmentHash = crypto.createHash('sha256').update(commitmentData).digest();

    // Convert ALGO to microAlgos
    const microAlgos = Math.floor(input.stakeAmount * 1_000_000);

    // Build unsigned transactions for wallet signing
    const payTxn = await buildPaymentTxn(input.walletAddress, microAlgos);
    const appCallTxn = await buildAppCallTxn(
        input.walletAddress,
        [
            new Uint8Array(Buffer.from('createCommitment')),
            new Uint8Array(commitmentHash),
        ],
    );

    // Assign group ID for atomic execution
    const groupTxns = algosdk.assignGroupID([payTxn, appCallTxn]);

    // Store in database
    const commitment = await db.commitment.create({
        data: {
            userId: input.userId,
            title: input.title,
            description: input.description,
            category: input.category,
            duration: input.duration,
            stakeAmount: input.stakeAmount,
            startTime: new Date(),
            status: 'ACTIVE',
            appId: getAppId(),
        },
    });

    return {
        id: commitment.id,
        title: commitment.title,
        category: commitment.category,
        stakeAmount: commitment.stakeAmount,
        status: commitment.status,
        startTime: commitment.startTime,
        // Return unsigned txns for wallet to sign
        unsignedTxns: groupTxns.map((txn, i) => ({
            txnBase64: Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64'),
            type: i === 0 ? 'payment' : 'app_call',
        })),
        appId: getAppId(),
        appAddress: getAppAddress(),
    };
}

/**
 * List commitments for a user.
 */
export async function getUserCommitments(userId: string) {
    const db = getDbClient();

    return db.commitment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            sessionLogs: {
                select: {
                    id: true,
                    focusMinutes: true,
                    distractionMinutes: true,
                    isVerified: true,
                },
            },
            violations: {
                select: {
                    id: true,
                    type: true,
                    penaltyAmount: true,
                    occurredAt: true,
                },
            },
        },
    });
}

/**
 * Get a single commitment by ID.
 */
export async function getCommitmentById(id: string) {
    const db = getDbClient();

    return db.commitment.findUnique({
        where: { id },
        include: {
            user: {
                select: { id: true, name: true, walletAddress: true },
            },
            sessionLogs: true,
            violations: true,
        },
    });
}

/**
 * Update commitment status after on-chain confirmation.
 * Called by indexer listener or webhook.
 */
export async function updateCommitmentOnChain(
    commitmentId: string,
    txId: string,
) {
    const db = getDbClient();

    return db.commitment.update({
        where: { id: commitmentId },
        data: {
            onChainTxId: txId,
        },
    });
}

/**
 * Build opt-in transaction for a new user.
 * Must be called before createCommitment.
 */
export async function buildUserOptIn(walletAddress: string) {
    const optInTxn = await buildOptInTxn(walletAddress);
    return {
        txnBase64: Buffer.from(algosdk.encodeUnsignedTransaction(optInTxn)).toString('base64'),
        type: 'opt_in',
        appId: getAppId(),
    };
}
