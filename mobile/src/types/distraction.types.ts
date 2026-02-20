// src/types/distraction.types.ts
export type AppCategory = "social" | "video" | "productivity" | "devtools" | "messaging" | "other";

export interface AppUsageSample {
  appId:       string;       // package / bundle id
  appName:     string;
  category:    AppCategory;
  platform:    "android" | "ios" | "web" | "desktop";
  totalMinutes: number;      // for period (today, week)
  sessions:    number;
  lastUsedAt:  string;
}

export interface DailyDistractionSummary {
  date:              string;
  totalScreenMinutes: number;
  focusMinutes:       number;
  distractionMinutes: number;
  socialMinutes:      number;
  videoMinutes:       number;
  devMinutes:         number;
  appUsages:          AppUsageSample[];
}
