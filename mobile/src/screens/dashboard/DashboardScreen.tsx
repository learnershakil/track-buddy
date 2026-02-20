import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
import { useDisciplineStore } from "@/store/discipline.store";
import { useSessionStore } from "@/store/session.store";
import { useWalletStore } from "@/store/wallet.store";
import { COLORS } from "@/constants/theme";
import { ROUTES } from "@/constants/routes";

const QUICK_ACTIONS = [
  { label: "Start Focus", icon: "play-circle" as const, color: COLORS.primary, route: ROUTES.FOCUS_HOME },
  { label: "Stake Money", icon: "cash" as const, color: COLORS.accent, route: ROUTES.STAKE },
  { label: "AI Report", icon: "bar-chart" as const, color: COLORS.success, route: ROUTES.AI_REPORT },
  { label: "Control Me", icon: "shield-checkmark" as const, color: COLORS.danger, route: ROUTES.CONTROL_MY_LIFE },
];

export function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { todayScore, streak } = useDisciplineStore();
  const { activeTask } = useSessionStore();
  const { balance, stakedAmount } = useWalletStore();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaWrapper>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
          <View>
            <Text className="text-muted text-sm">{greeting},</Text>
            <Text className="text-white text-xl font-bold">{user?.name ?? "Founder"} 👋</Text>
          </View>
          <View className="flex-row gap-2">
            {activeTask && <Badge label="LIVE" variant="danger" />}
            <TouchableOpacity
              className="w-10 h-10 rounded-xl bg-surface items-center justify-center"
              onPress={() =>
                (navigation as any).navigate(ROUTES.PROFILE_STACK, {
                  screen: ROUTES.NOTIFICATIONS,
                })
              }
            >
              <Ionicons name="notifications-outline" size={22} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Discipline Score Hero */}
        <Card elevated className="mx-5 mb-4 items-center py-6">
          <ProgressRing progress={todayScore || 72} size={120} strokeWidth={10} color={COLORS.primary} label={`${todayScore || 72}%`} />
          <Text className="text-white text-lg font-bold mt-4">Discipline Score</Text>
          <Text className="text-muted text-sm mt-1">Today's performance</Text>
          <View className="flex-row gap-2 mt-3">
            <Badge label={`🔥 ${streak} day streak`} variant="accent" />
          </View>
        </Card>

        {/* Stats Row */}
        <View className="flex-row gap-3 px-5 mb-4">
          {[
            { label: "Focus", value: "3.2h", icon: "timer-outline" as const, color: COLORS.primary },
            { label: "Distraction", value: "0.8h", icon: "warning-outline" as const, color: COLORS.danger },
            { label: "Tasks", value: "4/6", icon: "checkmark-done-outline" as const, color: COLORS.success },
          ].map((stat) => (
            <Card key={stat.label} className="flex-1 items-center py-4">
              <Ionicons name={stat.icon} size={22} color={stat.color} />
              <Text className="text-white text-lg font-bold mt-1">{stat.value}</Text>
              <Text className="text-muted text-xs mt-0.5">{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Wallet Quick Info */}
        <Card elevated className="mx-5 mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-muted text-xs mb-1">Wallet Balance</Text>
            <Text className="text-white text-xl font-bold">₹{balance.toFixed(2)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-muted text-xs mb-1">Staked</Text>
            <Text className="text-accent text-lg font-bold">₹{stakedAmount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            className="bg-primary/20 px-4 py-2 rounded-xl"
            onPress={() => (navigation as any).navigate(ROUTES.WALLET_STACK)}
          >
            <Text className="text-primary text-sm font-semibold">Manage</Text>
          </TouchableOpacity>
        </Card>

        {/* Quick Actions */}
        <Text className="text-white text-base font-bold px-5 mb-3">Quick Actions</Text>
        <View className="flex-row flex-wrap px-5 gap-3 mb-6">
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => (navigation as any).navigate(action.route)}
              className="flex-1 min-w-[44%] bg-surface border border-border rounded-2xl p-4 items-center gap-2"
            >
              <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: `${action.color}20` }}>
                <Ionicons name={action.icon} size={26} color={action.color} />
              </View>
              <Text className="text-white text-sm font-semibold text-center">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-4" />
      </ScrollView>
    </SafeAreaWrapper>
  );
}
