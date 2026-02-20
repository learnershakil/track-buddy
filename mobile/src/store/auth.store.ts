import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/user.types";
import { MOCK_USER } from "@/constants/mock";

interface AuthState {
  user:                   User | null;
  isAuthenticated:        boolean;
  hasCompletedOnboarding: boolean;
  token:                  string | null;

  setUser:                (user: User, token: string) => void;
  setOnboardingComplete:  () => void;
  logout:                 () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ── Mock: skip auth in dev, start fresh in prod ──────────────────────
      user:                   __DEV__ ? MOCK_USER        : null,
      isAuthenticated:        __DEV__ ? true             : false,
      hasCompletedOnboarding: __DEV__ ? true             : false,
      token:                  __DEV__ ? "mock_dev_token" : null,

      setUser: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      setOnboardingComplete: () =>
        set({ hasCompletedOnboarding: true }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, hasCompletedOnboarding: false }),
    }),
    {
      name:    "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
