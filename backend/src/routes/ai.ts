import { Router, Request, Response, NextFunction } from 'express';
import { successResponse, AppError } from '../utils';
import {
    analyzeDiscipline,
    generateDailySummary,
    predictRisk,
    calculateTrend,
    DisciplineAnalysisInput,
} from '../services/ai';
import { getDbClient } from '../db';

const router = Router();

/**
 * POST /api/ai/analyze
 * Generate a full discipline analysis report for a user.
 */
router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, commitmentId } = req.body;
        if (!userId) throw new AppError('userId required', 400);

        const db = getDbClient();

        // Gather data
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);

        const commitment = commitmentId
            ? await db.commitment.findUnique({
                where: { id: commitmentId },
                include: { sessionLogs: true, violations: true },
            })
            : await db.commitment.findFirst({
                where: { userId, status: 'ACTIVE' },
                include: { sessionLogs: true, violations: true },
                orderBy: { createdAt: 'desc' },
            });

        // Get discipline scores
        const scores = await db.disciplineScore.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 7,
        });

        const sessions = commitment?.sessionLogs || [];
        const completedSessions = sessions.filter(s => s.isVerified).length;

        const input: DisciplineAnalysisInput = {
            userName: user.name || 'User',
            commitmentTitle: commitment?.title || 'General',
            category: commitment?.category || 'GENERAL',
            totalSessions: sessions.length,
            completedSessions,
            missedSessions: sessions.length - completedSessions,
            averageFocusMinutes: sessions.length > 0
                ? sessions.reduce((sum, s) => sum + s.focusMinutes, 0) / sessions.length
                : 0,
            averageDistractionMinutes: sessions.length > 0
                ? sessions.reduce((sum, s) => sum + s.distractionMinutes, 0) / sessions.length
                : 0,
            violations: commitment?.violations?.length || 0,
            currentStreak: scores.length > 0 ? (scores[0]?.currentStreak || 0) : 0,
            disciplineScores: scores.map(s => s.overallScore).reverse(),
        };

        const report = await analyzeDiscipline(input);
        res.json(successResponse(report));
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/ai/predict
 * Predict risk of commitment failure.
 */
router.post('/predict', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, commitmentId } = req.body;
        if (!userId) throw new AppError('userId required', 400);

        const db = getDbClient();
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);

        const commitment = commitmentId
            ? await db.commitment.findUnique({
                where: { id: commitmentId },
                include: { sessionLogs: true, violations: true },
            })
            : await db.commitment.findFirst({
                where: { userId, status: 'ACTIVE' },
                include: { sessionLogs: true, violations: true },
                orderBy: { createdAt: 'desc' },
            });

        const scores = await db.disciplineScore.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 7,
        });

        const sessions = commitment?.sessionLogs || [];
        const completedSessions = sessions.filter(s => s.isVerified).length;

        const input: DisciplineAnalysisInput = {
            userName: user.name || 'User',
            commitmentTitle: commitment?.title || 'General',
            category: commitment?.category || 'GENERAL',
            totalSessions: sessions.length,
            completedSessions,
            missedSessions: sessions.length - completedSessions,
            averageFocusMinutes: sessions.length > 0
                ? sessions.reduce((sum, s) => sum + s.focusMinutes, 0) / sessions.length
                : 0,
            averageDistractionMinutes: sessions.length > 0
                ? sessions.reduce((sum, s) => sum + s.distractionMinutes, 0) / sessions.length
                : 0,
            violations: commitment?.violations?.length || 0,
            currentStreak: scores.length > 0 ? (scores[0]?.currentStreak || 0) : 0,
            disciplineScores: scores.map(s => s.overallScore).reverse(),
        };

        const prediction = await predictRisk(input);
        res.json(successResponse(prediction));
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/ai/summary
 * Quick daily discipline summary.
 */
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) throw new AppError('userId required', 400);

        const db = getDbClient();
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayScore = await db.disciplineScore.findUnique({
            where: { userId_date: { userId, date: today } },
        });

        const scores = await db.disciplineScore.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 7,
        });

        const completionRate = await calculateCompletionRate(db, userId);
        const trend = calculateTrend(scores.map(s => s.overallScore).reverse());

        const summary = await generateDailySummary(
            user.name || 'User',
            todayScore?.overallScore || 0,
            todayScore?.currentStreak || 0,
            completionRate,
        );

        res.json(successResponse({ summary, trend, todayScore: todayScore?.overallScore || 0 }));
    } catch (err) {
        next(err);
    }
});

// Helper
async function calculateCompletionRate(db: ReturnType<typeof getDbClient>, userId: string): Promise<number> {
    const total = await db.commitment.count({ where: { userId } });
    if (total === 0) return 100;
    const completed = await db.commitment.count({ where: { userId, status: 'COMPLETED' } });
    return Math.round((completed / total) * 100);
}

export default router;
