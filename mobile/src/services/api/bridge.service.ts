import { api } from "./client";

export interface AlgoPrice {
  algo_inr:   number;
  algo_usd:   number;
  updatedAt:  string;
}

export interface ConversionResult {
  algoAmount: number;
  inrAmount:  number;
  rate:       number;
}

export interface BridgePayoutResult {
  success:          boolean;
  bridgeId:         string;
  status:           string;
  estimatedMinutes: number;
}

export interface BridgeStatus {
  id:               string;
  status:           string;
  algoAmount:       number;
  inrAmount:        number;
  upiId:            string;
  providerReference?: string;
  createdAt:        string;
  updatedAt:        string;
}

const BASE = "/api/bridge";

export const bridgeService = {
  // GET /api/bridge/price
  getPrice: () =>
    api.get<AlgoPrice>(`${BASE}/price`),

  // GET /api/bridge/convert?amount=
  convert: (algoAmount: number) =>
    api.get<ConversionResult>(`${BASE}/convert`, { amount: algoAmount }),

  // POST /api/bridge/payout
  payout: (bridgeId: string, algoAmount: number, userUpiId: string) =>
    api.post<BridgePayoutResult>(`${BASE}/payout`, {
      bridgeId,
      algoAmount,
      userUpiId,
    }),

  // GET /api/bridge/status/:id
  getStatus: (id: string) =>
    api.get<BridgeStatus>(`${BASE}/status/${id}`),
};
