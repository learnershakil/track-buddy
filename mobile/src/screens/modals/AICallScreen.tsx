import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

import { ModalParamList } from "@/navigation/types";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/theme";

type Route = RouteProp<ModalParamList, "AICall">;

export function AICallScreen() {
  const route      = useRoute<Route>();
  const navigation = useNavigation();
  const { message } = route.params;

  useEffect(() => {
    // AI speaks the message via TTS
    setTimeout(() => {
      Speech.speak(message, {
        language:  "en-US",
        pitch:     1.1,
        rate:      0.9,
      });
    }, 1500);
    return () => Speech.stop();
  }, []);

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      {/* Animated call ring */}
      <View className="relative mb-8">
        <View className="w-32 h-32 rounded-full bg-primary/10 items-center justify-center">
          <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center">
            <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
              <Ionicons name="mic" size={32} color={COLORS.white} />
            </View>
          </View>
        </View>
      </View>

      <Text className="text-muted text-sm font-semibold uppercase tracking-wider mb-2">
        AI Accountability Call
      </Text>
      <Text className="text-white text-xl font-bold text-center mb-6">TrackBuddy AI</Text>

      {/* Message bubble */}
      <View className="bg-surface border border-border rounded-2xl px-6 py-5 w-full mb-10">
        <Text className="text-white text-base leading-6 text-center italic">
          "{message}"
        </Text>
      </View>

      <View className="flex-row gap-4 w-full">
        <Button
          label="I'm on it 💪"
          onPress={() => { Speech.stop(); navigation.goBack(); }}
          fullWidth
          size="lg"
        />
      </View>
      <Button
        label="Dismiss"
        onPress={() => { Speech.stop(); navigation.goBack(); }}
        variant="ghost"
        fullWidth
        className="mt-3"
      />
    </View>
  );
}
