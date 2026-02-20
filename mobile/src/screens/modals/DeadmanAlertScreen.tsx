import React, { useEffect, useState } from "react";
import { View, Text, Vibration } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { Button }       from "@/components/ui/Button";
import { useAppStore }  from "@/store/app.store";
import { COLORS }       from "@/constants/theme";

export function DeadmanAlertScreen() {
  const navigation             = useNavigation();
  const { resetDeadman }       = useAppStore();
  const [elapsed, setElapsed]  = useState(0);

  useEffect(() => {
    Vibration.vibrate([0, 500, 200, 500]);
    const id = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => { clearInterval(id); Vibration.cancel(); };
  }, []);

  const handleRespond = () => {
    resetDeadman();
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      {/* Pulsing warning icon */}
      <View className="w-24 h-24 rounded-full bg-danger/20 items-center justify-center mb-8">
        <View className="w-16 h-16 rounded-full bg-danger/40 items-center justify-center">
          <Ionicons name="warning" size={36} color={COLORS.danger} />
        </View>
      </View>

      <Text className="text-danger text-sm font-bold uppercase tracking-widest mb-3">
        Deadman Mode Triggered
      </Text>
      <Text className="text-white text-2xl font-bold text-center mb-2">Are You There?</Text>
      <Text className="text-muted text-sm text-center leading-6 px-4">
        You've been inactive for too long.{"\n"}
        Your accountability partner has been notified.{"\n"}
        Activity logged on-chain.
      </Text>

      <View className="bg-danger/10 border border-danger/20 rounded-2xl px-8 py-4 mt-8 mb-10">
        <Text className="text-danger text-sm font-semibold text-center">
          Inactive for {Math.floor(elapsed / 60)}m {elapsed % 60}s
        </Text>
      </View>

      <Button label="✋  I'm Here" onPress={handleRespond} fullWidth size="lg" />
      <Text className="text-muted text-xs text-center mt-4">
        Tap to dismiss and reset your inactivity timer
      </Text>
    </View>
  );
}
