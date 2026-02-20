/**
 * TrackBuddy -- UPI Payout Provider Sandbox
 *
 * Simulates UPI payout operations for development and testing.
 * Mimics real provider behavior: delays, statuses, webhooks,
 * occasional failures for resilience testing.
 */

import { getDbClient } from '../db';
import { config } from '../config';

// ── Types ──

export interface SandboxPayoutRequest {
    upiId: string;
    amount: number;          // INR
    referenceId: string;
    narration?: string;
}

export interface SandboxPayoutResponse {
    success: boolean;
    transactionId: string;
    status: 'INITIATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    upiId: string;
    amount: number;
    referenceId: string;
    estimatedCompletion: Date;
    error?: string;
}

export interface SandboxWebhookPayload {
    event: 'payout.completed' | 'payout.failed' | 'payout.reversed';
    transactionId: string;
    referenceId: string;
    status: string;
    amount: number;
    upiId: string;
    completedAt: string;
    utrNumber: string;     // UPI Transaction Reference
}

// ── Sandbox State ──

const pendingPayouts = new Map<string, {
    request: SandboxPayoutRequest;
    transactionId: string;
    status: string;
    createdAt: Date;
}>();

// ── Sandbox Provider ──

/**
 * Initiate a simulated UPI payout.
 * Simulates real provider behavior with async settlement.
 */
export async function initiateSandboxPayout(
    request: SandboxPayoutRequest,
): Promise<SandboxPayoutResponse> {
    // Validate UPI ID format
    if (!isValidUpiId(request.upiId)) {
        return {
            success: false,
            transactionId: '',
            status: 'FAILED',
            upiId: request.upiId,
            amount: request.amount,
            referenceId: request.referenceId,
            estimatedCompletion: new Date(),
            error: 'Invalid UPI ID format',
        };
    }

    // Simulate provider-side validation
    if (request.amount <= 0 || request.amount > 100000) {
        return {
            success: false,
            transactionId: '',
            status: 'FAILED',
            upiId: request.upiId,
            amount: request.amount,
            referenceId: request.referenceId,
            estimatedCompletion: new Date(),
            error: request.amount <= 0 ? 'Amount must be positive' : 'Amount exceeds daily limit (₹1,00,000)',
        };
    }

    const transactionId = generateTransactionId();

    // Store in sandbox state
    pendingPayouts.set(transactionId, {
        request,
        transactionId,
        status: 'INITIATED',
        createdAt: new Date(),
    });

    // Schedule async settlement (simulates real-world delay)
    scheduleSettlement(transactionId, request.referenceId);

    return {
        success: true,
        transactionId,
        status: 'INITIATED',
        upiId: request.upiId,
        amount: request.amount,
        referenceId: request.referenceId,
        estimatedCompletion: new Date(Date.now() + 5000),
    };
}

/**
 * Check sandbox payout status.
 */
export function getSandboxPayoutStatus(transactionId: string): SandboxPayoutResponse | null {
    const payout = pendingPayouts.get(transactionId);
    if (!payout) return null;

    return {
        success: true,
        transactionId: payout.transactionId,
        status: payout.status as SandboxPayoutResponse['status'],
        upiId: payout.request.upiId,
        amount: payout.request.amount,
        referenceId: payout.request.referenceId,
        estimatedCompletion: new Date(payout.createdAt.getTime() + 5000),
    };
}

/**
 * List all sandbox payouts (for debugging).
 */
export function listSandboxPayouts(): SandboxPayoutResponse[] {
    const results: SandboxPayoutResponse[] = [];
    for (const [, payout] of pendingPayouts) {
        results.push({
            success: true,
            transactionId: payout.transactionId,
            status: payout.status as SandboxPayoutResponse['status'],
            upiId: payout.request.upiId,
            amount: payout.request.amount,
            referenceId: payout.request.referenceId,
            estimatedCompletion: new Date(payout.createdAt.getTime() + 5000),
        });
    }
    return results;
}

/**
 * Reset sandbox state (for testing).
 */
export function resetSandbox(): void {
    pendingPayouts.clear();
    console.log('[SANDBOX] Reset complete');
}

// ── Settlement Simulation ──

/**
 * Simulate async settlement with configurable failure rate.
 * 90% success, 10% failure in sandbox mode.
 */
function scheduleSettlement(transactionId: string, bridgeReferenceId: string): void {
    const SETTLEMENT_DELAY_MS = 3000 + Math.random() * 4000; // 3-7 seconds

    // Phase 1: PROCESSING (after 1s)
    setTimeout(() => {
        const payout = pendingPayouts.get(transactionId);
        if (payout) {
            payout.status = 'PROCESSING';
            console.log(`[SANDBOX] Payout ${transactionId} -> PROCESSING`);
        }
    }, 1000);

    // Phase 2: COMPLETED or FAILED (after 3-7s)
    setTimeout(async () => {
        const payout = pendingPayouts.get(transactionId);
        if (!payout) return;

        const isSuccess = Math.random() > 0.1; // 90% success rate

        if (isSuccess) {
            payout.status = 'COMPLETED';
            const utrNumber = generateUtrNumber();

            console.log(`[SANDBOX] Payout ${transactionId} -> COMPLETED (UTR: ${utrNumber})`);

            // Fire webhook callback
            await fireWebhook({
                event: 'payout.completed',
                transactionId,
                referenceId: bridgeReferenceId,
                status: 'completed',
                amount: payout.request.amount,
                upiId: payout.request.upiId,
                completedAt: new Date().toISOString(),
                utrNumber,
            });
        } else {
            payout.status = 'FAILED';
            console.log(`[SANDBOX] Payout ${transactionId} -> FAILED (simulated)`);

            await fireWebhook({
                event: 'payout.failed',
                transactionId,
                referenceId: bridgeReferenceId,
                status: 'failed',
                amount: payout.request.amount,
                upiId: payout.request.upiId,
                completedAt: new Date().toISOString(),
                utrNumber: '',
            });
        }
    }, SETTLEMENT_DELAY_MS);
}

/**
 * Fire a simulated webhook callback to the bridge webhook endpoint.
 */
async function fireWebhook(payload: SandboxWebhookPayload): Promise<void> {
    const webhookUrl = config.bridge.payoutWebhookUrl || 'http://localhost:3000/api/bridge/webhook';

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bridgeId: payload.referenceId,
                providerReference: payload.utrNumber || payload.transactionId,
                event: payload.event,
                status: payload.status,
                amount: payload.amount,
                upiId: payload.upiId,
                completedAt: payload.completedAt,
                utrNumber: payload.utrNumber,
            }),
        });

        if (response.ok) {
            console.log(`[SANDBOX] Webhook fired -> ${webhookUrl} (${payload.event})`);
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[SANDBOX] Webhook failed: ${message}`);
    }
}

// ── Helpers ──

function isValidUpiId(upiId: string): boolean {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId);
}

function generateTransactionId(): string {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 8);
    return `SBX_${ts}_${rand}`.toUpperCase();
}

function generateUtrNumber(): string {
    return `UTR${Date.now()}${Math.floor(Math.random() * 10000)}`;
}
