import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Transaction {
  id:        string;
  type:      "stake" | "reward" | "penalty" | "payment" | "saving";
  amount:    number;
  note:      string;
  timestamp: string;
}

interface WalletState {
  balance:       number;
  stakedAmount:  number;
  rewardBalance: number;
  savedBalance:  number;
  walletAddress: string | null;
  isConnected:   boolean;
  transactions:  Transaction[];

  setBalance:       (balance: number) => void;
  setStaked:        (amount: number) => void;
  addReward:        (amount: number) => void;
  deductStake:      (amount: number) => void;
  addSaving:        (amount: number) => void;
  setWalletAddress: (address: string) => void;
  addTransaction:   (tx: Omit<Transaction, "id" | "timestamp">) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      // ── Mock wallet data ──────────────────────────────────────────────────
      balance:       4500,
      stakedAmount:  500,
      rewardBalance: 150,
      savedBalance:  800,
      walletAddress: __DEV__ ? "0xAB12...CD34" : null,
      isConnected:   __DEV__ ? true            : false,
      transactions: __DEV__
        ? [
            { id: "tx1", type: "stake",   amount: 500, note: "Build Auth Module",    timestamp: "2026-02-19T09:00:00Z" },
            { id: "tx2", type: "reward",  amount: 150, note: "7-day streak bonus",   timestamp: "2026-02-18T23:59:00Z" },
            { id: "tx3", type: "penalty", amount: 50,  note: "Instagram during focus", timestamp: "2026-02-18T14:20:00Z" },
            { id: "tx4", type: "saving",  amount: 200, note: "Goal: Macbook Fund",   timestamp: "2026-02-17T20:00:00Z" },
          ]
        : [],

      setBalance:       (balance) => set({ balance }),
      setStaked:        (amount) => set({ stakedAmount: amount }),
      addReward:        (amount) => set((s) => ({ rewardBalance: s.rewardBalance + amount, balance: s.balance + amount })),
      deductStake:      (amount) => set((s) => ({ stakedAmount: Math.max(0, s.stakedAmount - amount), balance: Math.max(0, s.balance - amount) })),
      addSaving:        (amount) => set((s) => ({ savedBalance: s.savedBalance + amount, balance: Math.max(0, s.balance - amount) })),
      setWalletAddress: (address) => set({ walletAddress: address, isConnected: true }),
      addTransaction:   (tx) =>
        set((s) => ({
          transactions: [
            { ...tx, id: `tx_${Date.now()}`, timestamp: new Date().toISOString() },
            ...s.transactions,
          ],
        })),
    }),
    {
      name:    "wallet-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
