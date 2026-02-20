import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MOCK_WEEKLY_LOGS, MOCK_TEAM } from "@/constants/mock";

export interface DayLog {
  date:            string;
  focusHours:      number;
  distractionTime: number;
  tasksCompleted:  number;
  tasksTotal:      number;
  score:           number;
  txHash?:         string;
}

export interface TeamMember {
  id:         string;
  name:       string;
  score:      number;
  focusHours: number;
  rank:       number;
  avatar:     string;
}

interface DisciplineState {
  streak:      number;
  todayScore:  number;
  weeklyLogs:  DayLog[];
  teamMembers: TeamMember[];
  teamRank:    number | null;

  setTodayScore: (score: number) => void;
  addDayLog:     (log: DayLog) => void;
  setStreak:     (streak: number) => void;
  setTeamRank:   (rank: number) => void;
  updateTeam:    (members: TeamMember[]) => void;
}

export const useDisciplineStore = create<DisciplineState>()(
  persist(
    (set) => ({
      // ── Mock discipline data ──────────────────────────────────────────────
      streak:      7,                // 7-day streak
      todayScore:  72,
      weeklyLogs:  MOCK_WEEKLY_LOGS,
      teamMembers: MOCK_TEAM,
      teamRank:    2,

      setTodayScore: (score) => set({ todayScore: score }),

      addDayLog: (log) =>
        set((s) => ({ weeklyLogs: [...s.weeklyLogs.slice(-29), log] })), // keep 30 days

      setStreak:   (streak)  => set({ streak }),
      setTeamRank: (rank)    => set({ teamRank: rank }),
      updateTeam:  (members) => set({ teamMembers: members }),
    }),
    {
      name:    "discipline-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
