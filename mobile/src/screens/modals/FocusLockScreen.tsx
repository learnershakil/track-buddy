import React, { useEffect, useState, useRef } from "react";
import { View, Text, BackHandler } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";

import { ModalParamList } from "@/navigation/types";
import { COLORS } from "@/constants/theme";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useBackHandler } from "@/hooks/useBackHandler";

type Route = RouteProp<ModalParamList, "FocusLock">;

export function FocusLockScreen() {
  const route = useRoute<Route>();
  const { duration, taskName } = route.params;

  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Completely block back
  useBackHandler(() => true);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(intervalRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = ((duration - remaining) / duration) * 100;

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      {/* Lock indicator */}
      <View className="bg-danger/20 px-5 py-2 rounded-full mb-12 flex-row items-center gap-2">
        <View className="w-2 h-2 rounded-full bg-danger" />
        <Text className="text-danger font-bold text-sm tracking-wider">SYSTEM IN CONTROL</Text>
      </View>

      <ProgressRing
        progress={progress}
        size={240}
        strokeWidth={12}
        color={COLORS.primary}
        label={`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`}
      />

      <Text className="text-white text-2xl font-bold mt-8 text-center">{taskName}</Text>
      <Text className="text-muted text-center mt-3 px-6">
        Your phone is locked.{"\n"}Only the timer is visible.
      </Text>

      <View className="mt-12 border border-border rounded-2xl px-8 py-4">
        <Text className="text-muted text-sm text-center italic">
          "If I lose control, system takes control."
        </Text>
      </View>

      {remaining === 0 && (
        <View className="mt-8 bg-success/20 px-6 py-3 rounded-2xl">
          <Text className="text-success text-base font-bold text-center">
            🎉 Session Complete!
          </Text>
        </View>
      )}
    </View>
  );
}
