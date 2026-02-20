import React, { useEffect, useState, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { FocusStackParamList } from "@/navigation/types";
import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useSessionStore } from "@/store/session.store";
import { useBackHandler } from "@/hooks/useBackHandler";
import { COLORS } from "@/constants/theme";

type Route = RouteProp<FocusStackParamList, "FocusSession">;

export function FocusSessionScreen() {
  const route      = useRoute<Route>();
  const navigation = useNavigation();
  const { duration, taskId } = route.params;

  const totalSeconds = duration * 60;
  const { status, elapsedSeconds, startSession, endSession, tickSecond } = useSessionStore();

  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Block back button during session
  useBackHandler(() => status === "running");

  const remaining = Math.max(0, totalSeconds - elapsedSeconds);
  const progress  = Math.min(100, (elapsedSeconds / totalSeconds) * 100);
  const mins      = Math.floor(remaining / 60);
  const secs      = remaining % 60;

  useEffect(() => {
    startSession({ id: taskId, title: "Focus Session", duration, category: "coding", createdAt: new Date().toISOString() });
    setHasStarted(true);
    intervalRef.current = setInterval(() => tickSecond(), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (remaining === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      endSession();
    }
  }, [remaining]);

  const handleEnd = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    endSession();
    navigation.goBack();
  };

  return (
    <SafeAreaWrapper>
      <View className="flex-1 items-center justify-center px-6">
        {/* Status pill */}
        <View className="flex-row items-center gap-2 bg-success/20 px-4 py-2 rounded-full mb-10">
          <View className="w-2 h-2 rounded-full bg-success" />
          <Text className="text-success text-sm font-semibold">FOCUS ACTIVE</Text>
        </View>

        {/* Timer ring */}
        <ProgressRing
          progress={progress}
          size={220}
          strokeWidth={12}
          color={progress > 70 ? COLORS.success : progress > 30 ? COLORS.accent : COLORS.danger}
          label={`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`}
        />
        <Text className="text-muted text-sm mt-4">minutes remaining</Text>

        {/* Stats */}
        <View className="flex-row gap-4 mt-10 w-full">
          <Card className="flex-1 items-center py-4">
            <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.success} />
            <Text className="text-white font-bold text-lg mt-1">
              {Math.floor(elapsedSeconds / 60)}m
            </Text>
            <Text className="text-muted text-xs">Focused</Text>
          </Card>
          <Card className="flex-1 items-center py-4">
            <Ionicons name="warning-outline" size={22} color={COLORS.danger} />
            <Text className="text-white font-bold text-lg mt-1">0m</Text>
            <Text className="text-muted text-xs">Distracted</Text>
          </Card>
          <Card className="flex-1 items-center py-4">
            <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.primary} />
            <Text className="text-white font-bold text-lg mt-1">100%</Text>
            <Text className="text-muted text-xs">Clean</Text>
          </Card>
        </View>

        {/* End session */}
        <View className="w-full mt-10">
          <Button label="End Session" onPress={handleEnd} variant="danger" fullWidth size="lg" />
        </View>
      </View>
    </SafeAreaWrapper>
  );
}
