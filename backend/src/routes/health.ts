import { Router, Request, Response } from 'express';
import { successResponse } from '../utils';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint — confirms server is alive
 * and returns system status.
 */
router.get('/health', (_req: Request, res: Response) => {
    res.json(successResponse({
        status: 'healthy',
        service: 'trackbuddy-backend',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    }));
});

/**
 * GET /api/status
 * Extended status with module readiness checks.
 */
router.get('/status', (_req: Request, res: Response) => {
    res.json(successResponse({
        service: 'trackbuddy-backend',
        version: '1.0.0',
        modules: {
            database: 'initialized',
            algorand: 'pending',
            ai: 'pending',
            twilio: 'pending',
            bridge: 'pending',
        },
    }));
});

export default router;
