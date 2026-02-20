import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper }    from "@/components/layout/SafeAreaWrapper";
import { Card }               from "@/components/ui/Card";
import { Badge }              from "@/components/ui/Badge";
import { StatCard }           from "@/components/ui/StatCard";
import { HeatmapGrid }        from "@/components/ui/HeatmapGrid";
import { SectionHeader }      from "@/components/ui/SectionHeader";
import { Divider }            from "@/components/ui/Divider";
import { useAuthStore }       from "@/store/auth.store";
import { useAppStore }        from "@/store/app.store";
import { useDisciplineStore } from "@/store/discipline.store";
import { useWalletStore }     from "@/store/wallet.store";
import { MOCK_WEEKLY_LOGS }   from "@/constants/mock";
import { COLORS }             from "@/constants/theme";

const INTEGRATIONS = [
  { label: "Wallet",         icon: "wallet-outline",    connected: true,  color: COLORS.primary },
  { label: "Chrome Extension", icon: "globe-outline",   connected: false, color: COLORS.accent  },
  { label: "VSCode Plugin",  icon: "code-slash-outline", connected: false, color: COLORS.muted  },
];

export function ProfileScreen() {
  const { user }      = useAuthStore();
  const { mode }      = useAppStore();
  const { streak, todayScore, teamRank } = useDisciplineStore();
  const { balance }   = useWalletStore();
  const weekScores    = MOCK_WEEKLY_LOGS.map((l) => l.score);
  const initials      = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "TB";

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-8 gap-4">

          {/* Profile header */}
          <Card elevated className="items-center py-8">
            <View className="w-20 h-20 rounded-2xl bg-primary items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">{initials}</Text>
            </View>
            <Text className="text-white text-2xl font-bold">{user?.name}</Text>
            <Text className="text-muted text-sm mt-1">{user?.email}</Text>
            <View className="flex-row gap-2 mt-3">
              <Badge label={mode === "hardcore" ? "🔥 Hardcore" : "Normal"} variant={mode === "hardcore" ? "danger" : "muted"} />
              {teamRank && <Badge label={`Team #${teamRank}`} variant="primary" />}
            </View>
          </Card>

          {/* Stats */}
          <View className="flex-row gap-3">
            <StatCard icon="flame-outline"  iconColor={COLORS.accent}  value={`${streak}d`}          label="Streak"     />
            <StatCard icon="star-outline"   iconColor={COLORS.primary} value={`${todayScore}%`}       label="Today"      />
            <StatCard icon="cash-outline"   iconColor={COLORS.success} value={`₹${balance / 1000}k`} label="Balance"    />
          </View>

          {/* Weekly heatmap */}
          <Card elevated>
            <SectionHeader title="This Week" />
            <HeatmapGrid scores={weekScores} />
          </Card>

          {/* Achievements */}
          <Card elevated>
            <SectionHeader title="Achievements" />
            <View className="flex-row flex-wrap gap-2">
              {[
                { emoji: "🔥", label: "7-Day Streak" },
                { emoji: "💰", label: "First Stake"  },
                { emoji: "🏆", label: "Top Scorer"   },
                { emoji: "⚡", label: "90%+ Score"   },
              ].map((a) => (
                <View key={a.label} className="flex-row items-center gap-1.5 bg-card border border-border px-3 py-2 rounded-xl">
                  <Text>{a.emoji}</Text>
                  <Text className="text-white text-xs font-semibold">{a.label}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Integrations */}
          <Card elevated>
            <SectionHeader title="Connected Services" />
            {INTEGRATIONS.map((s, i) => (
              <React.Fragment key={s.label}>
                <View className="flex-row items-center gap-3 py-3">
                  <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                    <Ionicons name={s.icon as any} size={18} color={s.color} />
                  </View>
                  <Text className="text-white text-sm font-semibold flex-1">{s.label}</Text>
                  <Badge label={s.connected ? "Connected" : "Not linked"} variant={s.connected ? "success" : "muted"} />
                </View>
                {i < INTEGRATIONS.length - 1 && <Divider className="my-0" />}
              </React.Fragment>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
