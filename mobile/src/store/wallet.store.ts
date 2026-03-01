import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { bridgeService, AlgoPrice } from "@/services/api";

export interface Transaction {
  id:     string;
  type:   "stake" | "reward" | "penalty" | "saving" | "payment";
  amount: number;
  note:   string;
  date:   string;
}

interface WalletState {
  balance:       number;
  stakedAmount:  number;
  rewardBalance: number;
  savedBalance:  number;
  walletAddress: string | null;
  algoPrice:     AlgoPrice | null;
  transactions:  Transaction[];

  setWalletAddress: (addr: string) => void;
  setStaked:        (amount: number) => void;
  addTransaction:   (tx: Omit<Transaction, "id" | "date">) => void;
  fetchAlgoPrice:   () => Promise<void>;
  setBalance:       (bal: number) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance:       0,
      stakedAmount:  0,
      rewardBalance: 0,
      savedBalance:  0,
      walletAddress: null,
      algoPrice:     null,
      transactions:  [],

      setWalletAddress: (addr) => set({ walletAddress: addr }),
      setBalance:       (bal)  => set({ balance: bal }),

      setStaked: (amount) =>
        set((s) => ({
          stakedAmount: amount,
          balance:      Math.max(0, s.balance - amount),
        })),

      addTransaction: (tx) =>
        set((s) => ({
          transactions: [
            { ...tx, id: Date.now().toString(), date: new Date().toISOString() },
            ...s.transactions,
          ].slice(0, 50),    // keep last 50
        })),

      fetchAlgoPrice: async () => {
        try {
          const price = await bridgeService.getPrice();
          set({ algoPrice: price });
        } catch { /* use cached */ }
      },
    }),
    {
      name:    "wallet-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
