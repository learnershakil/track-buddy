import { User } from "@/types/user.types";
import { Task } from "@/store/session.store";
import { DailyDistractionSummary } from "@/types/distraction.types";



// ─── Mock User ────────────────────────────────────────────────────────────────
export const MOCK_USER: User = {
  id:            "mock_001",
  email:         "aakash@trackbuddy.app",
  name:          "Aakash",
  walletAddress: "0xAB12...CD34",
  avatarUrl:     undefined,
  mode:          "hardcore",
  goals:         ["coding", "study", "gym", "sleep"],
  createdAt:     "2026-02-01T00:00:00.000Z",
};

// ─── Mock Tasks ───────────────────────────────────────────────────────────────
export const MOCK_TASKS: Task[] = [
  {
    id:        "task_001",
    title:     "Build Auth Module",
    duration:  120,
    category:  "coding",
    stake:     500,
    createdAt: new Date().toISOString(),
  },
  {
    id:        "task_002",
    title:     "Study System Design",
    duration:  90,
    category:  "study",
    stake:     200,
    createdAt: new Date().toISOString(),
  },
  {
    id:        "task_003",
    title:     "Morning Workout",
    duration:  45,
    category:  "gym",
    stake:     0,
    createdAt: new Date().toISOString(),
  },
  {
    id:        "task_004",
    title:     "Review PRs + Code Quality",
    duration:  60,
    category:  "coding",
    stake:     300,
    createdAt: new Date().toISOString(),
  },
];

// ─── Mock Weekly Logs ─────────────────────────────────────────────────────────
export const MOCK_WEEKLY_LOGS = [
  { date: "2026-02-13", focusHours: 5.2, distractionTime: 0.8, tasksCompleted: 4, tasksTotal: 5, score: 82 },
  { date: "2026-02-14", focusHours: 3.5, distractionTime: 2.1, tasksCompleted: 2, tasksTotal: 4, score: 55 },
  { date: "2026-02-15", focusHours: 6.1, distractionTime: 0.4, tasksCompleted: 5, tasksTotal: 5, score: 94 },
  { date: "2026-02-16", focusHours: 4.8, distractionTime: 1.2, tasksCompleted: 3, tasksTotal: 4, score: 76 },
  { date: "2026-02-17", focusHours: 7.0, distractionTime: 0.2, tasksCompleted: 6, tasksTotal: 6, score: 98 },
  { date: "2026-02-18", focusHours: 2.3, distractionTime: 3.5, tasksCompleted: 1, tasksTotal: 4, score: 41 },
  { date: "2026-02-19", focusHours: 5.5, distractionTime: 0.9, tasksCompleted: 4, tasksTotal: 5, score: 72 },
];

// ─── Mock Team Members ────────────────────────────────────────────────────────
export const MOCK_TEAM = [
  { id: "t1", name: "Aakash",  score: 72, focusHours: 5.5, rank: 2, avatar: "🧑‍💻" },
  { id: "t2", name: "Riya",    score: 91, focusHours: 7.2, rank: 1, avatar: "👩‍💻" },
  { id: "t3", name: "Dev",     score: 58, focusHours: 3.8, rank: 3, avatar: "👨‍💻" },
  { id: "t4", name: "Priya",   score: 45, focusHours: 2.1, rank: 4, avatar: "👩‍🎨" },
];

// ─── Mock Bounty Tasks ────────────────────────────────────────────────────────
export const MOCK_BOUNTIES = [
  { id: "b1", title: "Fix login API error handling", reward: 150, creator: "Riya",    category: "coding", status: "open" },
  { id: "b2", title: "Write system design notes",    reward: 80,  creator: "Dev",     category: "study",  status: "open" },
  { id: "b3", title: "Review landing page copy",     reward: 50,  creator: "Aakash",  category: "other",  status: "taken" },
];


// src/constants/mock.ts (add)
export const MOCK_DISTRACTION_SUMMARY: DailyDistractionSummary = {
  date: "2026-02-20",
  totalScreenMinutes: 540,  // 9h
  focusMinutes:       320,  // 5h20
  distractionMinutes: 220,
  socialMinutes:      95,
  videoMinutes:       70,
  devMinutes:         210,
  appUsages: [
    { appId: "com.instagram.android", appName: "Instagram", category: "social", platform: "android", totalMinutes: 52, sessions: 18, lastUsedAt: "2026-02-20T02:10:00Z" },
    { appId: "com.facebook.katana",   appName: "Facebook",  category: "social", platform: "android", totalMinutes: 43, sessions: 10, lastUsedAt: "2026-02-20T01:35:00Z" },
    { appId: "com.google.youtube",    appName: "YouTube",   category: "video",  platform: "android", totalMinutes: 70, sessions: 7,  lastUsedAt: "2026-02-20T02:20:00Z" },
    { appId: "com.spotify.music",     appName: "Spotify",   category: "other",  platform: "android", totalMinutes: 35, sessions: 6,  lastUsedAt: "2026-02-20T00:40:00Z" },
    { appId: "com.vscode.desktop",    appName: "VSCode",    category: "devtools", platform: "desktop", totalMinutes: 190, sessions: 3, lastUsedAt: "2026-02-20T02:00:00Z" },
    { appId: "com.chrome",            appName: "Chrome",    category: "productivity", platform: "web", totalMinutes: 130, sessions: 11, lastUsedAt: "2026-02-20T02:05:00Z" },
  ],
};
