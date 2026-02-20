import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper }  from "@/components/layout/SafeAreaWrapper";
import { Header }           from "@/components/layout/Header";
import { Card }             from "@/components/ui/Card";
import { Button }           from "@/components/ui/Button";
import { ProgressRing }     from "@/components/ui/ProgressRing";
import { SectionHeader }    from "@/components/ui/SectionHeader";
import { useWalletStore }   from "@/store/wallet.store";
import { COLORS }           from "@/constants/theme";

interface Goal {
  id:      string;
  name:    string;
  target:  number;
  saved:   number;
  emoji:   string;
}

const INIT_GOALS: Goal[] = [
  { id: "g1", name: "Macbook Pro",    target: 150000, saved: 32000, emoji: "💻" },
  { id: "g2", name: "Emergency Fund", target: 50000,  saved: 18500, emoji: "🛡" },
  { id: "g3", name: "Course Fees",    target: 15000,  saved: 9200,  emoji: "📚" },
];

export function MicroSavingScreen() {
  const { savedBalance, addSaving } = useWalletStore();
  const [goals, setGoals]           = useState<Goal[]>(INIT_GOALS);
  const [showAdd, setShowAdd]       = useState(false);
  const [newName, setNewName]       = useState("");
  const [newTarget, setNewTarget]   = useState("");

  const totalSaved  = goals.reduce((a, g) => a + g.saved, 0);
  const totalTarget = goals.reduce((a, g) => a + g.target, 0);

  const handleAdd = () => {
    if (!newName || !newTarget) return;
    setGoals((prev) => [
      ...prev,
      { id: `g_${Date.now()}`, name: newName, target: Number(newTarget), saved: 0, emoji: "🎯" },
    ]);
    setNewName(""); setNewTarget(""); setShowAdd(false);
  };

  return (
    <SafeAreaWrapper>
      <Header
        title="Micro Savings"
        showBack
        rightAction={{ icon: "add-circle-outline", onPress: () => setShowAdd(true) }}
      />
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pt-2 pb-8">

          {/* Overall */}
          <Card elevated className="flex-row items-center gap-5 py-5">
            <ProgressRing
              progress={Math.round((totalSaved / totalTarget) * 100)}
              size={90}
              strokeWidth={8}
              color={COLORS.success}
              label={`${Math.round((totalSaved / totalTarget) * 100)}%`}
            />
            <View className="flex-1">
              <Text className="text-muted text-xs font-semibold uppercase tracking-wider">Total Saved</Text>
              <Text className="text-white text-2xl font-bold mt-1">₹{totalSaved.toLocaleString("en-IN")}</Text>
              <Text className="text-muted text-xs mt-1">of ₹{totalTarget.toLocaleString("en-IN")} goal</Text>
            </View>
          </Card>

          {/* Goals */}
          <SectionHeader title="Your Goals" action={{ label: "Add Goal", onPress: () => setShowAdd(true) }} />
          {goals.map((goal) => {
            const pct = Math.round((goal.saved / goal.target) * 100);
            return (
              <Card key={goal.id} elevated>
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="w-12 h-12 rounded-2xl bg-surface items-center justify-center">
                    <Text className="text-2xl">{goal.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-sm font-bold">{goal.name}</Text>
                    <Text className="text-muted text-xs mt-0.5">
                      ₹{goal.saved.toLocaleString("en-IN")} / ₹{goal.target.toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <Text className="text-success text-base font-bold">{pct}%</Text>
                </View>
                <View className="h-2.5 bg-border rounded-full overflow-hidden">
                  <View className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-surface rounded-t-3xl px-6 pt-6 pb-12 gap-4">
            <Text className="text-white text-lg font-bold mb-2">New Savings Goal</Text>
            <TextInput value={newName} onChangeText={setNewName} placeholder="Goal name"
              placeholderTextColor="#64748B"
              className="bg-card border border-border rounded-xl px-4 py-3.5 text-white" />
            <TextInput value={newTarget} onChangeText={setNewTarget} placeholder="Target amount (₹)"
              placeholderTextColor="#64748B" keyboardType="numeric"
              className="bg-card border border-border rounded-xl px-4 py-3.5 text-white" />
            <Button label="Create Goal" onPress={handleAdd} fullWidth />
            <Button label="Cancel" onPress={() => setShowAdd(false)} variant="ghost" fullWidth />
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
}
