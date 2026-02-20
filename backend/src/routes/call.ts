import { Router, Request, Response, NextFunction } from 'express';
import { successResponse, AppError } from '../utils';
import {
    makeAccountabilityCall,
    triggerViolationCall,
    triggerEscalationCall,
    shouldTriggerCall,
} from '../services/call';
import { getDbClient } from '../db';

const router = Router();

/**
 * POST /api/call/trigger
 * Trigger a manual accountability call to a user.
 */
router.post('/trigger', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, message } = req.body;
        if (!userId) throw new AppError('userId required', 400);

        const db = getDbClient();
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);
        if (!user.phone) throw new AppError('User has no phone number', 400);

        const callMessage = message || `Hello ${user.name}. This is TrackBuddy. Time to check in on your commitment. Stay disciplined!`;
        const result = await makeAccountabilityCall(user.phone, callMessage);

        res.json(successResponse(result));
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/call/violation
 * Trigger an automated violation call.
 * Called internally by DB sync or manually via admin.
 */
router.post('/violation', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, commitmentId } = req.body;
        if (!userId || !commitmentId) throw new AppError('userId and commitmentId required', 400);

        const db = getDbClient();
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);
        if (!user.phone) throw new AppError('User has no phone number', 400);

        const commitment = await db.commitment.findUnique({
            where: { id: commitmentId },
            include: { violations: true },
        });
        if (!commitment) throw new AppError('Commitment not found', 404);

        const violationCount = commitment.violations.length;
        const callType = shouldTriggerCall(violationCount);

        if (!callType) {
            res.json(successResponse({ triggered: false, reason: 'Below call threshold' }));
            return;
        }

        const penaltyTotal = commitment.violations.reduce((sum, v) => sum + (v.penaltyAmount ?? 0), 0);

        if (callType === 'escalation') {
            const result = await triggerEscalationCall({
                userId: user.id,
                userName: user.name || 'User',
                phoneNumber: user.phone,
                commitmentTitle: commitment.title,
                violationCount,
                stakeAmount: commitment.stakeAmount,
                penaltyAmount: penaltyTotal,
            });
            res.json(successResponse({ triggered: true, type: 'escalation', ...result }));
        } else {
            const result = await triggerViolationCall({
                userId: user.id,
                userName: user.name || 'User',
                phoneNumber: user.phone,
                commitmentTitle: commitment.title,
                violationCount,
                stakeAmount: commitment.stakeAmount,
                penaltyAmount: penaltyTotal,
            });
            res.json(successResponse({ triggered: true, type: 'standard', result }));
        }
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/call/webhook
 * Twilio status callback webhook.
 * Receives call completion/failure events.
 */
router.post('/webhook', async (req: Request, res: Response) => {
    const { CallSid, CallStatus, CallDuration } = req.body;
    console.log(`[CALL-WEBHOOK] ${CallSid}: ${CallStatus} (${CallDuration}s)`);

    // Acknowledge immediately (Twilio requires 2xx)
    res.status(200).send('<Response></Response>');
});

export default router;
