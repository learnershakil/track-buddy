import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS } from "@/constants/theme";

interface ProgressRingProps {
  progress:   number;   // 0–100
  size?:      number;
  strokeWidth?: number;
  color?:     string;
  label?:     string;
}

export function ProgressRing({
  progress,
  size        = 80,
  strokeWidth = 8,
  color       = COLORS.primary,
  label,
}: ProgressRingProps) {
  const radius      = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash  = circumference * (1 - progress / 100);

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={COLORS.border} strokeWidth={strokeWidth} fill="none"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDash}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {label && (
        <View className="absolute items-center">
          <Text className="text-white text-sm font-bold">{label}</Text>
        </View>
      )}
    </View>
  );
}
