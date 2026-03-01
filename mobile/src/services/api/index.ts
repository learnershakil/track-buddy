export { api, ApiError }          from "./client";
export { usersService }           from "./users.service";
export { commitmentsService }     from "./commitments.service";
export { sessionsService }        from "./sessions.service";
export { aiService }              from "./ai.service";
export { bridgeService }          from "./bridge.service";
export { callsService }           from "./calls.service";
export { healthService }          from "./health.service";

// Re-export all types
export type { BackendUser, CreateUserPayload }           from "./users.service";
export type { Commitment, CreateCommitmentPayload,
              CommitmentCategory, CommitmentStatus,
              SessionLog, Violation }                    from "./commitments.service";
export type { DisciplineReport, RiskPrediction,
              DailySummary, RiskLevel }                  from "./ai.service";
export type { AlgoPrice, ConversionResult,
              BridgePayoutResult, BridgeStatus }         from "./bridge.service";
