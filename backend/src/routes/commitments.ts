import { Router, Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils';
import { AppError } from '../utils';
import {
    createCommitment,
    getUserCommitments,
    getCommitmentById,
    updateCommitmentOnChain,
    buildUserOptIn,
} from '../services/commitment';

const router = Router();

/**
 * POST /api/commitments
 * Create a new commitment with on-chain stake.
 * Returns unsigned transactions for wallet signing.
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, title, description, category, duration, stakeAmount, walletAddress } = req.body;

        if (!userId || !title || !category || !duration || !stakeAmount || !walletAddress) {
            throw new AppError('Missing required fields: userId, title, category, duration, stakeAmount, walletAddress', 400);
        }

        if (stakeAmount <= 0) {
            throw new AppError('stakeAmount must be greater than 0', 400);
        }

        const result = await createCommitment({
            userId,
            title,
            description,
            category,
            duration,
            stakeAmount,
            walletAddress,
        });

        res.status(201).json(successResponse(result));
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/commitments
 * List commitments for a user.
 * Query: ?userId=xxx
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) {
            throw new AppError('userId query parameter required', 400);
        }

        const commitments = await getUserCommitments(userId);
        res.json(successResponse(commitments));
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/commitments/:id
 * Get commitment detail by ID.
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const commitment = await getCommitmentById(req.params.id);
        if (!commitment) {
            throw new AppError('Commitment not found', 404);
        }
        res.json(successResponse(commitment));
    } catch (err) {
        next(err);
    }
});

/**
 * PATCH /api/commitments/:id/confirm
 * Confirm on-chain transaction for a commitment.
 * Called after wallet signs and submits the txns.
 */
router.patch('/:id/confirm', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { txId } = req.body;
        if (!txId) {
            throw new AppError('txId required', 400);
        }

        const updated = await updateCommitmentOnChain(req.params.id, txId);
        res.json(successResponse(updated));
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/commitments/opt-in
 * Build opt-in transaction for a new user.
 * Must be called before creating first commitment.
 */
router.post('/opt-in', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            throw new AppError('walletAddress required', 400);
        }

        const result = await buildUserOptIn(walletAddress);
        res.json(successResponse(result));
    } catch (err) {
        next(err);
    }
});

export default router;
