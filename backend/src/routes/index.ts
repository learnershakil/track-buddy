import { Router } from 'express';
import healthRoutes from './health';
import commitmentRoutes from './commitments';
import sessionRoutes from './sessions';
import aiRoutes from './ai';
import bridgeRoutes from './bridge';
import callRoutes from './call';

/**
 * Central route aggregator.
 * All API routes are mounted here under /api prefix.
 */
const router = Router();

router.use('/', healthRoutes);
router.use('/commitments', commitmentRoutes);
router.use('/sessions', sessionRoutes);
router.use('/ai', aiRoutes);
router.use('/bridge', bridgeRoutes);
router.use('/call', callRoutes);

export default router;
