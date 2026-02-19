/**
 * TrackBuddy -- OpenAI Discipline Analysis Service
 *
 * Uses GPT-4 to analyze user productivity data and generate
 * discipline reports with actionable insights.
 */

import OpenAI from 'openai';
import { config } from '../config';

// ── Client ──

let openaiClient: OpenAI;

function getClient(): OpenAI {
    if (!openaiClient) {
        if (!config.openai.apiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }
        openaiClient = new OpenAI({ apiKey: config.openai.apiKey });
    }
    return openaiClient;
}

// ── Types ──

export interface DisciplineAnalysisInput {
    userName: string;
    commitmentTitle: string;
    category: string;
    totalSessions: number;
    completedSessions: number;
    missedSessions: number;
    averageFocusMinutes: number;
    averageDistractionMinutes: number;
    violations: number;
    currentStreak: number;
    disciplineScores: number[];  // Last 7 days
}

export interface DisciplineReport {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    overallGrade: string;       // A+ to F
    motivationalMessage: string;
}

export interface RiskPrediction {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskScore: number;          // 0-100
    factors: string[];
    prediction: string;
    preventiveActions: string[];
}

// ── Analysis Service ──

/**
 * Generate a discipline analysis report from user data.
 */
export async function analyzeDiscipline(
    input: DisciplineAnalysisInput
): Promise<DisciplineReport> {
    const client = getClient();

    const prompt = `You are a discipline coach AI for TrackBuddy, an accountability app.
Analyze this user's productivity data and provide a structured discipline report.

User: ${input.userName}
Commitment: ${input.commitmentTitle} (${input.category})
Sessions: ${input.completedSessions}/${input.totalSessions} completed, ${input.missedSessions} missed
Avg Focus: ${input.averageFocusMinutes} min/session
Avg Distraction: ${input.averageDistractionMinutes} min/session
Violations: ${input.violations}
Current Streak: ${input.currentStreak} days
Last 7 days scores: ${input.disciplineScores.join(', ')}

Respond in this exact JSON format:
{
  "summary": "2-3 sentence assessment",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["actionable tip 1", "actionable tip 2", "actionable tip 3"],
  "overallGrade": "A+ to F grade",
  "motivationalMessage": "Personalized encouragement"
}`;

    const response = await client.chat.completions.create({
        model: config.openai.model,
        messages: [
            { role: 'system', content: 'You are a strict but encouraging discipline coach. Respond only with valid JSON.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '{}';

    try {
        return JSON.parse(content) as DisciplineReport;
    } catch {
        return {
            summary: content,
            strengths: [],
            weaknesses: [],
            recommendations: [],
            overallGrade: 'N/A',
            motivationalMessage: 'Keep pushing forward!',
        };
    }
}

/**
 * Generate a quick discipline summary for daily notifications.
 */
export async function generateDailySummary(
    userName: string,
    todayScore: number,
    streak: number,
    completionRate: number,
): Promise<string> {
    const client = getClient();

    const response = await client.chat.completions.create({
        model: config.openai.model,
        messages: [
            {
                role: 'system',
                content: 'You are a concise discipline coach. Respond in 1-2 sentences max.',
            },
            {
                role: 'user',
                content: `Daily report for ${userName}: Score ${todayScore}/100, ${streak}-day streak, ${completionRate}% completion rate. Give a brief assessment.`,
            },
        ],
        temperature: 0.8,
        max_tokens: 100,
    });

    return response.choices[0]?.message?.content || 'Keep going!';
}

// ── Risk Prediction Service ──

/**
 * Predict risk of commitment failure based on historical data.
 */
export async function predictRisk(
    input: DisciplineAnalysisInput
): Promise<RiskPrediction> {
    const client = getClient();

    const prompt = `You are an AI risk analyst for TrackBuddy accountability app.
Based on this user's data, predict their risk of failing their commitment.

User: ${input.userName}
Commitment: ${input.commitmentTitle} (${input.category})
Completion Rate: ${Math.round((input.completedSessions / Math.max(input.totalSessions, 1)) * 100)}%
Violations: ${input.violations}
Current Streak: ${input.currentStreak} days
Last 7 days scores: ${input.disciplineScores.join(', ')}
Avg Focus: ${input.averageFocusMinutes} min
Avg Distraction: ${input.averageDistractionMinutes} min

Respond in this exact JSON format:
{
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "riskScore": 0-100,
  "factors": ["risk factor 1", "risk factor 2"],
  "prediction": "1-2 sentence prediction",
  "preventiveActions": ["action 1", "action 2"]
}`;

    const response = await client.chat.completions.create({
        model: config.openai.model,
        messages: [
            { role: 'system', content: 'You are a behavioral risk analyst. Respond only with valid JSON.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content || '{}';

    try {
        return JSON.parse(content) as RiskPrediction;
    } catch {
        // Fallback: calculate risk from data
        return calculateFallbackRisk(input);
    }
}

/**
 * Calculate performance trend from discipline scores.
 * Returns 'improving', 'declining', or 'stable'.
 */
export function calculateTrend(scores: number[]): 'improving' | 'declining' | 'stable' {
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

/**
 * Fallback risk calculation when OpenAI is unavailable.
 */
function calculateFallbackRisk(input: DisciplineAnalysisInput): RiskPrediction {
    const completionRate = input.totalSessions > 0
        ? input.completedSessions / input.totalSessions
        : 1;

    const trend = calculateTrend(input.disciplineScores);
    const factors: string[] = [];
    let riskScore = 0;

    // Factor: completion rate
    if (completionRate < 0.5) {
        riskScore += 30;
        factors.push('Low completion rate');
    } else if (completionRate < 0.75) {
        riskScore += 15;
        factors.push('Below-average completion rate');
    }

    // Factor: violations
    if (input.violations > 3) {
        riskScore += 25;
        factors.push('Multiple violations');
    } else if (input.violations > 0) {
        riskScore += 10;
        factors.push('Has violations');
    }

    // Factor: declining trend
    if (trend === 'declining') {
        riskScore += 20;
        factors.push('Declining performance trend');
    }

    // Factor: low streak
    if (input.currentStreak === 0) {
        riskScore += 15;
        factors.push('No active streak');
    }

    // Factor: high distraction ratio
    const totalTime = input.averageFocusMinutes + input.averageDistractionMinutes;
    if (totalTime > 0 && input.averageDistractionMinutes / totalTime > 0.4) {
        riskScore += 10;
        factors.push('High distraction ratio');
    }

    riskScore = Math.min(riskScore, 100);

    let riskLevel: RiskPrediction['riskLevel'] = 'LOW';
    if (riskScore >= 70) riskLevel = 'CRITICAL';
    else if (riskScore >= 50) riskLevel = 'HIGH';
    else if (riskScore >= 25) riskLevel = 'MEDIUM';

    return {
        riskLevel,
        riskScore,
        factors,
        prediction: `User has a ${riskScore}% risk of failing their commitment.`,
        preventiveActions: [
            'Review and adjust commitment difficulty',
            'Enable accountability partner notifications',
        ],
    };
}
