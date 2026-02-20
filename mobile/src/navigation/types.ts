import { NavigatorScreenParams } from "@react-navigation/native";

// ─── Auth ────────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login:         undefined;
  Register:      undefined;
  ConnectWallet: undefined;
};

// ─── Onboarding ──────────────────────────────────────────────────────────────
export type OnboardingStackParamList = {
  Goals:        undefined;
  ModeSelect:   undefined;
  PartnerSetup: undefined;
};

// ─── Tab Stacks ──────────────────────────────────────────────────────────────
export type DashboardStackParamList = {
  DashboardScreen:      undefined;
  FocusHome:            undefined;
  Stake:                undefined;
  AIReport:             undefined;
  FuturePredictor:      undefined;
  ControlMyLife:        undefined;
};

export type FocusStackParamList = {
  FocusHome:    undefined;
  FocusSession: { taskId: string; duration: number; stake?: number };
  TaskCreate:   undefined;
};

export type TeamStackParamList = {
  TeamMap:       undefined;
  MemberDetail:  { memberId: string };
};

export type WalletStackParamList = {
  Wallet:       undefined;
  Stake:        undefined;
  CryptoUPI:    undefined;
  MicroSaving:  undefined;
  Bounty:       undefined;
};

export type ProfileStackParamList = {
  Profile:  undefined;
  Settings: undefined;
  Notifications: undefined;
};

// ─── App Tabs ─────────────────────────────────────────────────────────────────
export type AppTabParamList = {
  DashboardStack: NavigatorScreenParams<DashboardStackParamList>;
  FocusStack:     NavigatorScreenParams<FocusStackParamList>;
  TeamStack:      NavigatorScreenParams<TeamStackParamList>;
  WalletStack:    NavigatorScreenParams<WalletStackParamList>;
  ProfileStack:   NavigatorScreenParams<ProfileStackParamList>;
};

// ─── Modals ───────────────────────────────────────────────────────────────────
export type ModalParamList = {
  DistractionAlert:  { appName: string; sessionId: string };
  FocusLock:         { duration: number; taskName: string };
  AICall:            { message: string };
  DeadmanAlert:      undefined;
  OnChainRecord:     { date: string; txHash: string };
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth:        NavigatorScreenParams<AuthStackParamList>;
  Onboarding:  NavigatorScreenParams<OnboardingStackParamList>;
  App:         NavigatorScreenParams<AppTabParamList>;
} & ModalParamList;
