import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { Header }          from "@/components/layout/Header";
import { Card }            from "@/components/ui/Card";
import { Button }          from "@/components/ui/Button";
import { useWalletStore }  from "@/store/wallet.store";
import { useSessionStore } from "@/store/session.store";
import { COLORS }          from "@/constants/theme";

const PRESETS = [100, 200, 500, 1000, 2000];

export function StakeScreen() {
  const { balance, setStaked, addTransaction } = useWalletStore();
  const { tasks } = useSessionStore();
  const [amount, setAmount]       = useState(200);
  const [selectedTask, setTask]   = useState(tasks[0]?.id ?? "");
  const [confirmed, setConfirmed] = useState(false);

  const handleStake = () => {
    if (amount > balance) return;
    setStaked(amount);
    addTransaction({ type: "stake", amount, note: tasks.find((t) => t.id === selectedTask)?.title ?? "Manual stake" });
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <SafeAreaWrapper>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-success/20 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={44} color={COLORS.success} />
          </View>
          <Text className="text-white text-2xl font-bold text-center">Stake Active</Text>
          <Text className="text-muted text-sm mt-2 text-center">₹{amount} locked. Discipline is enforced financially.</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Header title="Stake Money" showBack />
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="gap-5 pt-2 pb-8">

          {/* Balance */}
          <Card elevated className="flex-row items-center justify-between py-5 px-5">
            <View>
              <Text className="text-muted text-xs font-semibold uppercase tracking-wider">Available</Text>
              <Text className="text-white text-3xl font-bold mt-1">₹{balance.toLocaleString("en-IN")}</Text>
            </View>
            <View className="w-12 h-12 rounded-2xl bg-primary/20 items-center justify-center">
              <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
            </View>
          </Card>

          {/* Amount presets */}
          <View>
            <Text className="text-muted text-sm font-semibold mb-3">Stake Amount</Text>
            <View className="flex-row flex-wrap gap-2.5">
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setAmount(p)}
                  className={`px-5 py-3 rounded-xl border ${amount === p ? "border-accent bg-accent/10" : "border-border bg-surface"}`}
                >
                  <Text className={`font-bold text-sm ${amount === p ? "text-accent" : "text-muted"}`}>₹{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Task selector */}
          <View>
            <Text className="text-muted text-sm font-semibold mb-3">Link to Task</Text>
            <View className="gap-2.5">
              {tasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => setTask(task.id)}
                  className={`flex-row items-center gap-3 p-4 rounded-xl border ${selectedTask === task.id ? "border-primary bg-primary/10" : "border-border bg-surface"}`}
                >
                  <Ionicons
                    name={selectedTask === task.id ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={selectedTask === task.id ? COLORS.primary : COLORS.muted}
                  />
                  <View className="flex-1">
                    <Text className={`text-sm font-semibold ${selectedTask === task.id ? "text-white" : "text-muted"}`}>
                      {task.title}
                    </Text>
                    <Text className="text-muted text-xs mt-0.5">{task.duration} min · {task.category}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Risk note */}
          <View className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex-row gap-3 items-start">
            <Ionicons name="warning-outline" size={18} color={COLORS.danger} />
            <Text className="text-danger text-xs flex-1 leading-5">
              If you open a distracting app during this session, ₹{amount} will be deducted automatically.
            </Text>
          </View>

          <Button
            label={`Stake ₹${amount}`}
            onPress={handleStake}
            disabled={amount > balance || !selectedTask}
            fullWidth size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
