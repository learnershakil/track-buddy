import React, { useState,useEffect } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { LineChart } from "@/components/ui/LineChart";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Divider } from "@/components/ui/Divider";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useDisciplineStore } from "@/store/discipline.store";
import { useVoice } from "@/hooks/useVoice";
import { COLORS } from "@/constants/theme";

import { useAIAnalysis } from "@/hooks/api";
import { useAuthStore }  from "@/store/auth.store";



import { useDistractionStore } from "@/store/distraction.store";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 72;

const AI_VERDICT = {
  score: 72,
  label: "Below Potential",
  labelVariant: "accent" as const,
  message:
    "You planned 8 hrs work. You wasted 2.8 hrs on distractions. At this rate your startup will fall behind targets by Q3.",
  plannedHours: 8,
  actualHours: 4.7,
  distractionH: 2.8,
  insights: [
    { icon: "sunny-outline", color: COLORS.accent, text: "Most productive: 9AM – 12PM" },
    { icon: "moon-outline", color: COLORS.primary, text: "Longest idle: 3PM – 5PM" },
    { icon: "bed-outline", color: COLORS.muted, text: "Sleep consistency: 68% — needs work" },
    { icon: "code-slash-outline", color: COLORS.success, text: "Coding velocity +12% this week" },
  ],
  improvements: [
    "Block social media 2PM – 6PM",
    "Shift gym to before 8AM",
    "Target sleep by 11PM for 7+ hrs",
  ],
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <View className="h-2.5 bg-border rounded-full overflow-hidden">
      <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </View>
  );
}

function FocusDistractionBar() {
  const { today } = useDistractionStore();
  if (!today) return null;

  const { focusMinutes, distractionMinutes } = today;
  const total = focusMinutes + distractionMinutes || 1;
  const focusPct = (focusMinutes / total) * 100;
  const distractPct = (distractionMinutes / total) * 100;

  return (
    <View className="mt-2">
      <View className="h-3 bg-border rounded-full overflow-hidden flex-row">
        <View
          className="h-full bg-success"
          style={{ width: `${focusPct}%` }}
        />
        <View
          className="h-full bg-danger"
          style={{ width: `${distractPct}%` }}
        />
      </View>
      <View className="flex-row justify-between mt-2">
        <Text className="text-success text-xs font-semibold">
          Focus {Math.round(focusPct)}%
        </Text>
        <Text className="text-danger text-xs font-semibold">
          Distraction {Math.round(distractPct)}%
        </Text>
      </View>
    </View>
  );
}

function CategoryBreakdown() {
  const { today } = useDistractionStore();
  if (!today) return null;

  const { socialMinutes, videoMinutes, devMinutes } = today;
  const productive = devMinutes + today.focusMinutes;
  const totalDistraction = today.distractionMinutes || 1;

  const rows = [
    { label: "Social media", minutes: socialMinutes, color: COLORS.chartSocial },
    { label: "Video / Reels", minutes: videoMinutes, color: COLORS.chartDistraction },
    { label: "Productive dev", minutes: devMinutes, color: COLORS.chartProductive },
  ];

  return (
    <Card elevated>
      <SectionHeader title="Today by Category" subtitle="Where your time actually went" />
      <View className="gap-3">
        {rows.map((r) => {
          const pct = Math.round((r.minutes / (today.totalScreenMinutes || 1)) * 100);
          return (
            <View key={r.label}>
              <View className="flex-row justify-between mb-1">
                <Text className="text-muted text-xs">{r.label}</Text>
                <Text className="text-white text-xs font-semibold">
                  {r.minutes} min · {pct}%
                </Text>
              </View>
              <View className="h-2.5 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: r.color }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}


export function AIReportScreen() {
  const { user }    = useAuthStore();
  const { mutate: analyze, data: report, isPending, isError } = useAIAnalysis();

  // Trigger once on mount
  useEffect(() => {
    if (user?.id) analyze({ userId: user.id });
  }, [user?.id]);

  if (isPending) return <LoadingSpinner label="GPT-4 analyzing..." />;

  // Use report.grade, report.overallScore, report.summary,
  // report.strengths, report.weaknesses, report.recommendations
  return (
    <SafeAreaWrapper>
      <Card elevated className="items-center py-8">
        <ProgressRing progress={report?.overallScore ?? 0} size={130} ... />
        <Text className="text-white text-xl font-bold mt-4">
          Grade: {report?.grade ?? "—"}
        </Text>
      </Card>

      <Card elevated className="border-l-4 border-l-accent">
        <Text className="text-white text-sm leading-6 italic">
          "{report?.summary}"
        </Text>
      </Card>

      {/* Strengths */}
      <Card elevated>
        <SectionHeader title="Strengths" />
        {report?.strengths.map((s, i) => (
          <Text key={i} className="text-success text-sm">✓ {s}</Text>
        ))}
      </Card>

      {/* Recommendations */}
      <Card elevated>
        <SectionHeader title="Recommendations" />
        {report?.recommendations.map((r, i) => (
          <Text key={i} className="text-white text-sm">{i + 1}. {r}</Text>
        ))}
      </Card>
    </SafeAreaWrapper>
  );
}
