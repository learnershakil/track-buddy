import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
  icon:      keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value:     string;
  label:     string;
  trend?:    string;
  trendUp?:  boolean;
  className?: string;
}

export function StatCard({ icon, iconColor, value, label, trend, trendUp, className = "" }: StatCardProps) {
  return (
    <View className={`flex-1 bg-surface border border-border rounded-2xl p-4 ${className}`}>
      <View className="w-9 h-9 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: `${iconColor}20` }}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text className="text-white text-xl font-bold">{value}</Text>
      <Text className="text-muted text-xs mt-0.5">{label}</Text>
      {trend && (
        <Text className={`text-xs font-semibold mt-1.5 ${trendUp ? "text-success" : "text-danger"}`}>
          {trendUp ? "↑" : "↓"} {trend}
        </Text>
      )}
    </View>
  );
}
