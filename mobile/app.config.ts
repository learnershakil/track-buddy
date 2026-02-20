import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "TrackBuddy",
  slug: "trackbuddy",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0A0A0F",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.trackbuddy.app",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0A0A0F",
    },
    package: "com.trackbuddy.app",
    permissions: [
      "PACKAGE_USAGE_STATS",
      "SYSTEM_ALERT_WINDOW",
      "FOREGROUND_SERVICE",
      "RECEIVE_BOOT_COMPLETED",
      "ACCESS_FINE_LOCATION",
      "POST_NOTIFICATIONS",
    ],
  },
  plugins: [
    "expo-dev-client",
    "expo-notifications",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Allow TrackBuddy to use your location for fitness tracking.",
      },
    ],
  ],
  extra: {
    eas: { projectId: "your-eas-project-id" },
  },
});
