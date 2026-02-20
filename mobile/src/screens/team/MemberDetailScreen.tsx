import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper }    from "@/components/layout/SafeAreaWrapper";
import { Header }             from "@/components/layout/Header";
import { Card }               from "@/components/ui/Card";
import { StatCard }           from "@/components/ui/StatCard";
import { HeatmapGrid }        from "@/components/ui/HeatmapGrid";
import { LineChart }          from "@/components/ui/LineChart";
import { SectionHeader }      from "@/components/ui/SectionHeader";
import { useDisciplineStore } from "@/store/discipline.store";
import { TeamStackParamList } from "@/navigation/types";
import { COLORS }             from "@/constants/theme";

const { width } = Dimensions.get("window");

const MEMBER_SCORES: Record<string, number[]> = {
  t1: [82, 55, 94, 76, 98, 41, 72],
  t2: [91, 88, 95, 90, 96, 85, 91],
  t3: [58, 44, 60, 55, 70, 30, 58],
  t4: [45, 50, 40, 55, 38, 42, 45],
};

type Route = RouteProp<TeamStackParamList, "MemberDetail">;

export function MemberDetailScreen() {
  const route        = useRoute<Route>();
  const { memberId } = route.params;
  const { teamMembers } = useDisciplineStore();
  const member = teamMembers.find((m) => m.id === memberId) ?? teamMembers[0];
  const scores = MEMBER_SCORES[member.id] ?? [0, 0, 0, 0, 0, 0, 0];
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return (
    <SafeAreaWrapper>
      <Header title="Member" showBack />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 gap-4 pb-8">

          {/* Profile header */}
          <Card elevated className="items-center py-8">
            <View className="w-20 h-20 rounded-2xl bg-primary/10 items-center justify-center mb-4">
              <Text className="text-5xl">{member.avatar}</Text>
            </View>
            <Text className="text-white text-2xl font-bold">{member.name}</Text>
            <Text className="text-muted text-sm mt-1">Rank #{member.rank} on team</Text>
          </Card>

          {/* Stats */}
          <View className="flex-row gap-3">
            <StatCard icon="star-outline"        iconColor={COLORS.accent}  value={`${member.score}%`}    label="Score"     />
            <StatCard icon="timer-outline"       iconColor={COLORS.primary} value={`${member.focusHours}h`} label="Focus"   />
            <StatCard icon="trending-up-outline" iconColor={COLORS.success} value={`${avgScore}%`}         label="7d Avg"  />
          </View>

          {/* Heatmap */}
          <Card elevated>
            <SectionHeader title="Weekly Activity" />
            <HeatmapGrid scores={scores} />
          </Card>

          {/* Trend */}
          <Card elevated>
            <SectionHeader title="Score Trend" subtitle="Last 7 days" />
            <LineChart data={scores} width={width - 72} height={90} color={COLORS.primary} />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
