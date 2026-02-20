import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper }    from "@/components/layout/SafeAreaWrapper";
import { Header }             from "@/components/layout/Header";
import { Card }               from "@/components/ui/Card";
import { Badge }              from "@/components/ui/Badge";
import { ProgressRing }       from "@/components/ui/ProgressRing";
import { LineChart }          from "@/components/ui/LineChart";
import { SectionHeader }      from "@/components/ui/SectionHeader";
import { useDisciplineStore } from "@/store/discipline.store";
import { COLORS }             from "@/constants/theme";

const { width } = Dimensions.get("window");

const PREDICTION = {
  burnoutRisk:       38,
  successProb:       74,
  incomeProjection:  "₹1.2L – ₹1.8L",
  trajectory:        [60, 65, 72, 68, 75, 80, 85],
  keyTrends: [
    { icon: "trending-up-outline",   color: COLORS.success, text: "Coding velocity improving 12% weekly" },
    { icon: "flame-outline",         color: COLORS.accent,  text: "7-day streak active — keep going" },
    { icon: "warning-outline",       color: COLORS.danger,  text: "Sleep deficit accumulating — risk factor" },
    { icon: "cash-outline",          color: COLORS.primary, text: "Stake discipline improving focus quality" },
  ],
  recommendations: [
    "Maintain 6+ coding hours/day for best trajectory",
    "Address sleep schedule to reduce burnout risk",
    "Increase team engagement for accountability boost",
  ],
};

function RiskBar({ value, color }: { value: number; color: string }) {
  return (
    <View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-muted text-sm">Risk Level</Text>
        <Text className="text-white text-sm font-bold">{value}%</Text>
      </View>
      <View className="h-3 bg-border rounded-full overflow-hidden">
        <View className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}

export function FuturePredictorScreen() {
  const { streak } = useDisciplineStore();
  const unlocked   = streak >= 7;

  return (
    <SafeAreaWrapper>
      <Header title="Future Predictor" showBack />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 gap-4 pb-8">

          {/* Unlock status */}
          {!unlocked ? (
            <Card elevated className="items-center py-10">
              <Ionicons name="lock-closed" size={40} color={COLORS.muted} />
              <Text className="text-white text-lg font-bold mt-4 text-center">Locked</Text>
              <Text className="text-muted text-sm mt-2 text-center px-6">
                Track for 7+ days to unlock your 6-month life prediction.
              </Text>
              <View className="mt-4">
                <Badge label={`${streak}/7 days tracked`} variant="primary" />
              </View>
            </Card>
          ) : (
            <>
              {/* Success + Burnout row */}
              <View className="flex-row gap-3">
                <Card elevated className="flex-1 items-center py-5">
                  <ProgressRing
                    progress={PREDICTION.successProb}
                    size={90}
                    strokeWidth={8}
                    color={COLORS.success}
                    label={`${PREDICTION.successProb}%`}
                  />
                  <Text className="text-white text-sm font-semibold mt-3 text-center">
                    Success Probability
                  </Text>
                </Card>
                <Card elevated className="flex-1 py-5 justify-center">
                  <Text className="text-muted text-xs mb-3 font-semibold uppercase tracking-wider">
                    Burnout Risk
                  </Text>
                  <RiskBar value={PREDICTION.burnoutRisk} color={COLORS.accent} />
                  <Text className="text-success text-xs font-semibold mt-3">
                    ✓ Low risk — sustainable pace
                  </Text>
                </Card>
              </View>

              {/* Income projection */}
              <Card elevated>
                <View className="flex-row items-center gap-3 mb-1">
                  <View className="w-10 h-10 rounded-xl bg-success/20 items-center justify-center">
                    <Ionicons name="cash-outline" size={20} color={COLORS.success} />
                  </View>
                  <View>
                    <Text className="text-muted text-xs font-semibold uppercase tracking-wider">6-Month Income Projection</Text>
                    <Text className="text-white text-2xl font-bold mt-0.5">{PREDICTION.incomeProjection}</Text>
                  </View>
                </View>
                <Text className="text-muted text-xs mt-2">
                  Based on current productivity trajectory
                </Text>
              </Card>

              {/* Trajectory chart */}
              <Card elevated>
                <SectionHeader title="6-Month Trajectory" subtitle="Projected discipline score" />
                <LineChart
                  data={PREDICTION.trajectory}
                  width={width - 72}
                  height={100}
                  color={COLORS.success}
                />
                <View className="flex-row justify-between mt-2">
                  {["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m) => (
                    <Text key={m} className="text-muted text-xs">{m}</Text>
                  ))}
                </View>
              </Card>

              {/* Key Trends */}
              <Card elevated>
                <SectionHeader title="Key Trends" />
                <View className="gap-3">
                  {PREDICTION.keyTrends.map((t, i) => (
                    <View key={i} className="flex-row items-center gap-3">
                      <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: `${t.color}20` }}>
                        <Ionicons name={t.icon as any} size={16} color={t.color} />
                      </View>
                      <Text className="text-white text-sm flex-1">{t.text}</Text>
                    </View>
                  ))}
                </View>
              </Card>

              {/* Recommendations */}
              <Card elevated>
                <SectionHeader title="To Improve Trajectory" />
                {PREDICTION.recommendations.map((r, i) => (
                  <View key={i} className="flex-row items-start gap-3 mb-2.5">
                    <View className="w-5 h-5 rounded-full bg-primary items-center justify-center mt-0.5">
                      <Text className="text-white text-xs font-bold">{i + 1}</Text>
                    </View>
                    <Text className="text-white text-sm flex-1 leading-5">{r}</Text>
                  </View>
                ))}
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
