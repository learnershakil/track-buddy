/**
 * TrackBuddy -- Discipline Scoring Engine
 *
 * Calculates discipline scores, streaks, and performance metrics.
 * Pure computation — no external API dependencies.
 */

import { getDbClient } from '../db';

// ── Types ──

export interface ScoreInput {
    focusMinutes: number;
    distractionMinutes: number;
    sessionsCompleted: number;
    sessionsPlanned: number;
    violations: number;
    previousStreak: number;
    previousScores: number[];  // Last 7 daily scores
}

export interface ScoreResult {
    overallScore: number;       // 0-100
    focusScore: number;         // 0-100
    consistencyScore: number;   // 0-100
    currentStreak: number;
    longestStreak: number;
    trend: 'improving' | 'declining' | 'stable';
    grade: string;              // A+ to F
    breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
    focusWeight: number;
    consistencyWeight: number;
    violationPenalty: number;
    streakBonus: number;
    rawScore: number;
    adjustedScore: number;
}

// ── Score Weights ──

const WEIGHTS = {
    focus: 0.45,            // 45% — time spent focused
    consistency: 0.35,      // 35% — session completion rate
    violationPenalty: 5,    // -5 per violation
    streakBonus: {
        threshold: 3,       // Bonus kicks in at 3-day streak
        perDay: 1,          // +1 per streak day
        max: 10,            // Cap at +10 bonus
    },
    minimumPassingScore: 40,
};

// ── Scoring Engine ──

/**
 * Calculate daily discipline score from session data.
 */
export function calculateDisciplineScore(input: ScoreInput): ScoreResult {
    // Focus Score: ratio of focus to total time
    const totalTime = input.focusMinutes + input.distractionMinutes;
    const focusRatio = totalTime > 0
        ? input.focusMinutes / totalTime
        : 0;
    const focusScore = Math.round(focusRatio * 100);

    // Consistency Score: session completion rate
    const completionRate = input.sessionsPlanned > 0
        ? input.sessionsCompleted / input.sessionsPlanned
        : 1; // Perfect if nothing planned
    const consistencyScore = Math.round(completionRate * 100);

    // Weighted raw score
    const rawScore = Math.round(
        (focusScore * WEIGHTS.focus) +
        (consistencyScore * WEIGHTS.consistency) +
        ((100 - Math.min(focusScore, consistencyScore)) * (1 - WEIGHTS.focus - WEIGHTS.consistency)) // remaining weight from lower score
    );

    // Violation penalty
    const violationPenalty = input.violations * WEIGHTS.violationPenalty;

    // Streak bonus
    const streakBonus = input.previousStreak >= WEIGHTS.streakBonus.threshold
        ? Math.min(
            (input.previousStreak - WEIGHTS.streakBonus.threshold + 1) * WEIGHTS.streakBonus.perDay,
            WEIGHTS.streakBonus.max,
        )
        : 0;

    // Final adjusted score (clamped 0-100)
    const adjustedScore = clamp(rawScore - violationPenalty + streakBonus, 0, 100);

    // Streak calculation
    const isPassingDay = adjustedScore >= WEIGHTS.minimumPassingScore;
    const currentStreak = isPassingDay ? input.previousStreak + 1 : 0;
    const longestStreak = Math.max(currentStreak, input.previousStreak);

    // Trend analysis
    const allScores = [...input.previousScores, adjustedScore];
    const trend = calculateTrend(allScores);

    // Grade
    const grade = scoreToGrade(adjustedScore);

    return {
        overallScore: adjustedScore,
        focusScore,
        consistencyScore,
        currentStreak,
        longestStreak,
        trend,
        grade,
        breakdown: {
            focusWeight: WEIGHTS.focus,
            consistencyWeight: WEIGHTS.consistency,
            violationPenalty,
            streakBonus,
            rawScore,
            adjustedScore,
        },
    };
}

/**
 * Process and persist end-of-day scoring for a user.
 */
export async function processEndOfDayScore(userId: string): Promise<ScoreResult> {
    const db = getDbClient();

    // Get today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await db.sessionLog.findMany({
        where: {
            userId,
            startTime: { gte: today, lt: tomorrow },
        },
    });

    // Get today's violations
    const violations = await db.violation.findMany({
        where: {
            userId,
            occurredAt: { gte: today, lt: tomorrow },
        },
    });

    // Get previous scores for streak + trend
    const previousScores = await db.disciplineScore.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 7,
    });

    const lastScore = previousScores[0];
    const activeCommitment = await db.commitment.findFirst({
        where: { userId, status: 'ACTIVE' },
    });

    const input: ScoreInput = {
        focusMinutes: sessions.reduce((sum, s) => sum + s.focusMinutes, 0),
        distractionMinutes: sessions.reduce((sum, s) => sum + s.distractionMinutes, 0),
        sessionsCompleted: sessions.filter(s => s.isVerified).length,
        sessionsPlanned: activeCommitment ? Math.ceil(activeCommitment.duration / 60) : sessions.length,
        violations: violations.length,
        previousStreak: lastScore?.currentStreak || 0,
        previousScores: previousScores.map(s => s.overallScore).reverse(),
    };

    const result = calculateDisciplineScore(input);

    // Persist to database
    await db.disciplineScore.upsert({
        where: {
            userId_date: { userId, date: today },
        },
        update: {
            overallScore: result.overallScore,
            focusScore: result.focusScore,
            consistencyScore: result.consistencyScore,
            currentStreak: result.currentStreak,
            longestStreak: result.longestStreak,
        },
        create: {
            userId,
            date: today,
            overallScore: result.overallScore,
            focusScore: result.focusScore,
            consistencyScore: result.consistencyScore,
            currentStreak: result.currentStreak,
            longestStreak: result.longestStreak,
        },
    });

    console.log(`[SCORING] User ${userId}: ${result.overallScore}/100 (${result.grade}), streak: ${result.currentStreak}`);
    return result;
}

// ── Helpers ──

function calculateTrend(scores: number[]): 'improving' | 'declining' | 'stable' {
    if (scores.length < 3) return 'stable';

    const recent = scores.slice(-3);
    const earlier = scores.slice(0, -3);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.length > 0
        ? earlier.reduce((a, b) => a + b, 0) / earlier.length
        : recentAvg;

    const diff = recentAvg - earlierAvg;
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
}

function scoreToGrade(score: number): string {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 60) return 'D';
    return 'F';
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
