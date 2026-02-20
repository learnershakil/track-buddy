import { create } from "zustand";
import { MOCK_TASKS } from "@/constants/mock";

export type SessionCategory = "coding" | "study" | "gym" | "other";
export type SessionStatus   = "idle" | "running" | "paused" | "completed" | "violated";

export interface Task {
  id:        string;
  title:     string;
  duration:  number;
  category:  SessionCategory;
  stake?:    number;
  createdAt: string;
}

interface SessionState {
  tasks:           Task[];
  activeTask:      Task | null;
  status:          SessionStatus;
  elapsedSeconds:  number;
  distractionTime: number;
  focusScore:      number;

  // Task management
  addTask:         (task: Omit<Task, "id" | "createdAt">) => void;
  removeTask:      (id: string) => void;

  // Session control
  startSession:       (task: Task) => void;
  pauseSession:       () => void;
  resumeSession:      () => void;
  endSession:         () => void;
  tickSecond:         () => void;
  addDistractionTime: (seconds: number) => void;
  resetSession:       () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  tasks:           MOCK_TASKS,       // ← mock tasks preloaded
  activeTask:      null,
  status:          "idle",
  elapsedSeconds:  0,
  distractionTime: 0,
  focusScore:      100,

  addTask: (task) =>
    set((s) => ({
      tasks: [
        ...s.tasks,
        { ...task, id: `task_${Date.now()}`, createdAt: new Date().toISOString() },
      ],
    })),

  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  startSession: (task) =>
    set({ activeTask: task, status: "running", elapsedSeconds: 0, distractionTime: 0, focusScore: 100 }),

  pauseSession:  () => set({ status: "paused" }),
  resumeSession: () => set({ status: "running" }),
  endSession:    () => set({ status: "completed" }),

  tickSecond: () =>
    set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 })),

  addDistractionTime: (seconds) =>
    set((s) => ({
      distractionTime: s.distractionTime + seconds,
      focusScore: Math.max(0, s.focusScore - Math.floor(seconds / 30)),
    })),

  resetSession: () =>
    set({ activeTask: null, status: "idle", elapsedSeconds: 0, distractionTime: 0, focusScore: 100 }),
}));
