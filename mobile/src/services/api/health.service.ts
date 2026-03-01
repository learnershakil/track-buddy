import { api } from "./client";

export interface HealthStatus {
  status:    "ok" | "degraded";
  uptime:    number;
  database:  string;
  algorand:  string;
  timestamp: string;
}

export const healthService = {
  check: () => api.get<HealthStatus>("/api/health"),
};
