import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { aiService, DailySummary } from "@/services/api";
import { Commitment } from "@/services/api/commitments.service";

interface DisciplineState {
  todayScore:    number;
  streak:        number;
  trend:         "up" | "down" | "stable";
  summary:       string;
  weeklyScores:  number[];
  commitments:   Commitment[];
  teamRank:      number | null;

  hydrate:       (userId: string) => Promise<void>;
  setCommitments: (c: Commitment[]) => void;
}

export const useDisciplineStore = create<DisciplineState>()(
  persist(
    (set) => ({
      todayScore:   0,
      streak:       0,
      trend:        "stable",
      summary:      "",
      weeklyScores: [],
      commitments:  [],
      teamRank:     null,

      // Call this on app launch / dashboard focus
      hydrate: async (userId) => {
        try {
          const data: DailySummary = await aiService.summary(userId);
          set({
            todayScore: data.todayScore,
            trend:      data.trend,
            summary:    data.summary,
          });
        } catch {
          // Silently keep cached values on error
        }
      },

      setCommitments: (commitments) => set({ commitments }),
    }),
    {
      name:    "discipline-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
