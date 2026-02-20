import { useState, useCallback } from "react";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

interface PermissionStatus {
  location:      boolean;
  notifications: boolean;
}

export function usePermissions() {
  const [status, setStatus] = useState<PermissionStatus>({
    location:      false,
    notifications: false,
  });

  const requestAll = useCallback(async () => {
    const [loc, notif] = await Promise.all([
      Location.requestForegroundPermissionsAsync(),
      Notifications.requestPermissionsAsync(),
    ]);
    setStatus({
      location:      loc.status === "granted",
      notifications: notif.status === "granted",
    });
    return { location: loc.status === "granted", notifications: notif.status === "granted" };
  }, []);

  return { status, requestAll };
}
