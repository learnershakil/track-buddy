import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface SectionHeaderProps {
  title:    string;
  subtitle?: string;
  action?:  { label: string; onPress: () => void };
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-start justify-between mb-3">
      <View>
        <Text className="text-white text-base font-bold">{title}</Text>
        {subtitle && <Text className="text-muted text-xs mt-0.5">{subtitle}</Text>}
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress} className="py-1">
          <Text className="text-primary text-sm font-semibold">{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
