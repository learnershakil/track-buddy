export interface User {
  id:             string;
  email:          string;
  name:           string;
  walletAddress?: string;
  avatarUrl?:     string;
  mode:           "normal" | "hardcore";
  goals:          string[];
  partnerId?:     string;
  createdAt:      string;
}
