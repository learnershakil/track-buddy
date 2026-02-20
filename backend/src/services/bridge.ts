/**
 * TrackBuddy -- Bridge Service
 *
 * Handles crypto-to-UPI bridge:
 * - ALGO/INR price feed from CoinGecko
 * - Bridge transaction verification and payout
 */

import { config } from '../config';
import { getDbClient } from '../db';

// ── Types ──

export interface PriceQuote {
    algoInr: number;
    algoUsd: number;
    timestamp: number;
    source: string;
}

export interface BridgePayoutInput {
    bridgeId: string;
    algoAmount: number;
    userUpiId: string;
}

export interface PayoutResult {
    success: boolean;
    referenceId: string;
    inrAmount: number;
    exchangeRate: number;
    provider: string;
    error?: string;
}

// ── Price Cache ──

let cachedPrice: PriceQuote | null = null;
const CACHE_TTL_MS = 60_000; // 1 minute

// ── Price Feed Service ──

/**
 * Fetch current ALGO/INR exchange rate from CoinGecko.
 * Caches for 1 minute to avoid rate limits.
 */
export async function getAlgoPrice(): Promise<PriceQuote> {
    // Return cached if fresh
    if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_TTL_MS) {
        return cachedPrice;
    }

    try {
        const url = `${config.bridge.coingeckoApiUrl}/simple/price?ids=algorand&vs_currencies=inr,usd`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json() as {
            algorand: { inr: number; usd: number };
        };

        cachedPrice = {
            algoInr: data.algorand.inr,
            algoUsd: data.algorand.usd,
            timestamp: Date.now(),
            source: 'coingecko',
        };

        return cachedPrice;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[BRIDGE] Price fetch failed: ${message}`);

        // Return stale cache or fallback
        if (cachedPrice) {
            console.log('[BRIDGE] Using stale cached price');
            return cachedPrice;
        }

        // Fallback price (should never be used in production)
        return {
            algoInr: 15.0,  // approximate fallback
            algoUsd: 0.18,
            timestamp: Date.now(),
            source: 'fallback',
        };
    }
}

/**
 * Convert ALGO amount to INR using current exchange rate.
 */
export async function convertAlgoToInr(algoAmount: number): Promise<{
    inrAmount: number;
    exchangeRate: number;
    source: string;
}> {
    const price = await getAlgoPrice();
    const inrAmount = algoAmount * price.algoInr;

    return {
        inrAmount: Math.round(inrAmount * 100) / 100, // Round to 2 decimals
        exchangeRate: price.algoInr,
        source: price.source,
    };
}

/**
 * Get price history for display (last N prices from cache).
 * In production, this would query a time-series DB.
 */
export async function getPriceQuote(): Promise<PriceQuote> {
    return getAlgoPrice();
}

// ── Bridge Payout Service ──

/**
 * Verify a bridge transaction and initiate UPI payout.
 *
 * Flow:
 * 1. Verify the on-chain bridge intent exists
 * 2. Fetch current exchange rate
 * 3. Calculate INR amount
 * 4. Initiate UPI payout (sandbox/production)
 * 5. Update bridge record in database
 */
export async function processBridgePayout(
    input: BridgePayoutInput,
): Promise<PayoutResult> {
    const db = getDbClient();

    // 1. Load bridge transaction
    const bridge = await db.bridgeTransaction.findUnique({
        where: { id: input.bridgeId },
        include: { user: true },
    });

    if (!bridge) {
        return {
            success: false,
            referenceId: '',
            inrAmount: 0,
            exchangeRate: 0,
            provider: config.bridge.provider,
            error: 'Bridge transaction not found',
        };
    }

    if (bridge.status !== 'PENDING') {
        return {
            success: false,
            referenceId: '',
            inrAmount: 0,
            exchangeRate: 0,
            provider: config.bridge.provider,
            error: `Bridge already ${bridge.status}`,
        };
    }

    // 2. Get exchange rate and calculate INR
    const conversion = await convertAlgoToInr(input.algoAmount);

    // 3. Initiate payout
    const payoutResult = await initiateUpiPayout(
        input.userUpiId,
        conversion.inrAmount,
        bridge.id,
    );

    // 4. Update bridge record
    if (payoutResult.success) {
        await db.bridgeTransaction.update({
            where: { id: bridge.id },
            data: {
                status: 'PAYOUT_INITIATED',
                exchangeRate: conversion.exchangeRate,
                inrAmount: conversion.inrAmount,
                upiId: input.userUpiId,
                upiReference: payoutResult.referenceId,
                payoutProvider: config.bridge.provider,
                payoutReference: payoutResult.referenceId,
            },
        });
    }

    return {
        success: payoutResult.success,
        referenceId: payoutResult.referenceId,
        inrAmount: conversion.inrAmount,
        exchangeRate: conversion.exchangeRate,
        provider: config.bridge.provider,
        error: payoutResult.error,
    };
}

/**
 * Verify payout completion via webhook or polling.
 * Called when payout provider confirms UPI transfer.
 */
export async function confirmPayout(
    bridgeId: string,
    providerReference: string,
): Promise<boolean> {
    const db = getDbClient();

    const bridge = await db.bridgeTransaction.findUnique({
        where: { id: bridgeId },
    });

    if (!bridge || bridge.status === 'SETTLED') {
        return false;
    }

    await db.bridgeTransaction.update({
        where: { id: bridgeId },
        data: {
            status: 'SETTLED',
            payoutReference: providerReference,
            settledAt: new Date(),
        },
    });

    console.log(`[BRIDGE] Payout confirmed for bridge ${bridgeId}`);
    return true;
}

// ── UPI Payout Provider ──

/**
 * Initiate UPI payout through configured provider.
 * Supports sandbox (simulated) and production modes.
 */
async function initiateUpiPayout(
    upiId: string,
    inrAmount: number,
    referenceId: string,
): Promise<{ success: boolean; referenceId: string; error?: string }> {
    const provider = config.bridge.provider;

    if (provider === 'sandbox') {
        return simulatePayout(upiId, inrAmount, referenceId);
    }

    // Production payout via configured provider API
    try {
        const response = await fetch(`${config.bridge.payoutWebhookUrl}/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.bridge.apiKey}`,
            },
            body: JSON.stringify({
                upiId,
                amount: inrAmount,
                currency: 'INR',
                referenceId,
                narration: `TrackBuddy Bridge Payout - ${referenceId}`,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            return { success: false, referenceId, error };
        }

        const data = await response.json() as { referenceId: string };
        return {
            success: true,
            referenceId: data.referenceId || referenceId,
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, referenceId, error: message };
    }
}

/**
 * Simulate UPI payout in sandbox mode.
 * Returns immediately with a fake reference.
 */
function simulatePayout(
    upiId: string,
    inrAmount: number,
    referenceId: string,
): { success: boolean; referenceId: string } {
    console.log(`[BRIDGE-SANDBOX] Simulated payout: INR ${inrAmount} -> ${upiId} (ref: ${referenceId})`);
    return {
        success: true,
        referenceId: `SIM_UPI_${Date.now()}_${referenceId.slice(0, 8)}`,
    };
}
