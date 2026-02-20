import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper }  from "@/components/layout/SafeAreaWrapper";
import { Header }           from "@/components/layout/Header";
import { Card }             from "@/components/ui/Card";
import { Button }           from "@/components/ui/Button";
import { useSessionStore }  from "@/store/session.store";
import { COLORS }           from "@/constants/theme";

type Category = "coding" | "study" | "gym" | "other";

const CATEGORIES: { id: Category; label: string; icon: string; color: string }[] = [
  { id: "coding", label: "Coding",  icon: "code-slash-outline", color: COLORS.primary },
  { id: "study",  label: "Study",   icon: "book-outline",       color: COLORS.accent  },
  { id: "gym",    label: "Gym",     icon: "barbell-outline",    color: COLORS.success },
  { id: "other",  label: "Other",   icon: "ellipsis-horizontal-outline", color: COLORS.muted },
];

const DURATION_PRESETS = [25, 45, 60, 90, 120];
const STAKE_PRESETS    = [0, 100, 200, 500, 1000];

export function TaskCreateScreen() {
  const navigation       = useNavigation();
  const { addTask }      = useSessionStore();
  const [title, setTitle]       = useState("");
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState<Category>("coding");
  const [stake, setStake]       = useState(0);

  const handleCreate = () => {
    if (!title.trim()) return;
    addTask({ title: title.trim(), duration, category, stake });
    navigation.goBack();
  };

  return (
    <SafeAreaWrapper>
      <Header title="Create Task" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          <View className="gap-5 pb-8 pt-2">

            {/* Title */}
            <View>
              <Text className="text-muted text-sm font-semibold mb-2">Task Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Build Auth Module"
                placeholderTextColor="#64748B"
                className="bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-base"
              />
            </View>

            {/* Category */}
            <View>
              <Text className="text-muted text-sm font-semibold mb-3">Category</Text>
              <View className="flex-row gap-2.5">
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategory(cat.id)}
                      className={`flex-1 items-center py-3 rounded-xl border ${isActive ? "border-primary bg-primary/10" : "border-border bg-surface"}`}
                    >
                      <Ionicons name={cat.icon as any} size={20} color={isActive ? COLORS.primary : COLORS.muted} />
                      <Text className={`text-xs font-semibold mt-1.5 ${isActive ? "text-primary" : "text-muted"}`}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Duration */}
            <View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-muted text-sm font-semibold">Duration</Text>
                <Text className="text-white text-sm font-bold">{duration} min</Text>
              </View>
              <View className="flex-row gap-2">
                {DURATION_PRESETS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDuration(d)}
                    className={`flex-1 py-2.5 items-center rounded-xl border ${duration === d ? "border-primary bg-primary/10" : "border-border bg-surface"}`}
                  >
                    <Text className={`text-xs font-bold ${duration === d ? "text-primary" : "text-muted"}`}>
                      {d}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Stake */}
            <Card elevated>
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-white text-sm font-bold">Add Stake</Text>
                  <Text className="text-muted text-xs mt-0.5">Money deducted if you fail</Text>
                </View>
                <Text className="text-accent text-lg font-bold">
                  {stake === 0 ? "No stake" : `₹${stake}`}
                </Text>
              </View>
              <View className="flex-row gap-2">
                {STAKE_PRESETS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStake(s)}
                    className={`flex-1 py-2.5 items-center rounded-xl border ${stake === s ? "border-accent bg-accent/10" : "border-border bg-card"}`}
                  >
                    <Text className={`text-xs font-bold ${stake === s ? "text-accent" : "text-muted"}`}>
                      {s === 0 ? "None" : `₹${s}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <Button
              label="Create Task"
              onPress={handleCreate}
              disabled={!title.trim()}
              fullWidth size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
