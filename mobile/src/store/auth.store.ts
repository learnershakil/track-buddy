import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usersService, BackendUser } from "@/services/api";

interface AuthState {
  user:          BackendUser | null;
  isLoading:     boolean;
  isOnboarded:   boolean;

  login:         (email: string, name: string, phone?: string) => Promise<void>;
  updateUser:    (payload: Partial<BackendUser>) => Promise<void>;
  setWallet:     (address: string) => Promise<void>;
  logout:        () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:        null,
      isLoading:   false,
      isOnboarded: false,

      login: async (email, name, phone) => {
        set({ isLoading: true });
        try {
          const user = await usersService.create({ email, name, phone });
          set({ user, isLoading: false, isOnboarded: true });
        } catch (err: any) {
          // If user already exists, fetch by email (extend backend if needed)
          set({ isLoading: false });
          throw err;
        }
      },

      updateUser: async (payload) => {
        const { user } = get();
        if (!user) return;
        const updated = await usersService.update(user.id, payload);
        set({ user: updated });
      },

      setWallet: async (address) => {
        const { user } = get();
        if (!user) return;
        const updated = await usersService.update(user.id, { walletAddress: address });
        set({ user: updated });
      },

      logout: () => set({ user: null, isOnboarded: false }),
    }),
    {
      name:    "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
