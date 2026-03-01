import { api } from "./client";

export type CommitmentCategory =
  | "CODING" | "STUDY" | "GYM" | "READING"
  | "MEDITATION" | "DIET" | "SLEEP" | "GENERAL";

export type CommitmentStatus =
  | "PENDING" | "ACTIVE" | "COMPLETED" | "FAILED";

export interface SessionLog {
  id:                 string;
  commitmentId:       string;
  focusMinutes:       number;
  distractionMinutes: number;
  isVerified:         boolean;
  createdAt:          string;
}

export interface Violation {
  id:            string;
  commitmentId:  string;
  penaltyAmount: number | null;
  createdAt:     string;
}

export interface Commitment {
  id:            string;
  userId:        string;
  title:         string;
  description:   string | null;
  category:      CommitmentCategory;
  duration:      number;          // days
  stakeAmount:   number;          // ALGO microalgos
  status:        CommitmentStatus;
  walletAddress: string;
  txId:          string | null;   // on-chain tx
  createdAt:     string;
  sessionLogs?:  SessionLog[];
  violations?:   Violation[];
}

export interface CreateCommitmentPayload {
  userId:        string;
  title:         string;
  description?:  string;
  category:      CommitmentCategory;
  duration:      number;
  stakeAmount:   number;
  walletAddress: string;
}

export interface CreateCommitmentResult {
  commitment:     Commitment;
  unsignedTxns:   string[];   // base64-encoded unsigned Algorand txns
  appAddress:     string;
}

const BASE = "/api/commitments";

export const commitmentsService = {
  // POST /api/commitments
  create: (payload: CreateCommitmentPayload) =>
    api.post<CreateCommitmentResult>(BASE, payload),

  // GET /api/commitments?userId=
  listByUser: (userId: string) =>
    api.get<Commitment[]>(BASE, { userId }),

  // GET /api/commitments/:id
  getById: (id: string) =>
    api.get<Commitment>(`${BASE}/${id}`),

  // PATCH /api/commitments/:id/confirm
  confirm: (id: string, txId: string) =>
    api.patch<Commitment>(`${BASE}/${id}/confirm`, { txId }),

  // POST /api/commitments/opt-in
  buildOptIn: (walletAddress: string) =>
    api.post<{ unsignedTxn: string }>(`${BASE}/opt-in`, { walletAddress }),
};
