import { api } from "./client";

export interface LogSessionPayload {
  commitmentId:       string;
  focusMinutes:       number;
  distractionMinutes: number;
}

export interface SessionLog {
  id:                 string;
  commitmentId:       string;
  focusMinutes:       number;
  distractionMinutes: number;
  isVerified:         boolean;
  createdAt:          string;
}

const BASE = "/api/sessions";

export const sessionsService = {
  // POST /api/sessions  — log a completed focus session
  log: (payload: LogSessionPayload) =>
    api.post<SessionLog>(BASE, payload),

  // GET /api/sessions?userId=
  listByUser: (userId: string) =>
    api.get<SessionLog[]>(BASE, { userId }),
};
