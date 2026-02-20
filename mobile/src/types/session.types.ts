export type SessionCategory = "coding" | "study" | "gym" | "other";
export type SessionStatus   = "idle" | "running" | "paused" | "completed" | "violated";

export interface Session {
  id:              string;
  taskId:          string;
  userId:          string;
  status:          SessionStatus;
  startTime:       string;
  endTime?:        string;
  plannedDuration: number;
  actualDuration:  number;
  distractionTime: number;
  focusScore:      number;
  stakeAmount:     number;
  category:        SessionCategory;
}
