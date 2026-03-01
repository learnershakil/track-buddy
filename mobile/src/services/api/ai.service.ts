import { api } from "./client";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TrendDirection = "up" | "down" | "stable";

export interface DisciplineReport {
  grade:           string;          // "A+", "B-", "F" etc.
  overallScore:    number;          // 0-100
  summary:         string;
  strengths:       string[];
  weaknesses:      string[];
  recommendations: string[];
  trend:           TrendDirection;
  focusScore:      number;
  consistencyScore: number;
  streakBonus:     number;
}

export interface RiskPrediction {
  riskLevel:          RiskLevel;
  probability:        number;         // 0-1
  contributingFactors: string[];
  recommendations:    string[];
  predictedOutcome:   string;
}

export interface DailySummary {
  summary:    string;
  trend:      TrendDirection;
  todayScore: number;
}

const BASE = "/api/ai";

export const aiService = {
  // POST /api/ai/analyze
  analyze: (userId: string, commitmentId?: string) =>
    api.post<DisciplineReport>(`${BASE}/analyze`, { userId, commitmentId }),

  // POST /api/ai/predict
  predict: (userId: string, commitmentId?: string) =>
    api.post<RiskPrediction>(`${BASE}/predict`, { userId, commitmentId }),

  // GET /api/ai/summary?userId=
  summary: (userId: string) =>
    api.get<DailySummary>(`${BASE}/summary`, { userId }),
};
