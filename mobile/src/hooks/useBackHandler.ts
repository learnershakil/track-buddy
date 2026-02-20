import { useEffect } from "react";
import { BackHandler } from "react-native";

export function useBackHandler(shouldBlock: () => boolean) {
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      return shouldBlock();
    });
    return () => subscription.remove();
  }, [shouldBlock]);
}
