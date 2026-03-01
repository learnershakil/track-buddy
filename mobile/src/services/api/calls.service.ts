import { api } from "./client";

export interface CallResult {
  callSid:  string;
  status:   string;
  to:       string;
}

export interface ViolationCallResult {
  triggered: boolean;
  type?:     "standard" | "escalation";
  callSid?:  string;
  reason?:   string;
}

const BASE = "/api/call";

export const callsService = {
  // POST /api/call/trigger  — manual check-in call
  trigger: (userId: string, message?: string) =>
    api.post<CallResult>(`${BASE}/trigger`, { userId, message }),

  // POST /api/call/violation  — automated violation call
  violation: (userId: string, commitmentId: string) =>
    api.post<ViolationCallResult>(`${BASE}/violation`, {
      userId,
      commitmentId,
    }),
};
