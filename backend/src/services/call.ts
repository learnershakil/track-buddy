/**
 * TrackBuddy -- Twilio Voice Call Service
 *
 * Integrates Twilio Programmable Voice for accountability calls.
 * Automated calls are triggered on commitment violations.
 */

import { config } from '../config';

// ── Types ──

export interface CallResult {
    callSid: string;
    status: string;
    to: string;
    from: string;
    duration?: number;
}

export interface ViolationCallInput {
    userId: string;
    userName: string;
    phoneNumber: string;
    commitmentTitle: string;
    violationCount: number;
    stakeAmount: number;
    penaltyAmount: number;
}

// ── Twilio Client ──

let twilioClient: {
    calls: {
        create: (opts: Record<string, unknown>) => Promise<Record<string, unknown>>;
    };
} | null = null;

/**
 * Lazy-initialize Twilio client.
 * Returns null if credentials aren't configured (dev mode).
 */
function getClient(): typeof twilioClient {
    if (!config.twilio.accountSid || !config.twilio.authToken) {
        return null;
    }

    if (!twilioClient) {
        // Dynamic import to avoid hard dependency
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const twilio = require('twilio');
            twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
        } catch {
            console.log('[CALL] Twilio SDK not installed, calls disabled');
            return null;
        }
    }
    return twilioClient;
}

// ── Call Service ──

/**
 * Make an accountability call to a user.
 * Uses TwiML to deliver a voice message.
 */
export async function makeAccountabilityCall(
    phoneNumber: string,
    message: string,
): Promise<CallResult | null> {
    const client = getClient();
    if (!client) {
        console.log(`[CALL] Simulated call to ${phoneNumber}: ${message}`);
        return {
            callSid: `SIM_${Date.now()}`,
            status: 'simulated',
            to: phoneNumber,
            from: config.twilio.phoneNumber || '+1000000000',
        };
    }

    const twiml = `<Response><Say voice="alice">${escapeXml(message)}</Say></Response>`;

    const call = await client.calls.create({
        twiml,
        to: phoneNumber,
        from: config.twilio.phoneNumber,
        statusCallback: config.twilio.webhookUrl,
        statusCallbackEvent: ['completed', 'failed', 'no-answer'],
    }) as Record<string, unknown>;

    return {
        callSid: call.sid as string,
        status: call.status as string,
        to: phoneNumber,
        from: config.twilio.phoneNumber,
    };
}

/**
 * Make a call using a webhook URL for dynamic TwiML.
 */
export async function makeWebhookCall(
    phoneNumber: string,
    webhookUrl: string,
): Promise<CallResult | null> {
    const client = getClient();
    if (!client) {
        console.log(`[CALL] Simulated webhook call to ${phoneNumber}`);
        return {
            callSid: `SIM_${Date.now()}`,
            status: 'simulated',
            to: phoneNumber,
            from: config.twilio.phoneNumber || '+1000000000',
        };
    }

    const call = await client.calls.create({
        url: webhookUrl,
        to: phoneNumber,
        from: config.twilio.phoneNumber,
        statusCallback: config.twilio.webhookUrl,
    }) as Record<string, unknown>;

    return {
        callSid: call.sid as string,
        status: call.status as string,
        to: phoneNumber,
        from: config.twilio.phoneNumber,
    };
}

// ── Violation Trigger ──

/**
 * Trigger an automated accountability call on violation.
 * Called by the DB sync service when applyPenalty is detected.
 */
export async function triggerViolationCall(
    input: ViolationCallInput,
): Promise<CallResult | null> {
    const message = buildViolationMessage(input);
    console.log(`[CALL] Triggering violation call for ${input.userName}`);

    const result = await makeAccountabilityCall(input.phoneNumber, message);

    // Log call attempt
    if (result) {
        console.log(`[CALL] Call ${result.callSid} -> ${result.to} (${result.status})`);
    }

    return result;
}

/**
 * Trigger an escalation call when violations exceed threshold.
 * More urgent tone than standard violation call.
 */
export async function triggerEscalationCall(
    input: ViolationCallInput,
    partnerPhone?: string,
): Promise<{ userCall: CallResult | null; partnerCall: CallResult | null }> {
    // Call the user
    const escalationMessage = buildEscalationMessage(input);
    const userCall = await makeAccountabilityCall(input.phoneNumber, escalationMessage);

    // Also call accountability partner if configured
    let partnerCall: CallResult | null = null;
    if (partnerPhone) {
        const partnerMessage = `Hello, this is TrackBuddy. Your accountability partner ${input.userName} has ${input.violationCount} violations on their commitment: ${input.commitmentTitle}. They may need your support. Thank you.`;
        partnerCall = await makeAccountabilityCall(partnerPhone, partnerMessage);
    }

    return { userCall, partnerCall };
}

/**
 * Check if a violation warrants an automated call.
 * Returns the call type or null if no call needed.
 */
export function shouldTriggerCall(
    violationCount: number,
): 'standard' | 'escalation' | null {
    if (violationCount >= 5) return 'escalation';
    if (violationCount >= 2) return 'standard';
    return null; // First violation: just a notification
}

// ── Message Builders ──

function buildViolationMessage(input: ViolationCallInput): string {
    return `Hello ${input.userName}. This is TrackBuddy, your accountability system. `
        + `You have missed a session for your commitment: ${input.commitmentTitle}. `
        + `This is violation number ${input.violationCount}. `
        + `A penalty of ${input.penaltyAmount} ALGO has been deducted from your stake of ${input.stakeAmount} ALGO. `
        + `Please get back on track. Your discipline defines your future. Goodbye.`;
}

function buildEscalationMessage(input: ViolationCallInput): string {
    return `Hello ${input.userName}. This is an urgent call from TrackBuddy. `
        + `You now have ${input.violationCount} violations on your commitment: ${input.commitmentTitle}. `
        + `Your remaining stake is at serious risk. `
        + `A total of ${input.penaltyAmount} ALGO has been deducted so far. `
        + `This is your escalation warning. Please take immediate action to resume your commitment. `
        + `Your accountability partner has also been notified. Goodbye.`;
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
