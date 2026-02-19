import { Router, Request, Response, NextFunction } from 'express';
import { successResponse, AppError } from '../utils';
import {
    getAlgoPrice,
    convertAlgoToInr,
    processBridgePayout,
    confirmPayout,
} from '../services/bridge';

const router = Router();

/**
 * GET /api/bridge/price
 * Get current ALGO/INR exchange rate.
 */
router.get('/price', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const price = await getAlgoPrice();
        res.json(successResponse(price));
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/bridge/convert
 * Convert ALGO amount to INR.
 * Query: ?amount=5
 */
router.get('/convert', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const amount = parseFloat(req.query.amount as string);
        if (!amount || amount <= 0) throw new AppError('amount must be positive', 400);

        const conversion = await convertAlgoToInr(amount);
        res.json(successResponse({
            algoAmount: amount,
            ...conversion,
        }));
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/bridge/payout
 * Initiate a bridge payout (ALGO -> UPI).
 */
router.post('/payout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bridgeId, algoAmount, userUpiId } = req.body;
        if (!bridgeId || !algoAmount || !userUpiId) {
            throw new AppError('bridgeId, algoAmount, userUpiId required', 400);
        }

        const result = await processBridgePayout({ bridgeId, algoAmount, userUpiId });
        const status = result.success ? 200 : 422;
        res.status(status).json(successResponse(result));
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/bridge/status/:id
 * Check bridge transaction status.
 */
router.get('/status/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { getDbClient } = await import('../db');
        const db = getDbClient();
        const bridge = await db.bridgeTransaction.findUnique({
            where: { id: req.params.id },
        });

        if (!bridge) throw new AppError('Bridge transaction not found', 404);
        res.json(successResponse(bridge));
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/bridge/webhook
 * Provider settlement callback.
 * Called when UPI payout completes.
 */
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bridgeId, providerReference, status } = req.body;

        if (status === 'completed' && bridgeId) {
            await confirmPayout(bridgeId, providerReference);
        }

        res.json(successResponse({ received: true }));
    } catch (err) {
        next(err);
    }
});

export default router;
