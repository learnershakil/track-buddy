import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DailyDistractionSummary } from "@/types/distraction.types";
import { MOCK_DISTRACTION_SUMMARY } from "@/constants/mock";

interface DistractionState {
  today: DailyDistractionSummary | null;
  week:  DailyDistractionSummary[];

  setToday: (data: DailyDistractionSummary) => void;
  setWeek:  (data: DailyDistractionSummary[]) => void;
}

export const useDistractionStore = create<DistractionState>()(
  persist(
    (set) => ({
      today: __DEV__ ? MOCK_DISTRACTION_SUMMARY : null,
      week:  __DEV__ ? [MOCK_DISTRACTION_SUMMARY] : [],
      setToday: (data) => set({ today: data }),
      setWeek:  (data) => set({ week: data }),
    }),
    {
      name:    "distraction-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
