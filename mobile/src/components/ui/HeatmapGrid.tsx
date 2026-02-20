import React from "react";
import { View, Text } from "react-native";

interface HeatmapGridProps {
  scores: number[];
  labels?: string[];
  showLabels?: boolean;
}

const getCellColor = (score: number): string => {
  if (score >= 85) return "#10B981";
  if (score >= 65) return "#7C3AED";
  if (score >= 45) return "#F59E0B";
  if (score > 0)   return "#EF4444";
  return "transparent";
};

export function HeatmapGrid({
  scores,
  labels    = ["M", "T", "W", "T", "F", "S", "S"],
  showLabels = true,
}: HeatmapGridProps) {
  return (
    <View className="flex-row gap-1.5">
      {scores.map((score, i) => (
        <View key={i} className="flex-1 items-center gap-1.5">
          <View
            className="w-full h-8 rounded-lg border border-border"
            style={{
              backgroundColor: getCellColor(score),
              opacity: score > 0 ? 0.85 : 1,
            }}
          />
          {showLabels && (
            <Text className="text-muted text-xs">{labels[i]}</Text>
          )}
        </View>
      ))}
    </View>
  );
}
