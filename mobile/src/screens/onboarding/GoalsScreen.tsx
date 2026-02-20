import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { ROUTES } from "@/constants/routes";

const GOALS = [
  { id: "coding",  label: "Daily Coding",  icon: "code-slash-outline" as const, desc: "Track dev work hours" },
  { id: "study",   label: "Study Hours",   icon: "book-outline" as const,       desc: "Learn consistently" },
  { id: "gym",     label: "Fitness",       icon: "barbell-outline" as const,    desc: "Workout tracking"   },
  { id: "sleep",   label: "Sleep",         icon: "moon-outline" as const,       desc: "Sleep consistency"  },
  { id: "finance", label: "Finance",       icon: "cash-outline" as const,       desc: "Spending discipline" },
  { id: "focus",   label: "Deep Focus",    icon: "eye-outline" as const,        desc: "No-distraction work" },
];

export function GoalsScreen() {
  const navigation               = useNavigation();
  const [selected, setSelected]  = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );

  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-6">
        <View className="mb-8 mt-4">
          <Text className="text-muted text-sm font-semibold uppercase tracking-wider">Step 1 of 3</Text>
          <Text className="text-white text-3xl font-bold mt-2">What do you{"\n"}want to track?</Text>
          <Text className="text-muted text-sm mt-2">Select all that apply.</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="gap-3">
            {GOALS.map((goal) => {
              const isActive = selected.includes(goal.id);
              return (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => toggle(goal.id)}
                  className={`flex-row items-center gap-4 p-4 rounded-2xl border ${isActive ? "border-primary bg-primary/10" : "border-border bg-surface"}`}
                >
                  <View className={`w-12 h-12 rounded-xl items-center justify-center ${isActive ? "bg-primary" : "bg-card"}`}>
                    <Ionicons name={goal.icon} size={24} color={isActive ? COLORS.white : COLORS.muted} />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-semibold text-base ${isActive ? "text-white" : "text-muted"}`}>{goal.label}</Text>
                    <Text className="text-muted text-xs mt-0.5">{goal.desc}</Text>
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
          <View className="h-8" />
        </ScrollView>

        <View className="pb-4">
          <Button
            label="Continue"
            onPress={() => (navigation as any).navigate(ROUTES.MODE_SELECT)}
            disabled={selected.length === 0}
            fullWidth size="lg"
          />
        </View>
      </View>
    </SafeAreaWrapper>
  );
}
