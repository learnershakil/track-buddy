export const ENV = {
  API_URL:   process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  IS_DEV:    process.env.EXPO_PUBLIC_ENV !== "production",
} as const;
