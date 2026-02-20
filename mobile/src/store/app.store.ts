import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AppMode = "normal" | "hardcore";

interface AppState {
  mode:                 AppMode;
  isHardcoreLocked:     boolean;
  isAIControlActive:    boolean;
  isDeadmanTriggered:   boolean;
  activeDistractionApp: string | null;

  setMode:           (mode: AppMode) => void;
  setHardcoreLocked: (locked: boolean) => void;
  setAIControl:      (active: boolean) => void;
  triggerDeadman:    () => void;
  resetDeadman:      () => void;
  setDistractionApp: (app: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mode:                 __DEV__ ? "hardcore" : "normal", // ← mock: start in hardcore
      isHardcoreLocked:     false,
      isAIControlActive:    false,
      isDeadmanTriggered:   false,
      activeDistractionApp: null,

      setMode:           (mode)   => set({ mode }),
      setHardcoreLocked: (locked) => set({ isHardcoreLocked: locked }),
      setAIControl:      (active) => set({ isAIControlActive: active }),
      triggerDeadman:    ()       => set({ isDeadmanTriggered: true }),
      resetDeadman:      ()       => set({ isDeadmanTriggered: false }),
      setDistractionApp: (app)    => set({ activeDistractionApp: app }),
    }),
    {
      name:    "app-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
