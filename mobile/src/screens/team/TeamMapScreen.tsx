import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper }    from "@/components/layout/SafeAreaWrapper";
import { Card }               from "@/components/ui/Card";
import { Badge }              from "@/components/ui/Badge";
import { HeatmapGrid }        from "@/components/ui/HeatmapGrid";
import { StatCard }           from "@/components/ui/StatCard";
import { SectionHeader }      from "@/components/ui/SectionHeader";
import { useDisciplineStore } from "@/store/discipline.store";
import { COLORS }             from "@/constants/theme";
import { ROUTES }             from "@/constants/routes";
import { MOCK_WEEKLY_LOGS }   from "@/constants/mock";

const HEATMAP_SAMPLES: Record<string, number[]> = {
  t1: [82, 55, 94, 76, 98, 41, 72],
  t2: [91, 88, 95, 90, 96, 85, 91],
  t3: [58, 44, 60, 55, 70, 30, 58],
  t4: [45, 50, 40, 55, 38, 42, 45],
};

const RANK_COLORS = [COLORS.accent, COLORS.muted, "#CD7F32", COLORS.muted];

export function TeamMapScreen() {
  const navigation             = useNavigation();
  const { teamMembers, teamRank } = useDisciplineStore();
  const myAvgScore = Math.round(MOCK_WEEKLY_LOGS.reduce((a, l) => a + l.score, 0) / MOCK_WEEKLY_LOGS.length);

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-8 gap-4">

          {/* My rank banner */}
          <Card elevated className="flex-row items-center gap-4 py-5">
            <View className="w-14 h-14 rounded-2xl bg-primary/20 items-center justify-center">
              <Text className="text-2xl">🧑‍💻</Text>
            </View>
            <View className="flex-1">
              <Text className="text-muted text-xs font-semibold uppercase tracking-wider">Your Rank</Text>
              <Text className="text-white text-xl font-bold mt-0.5">#{teamRank ?? "—"} on Team</Text>
              <Text className="text-muted text-xs mt-1">Avg score this week: {myAvgScore}%</Text>
            </View>
            <View className="items-end">
              <Text className="text-accent text-2xl font-bold">#{teamRank}</Text>
            </View>
          </Card>

          {/* Stats row */}
          <View className="flex-row gap-3">
            <StatCard icon="people-outline"       iconColor={COLORS.primary} value={`${teamMembers.length}`}  label="Members"   />
            <StatCard icon="trophy-outline"        iconColor={COLORS.accent}  value="Riya"      label="Top Today" />
            <StatCard icon="pulse-outline"         iconColor={COLORS.success} value="76%"       label="Team Avg"  />
          </View>

          {/* Team list */}
          <SectionHeader title="Leaderboard" subtitle="Weekly performance" />

          <View className="gap-3">
            {teamMembers
              .slice()
              .sort((a, b) => a.rank - b.rank)
              .map((member, i) => (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => (navigation as any).navigate(ROUTES.MEMBER_DETAIL, { memberId: member.id })}
                  activeOpacity={0.8}
                >
                  <Card elevated>
                    <View className="flex-row items-center gap-3 mb-3">
                      {/* Rank */}
                      <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: `${RANK_COLORS[i]}20` }}>
                        <Text className="text-sm font-bold" style={{ color: RANK_COLORS[i] }}>
                          #{member.rank}
                        </Text>
                      </View>
                      {/* Avatar + name */}
                      <View className="w-10 h-10 rounded-xl bg-surface items-center justify-center">
                        <Text className="text-xl">{member.avatar}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-sm font-bold">{member.name}</Text>
                        <Text className="text-muted text-xs">{member.focusHours}h focus today</Text>
                      </View>
                      <View className="items-end gap-1">
                        <Text className="text-white text-lg font-bold">{member.score}%</Text>
                        <Ionicons name="chevron-forward" size={14} color={COLORS.muted} />
                      </View>
                    </View>

                    {/* Heatmap */}
                    <HeatmapGrid scores={HEATMAP_SAMPLES[member.id] ?? [0, 0, 0, 0, 0, 0, 0]} showLabels={i === 0} />
                  </Card>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
