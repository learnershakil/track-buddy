import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { useAppStore } from "@/store/app.store";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";

const MODES = [
  {
    id:       "normal" as const,
    label:    "Normal Mode",
    icon:     "analytics-outline" as const,
    color:    COLORS.success,
    desc:     "Track your habits, get AI insights, no penalties.",
    features: ["Behavior tracking", "AI daily report", "Focus sessions", "Team ranking"],
  },
  {
    id:       "hardcore" as const,
    label:    "Hardcore Mode",
    icon:     "skull-outline" as const,
    color:    COLORS.danger,
    desc:     "Real consequences. AI takes control when you lose it.",
    features: ["Everything in Normal", "Money stake penalty", "App lock enforcement", "AI accountability call"],
    warning:  true,
  },
];

export function ModeSelectScreen() {
  const navigation         = useNavigation();
  const { setMode }        = useAppStore();
  const { setOnboardingComplete } = useAuthStore();
  const [selected, setSelected]   = useState<"normal" | "hardcore">("normal");

  const handleContinue = () => {
    setMode(selected);
    setOnboardingComplete();
    (navigation as any).navigate(ROUTES.PARTNER_SETUP);
  };

  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-6">
        <View className="mb-8 mt-4">
          <Text className="text-muted text-sm font-semibold uppercase tracking-wider">Step 2 of 3</Text>
          <Text className="text-white text-3xl font-bold mt-2">Choose{"\n"}Your Mode</Text>
          <Text className="text-muted text-sm mt-2">You can change this later in settings.</Text>
        </View>

        <View className="gap-4 flex-1">
          {MODES.map((mode) => {
            const isActive = selected === mode.id;
            return (
              <TouchableOpacity
                key={mode.id}
                onPress={() => setSelected(mode.id)}
                className={`p-5 rounded-2xl border ${isActive ? "border-primary bg-primary/10" : "border-border bg-surface"}`}
              >
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: `${mode.color}20` }}>
                    <Ionicons name={mode.icon} size={26} color={mode.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold">{mode.label}</Text>
                    {mode.warning && (
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Ionicons name="warning-outline" size={12} color={COLORS.danger} />
                        <Text className="text-danger text-xs">Real penalties apply</Text>
                      </View>
                    )}
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
                </View>
                <Text className="text-muted text-sm mb-3">{mode.desc}</Text>
                {mode.features.map((f) => (
                  <View key={f} className="flex-row items-center gap-2 mb-1">
                    <Ionicons name="checkmark" size={14} color={isActive ? COLORS.primary : COLORS.muted} />
                    <Text className={`text-sm ${isActive ? "text-white" : "text-muted"}`}>{f}</Text>
                  </View>
                ))}
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="pb-4">
          <Button label="Continue" onPress={handleContinue} fullWidth size="lg" />
        </View>
      </View>
    </SafeAreaWrapper>
  );
}
