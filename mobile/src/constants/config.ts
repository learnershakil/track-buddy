export const CONFIG = {
  API_BASE_URL:   __DEV__ ? "http://localhost:3000/api" : "https://api.trackbuddy.app/api",
  WS_URL:         __DEV__ ? "ws://localhost:3001"       : "wss://ws.trackbuddy.app",
  CHAIN_ID:       80001,       // Polygon Mumbai testnet
  STAKE_CONTRACT: "0x000...0", // Replace with deployed contract
  MAX_STAKE:      10000,       // ₹10,000 max stake
  IDLE_THRESHOLD: 300,         // 5 minutes inactivity → deadman trigger
  MIN_TRACKING_DAYS: 7,        // Days before future predictor unlocks
} as const;
