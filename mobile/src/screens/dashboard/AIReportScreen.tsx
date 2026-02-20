import React, { useState } from "react";
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
import { useDisciplineStore } from "@/store/discipline.store";
import { useVoice } from "@/hooks/useVoice";
import { COLORS } from "@/constants/theme";


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
  const { weeklyLogs } = useDisciplineStore();
  const { speak, stop } = useVoice();
  const [speaking, setSpeaking] = useState(false);

  const weekScores = weeklyLogs.map((l) => l.score);

  const handleVoiceReport = () => {
    if (speaking) { stop(); setSpeaking(false); return; }
    setSpeaking(true);
    speak(AI_VERDICT.message, 0.9, 1.05);
    setTimeout(() => setSpeaking(false), 8000);
  };

  return (
    <SafeAreaWrapper>
      <Header title="AI Report" showBack />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 gap-4 pb-8">

          {/* Score hero */}
          <Card elevated className="items-center py-8">
            <ProgressRing
              progress={AI_VERDICT.score}
              size={130}
              strokeWidth={10}
              color={COLORS.accent}
              label={`${AI_VERDICT.score}`}
            />
            <Text className="text-white text-xl font-bold mt-4">Discipline Score</Text>
            <Badge label={AI_VERDICT.label} variant="accent" />
          </Card>

          {/* Planned vs Actual */}
          <Card elevated>
            <SectionHeader title="Planned vs Actual" />
            <View className="gap-3">
              {[
                { label: "Planned Work", hours: AI_VERDICT.plannedHours, color: COLORS.primary, max: 10 },
                { label: "Actual Work", hours: AI_VERDICT.actualHours, color: COLORS.success, max: 10 },
                { label: "Distraction", hours: AI_VERDICT.distractionH, color: COLORS.danger, max: 10 },
              ].map((item) => (
                <View key={item.label}>
                  <View className="flex-row justify-between mb-1.5">
                    <Text className="text-muted text-sm">{item.label}</Text>
                    <Text className="text-white text-sm font-bold">{item.hours}h</Text>
                  </View>
                  <ProgressBar value={item.hours} max={item.max} color={item.color} />
                </View>
              ))}
            </View>
          </Card>
          <FocusDistractionBar />
          <CategoryBreakdown />

          {/* Weekly trend */}
          <Card elevated>
            <SectionHeader title="Weekly Trend" subtitle="Discipline score — last 7 days" />
            <LineChart data={weekScores} width={CHART_WIDTH} height={90} color={COLORS.primary} />
          </Card>

          {/* AI Feedback */}
          <Card elevated className="border-l-4 border-l-accent">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="sparkles" size={16} color={COLORS.accent} />
              <Text className="text-accent text-sm font-bold uppercase tracking-wider">AI Verdict</Text>
            </View>
            <Text className="text-white text-sm leading-6 italic">"{AI_VERDICT.message}"</Text>
          </Card>

          {/* Insights */}
          <Card elevated>
            <SectionHeader title="Behavior Insights" />
            <View className="gap-3">
              {AI_VERDICT.insights.map((item, i) => (
                <View key={i} className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                    <Ionicons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <Text className="text-white text-sm flex-1">{item.text}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Improvements */}
          <Card elevated>
            <SectionHeader title="AI Recommendations" />
            <View className="gap-2.5">
              {AI_VERDICT.improvements.map((tip, i) => (
                <View key={i} className="flex-row items-start gap-3">
                  <View className="w-5 h-5 rounded-full bg-primary items-center justify-center mt-0.5">
                    <Text className="text-white text-xs font-bold">{i + 1}</Text>
                  </View>
                  <Text className="text-white text-sm flex-1 leading-5">{tip}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Voice report */}
          <Button
            label={speaking ? "⏹ Stop Report" : "🎙 Hear AI Report (Voice)"}
            onPress={handleVoiceReport}
            variant={speaking ? "danger" : "outline"}
            fullWidth size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
