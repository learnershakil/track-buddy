import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

interface EmptyStateProps {
  icon:     keyof typeof Ionicons.glyphMap;
  title:    string;
  message:  string;
  action?:  React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <View className="w-16 h-16 rounded-2xl bg-surface border border-border items-center justify-center mb-4">
        <Ionicons name={icon} size={30} color={COLORS.muted} />
      </View>
      <Text className="text-white text-lg font-bold text-center mb-2">{title}</Text>
      <Text className="text-muted text-sm text-center leading-5">{message}</Text>
      {action && <View className="mt-6">{action}</View>}
    </View>
  );
}
