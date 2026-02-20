import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { ModalParamList } from "@/navigation/types";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/theme";

type Route = RouteProp<ModalParamList, "DistractionAlert">;

export function DistractionAlertScreen() {
  const route      = useRoute<Route>();
  const navigation = useNavigation();
  const { appName } = route.params;
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(id); navigation.goBack(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <View className="w-20 h-20 rounded-full bg-danger/20 items-center justify-center mb-6">
        <Ionicons name="warning" size={40} color={COLORS.danger} />
      </View>

      <Text className="text-danger text-2xl font-bold text-center mb-2">Distraction Detected</Text>
      <Text className="text-white text-lg font-semibold text-center mb-1">{appName}</Text>
      <Text className="text-muted text-sm text-center mb-8">
        This app is considered a distraction.{"\n"}Return to focus to avoid penalty.
      </Text>

      {/* Deduction warning */}
      <View className="bg-danger/10 border border-danger/30 rounded-2xl px-6 py-4 w-full mb-8">
        <Text className="text-danger text-sm font-semibold text-center">
          ⚠️ Stake deduction in {countdown}s if not closed
        </Text>
      </View>

      <Button
        label="Return to Focus"
        onPress={() => navigation.goBack()}
        fullWidth size="lg"
      />
      <Button
        label="Ignore (Deduct Stake)"
        onPress={() => navigation.goBack()}
        variant="ghost"
        fullWidth
        className="mt-3"
      />
    </View>
  );
}
