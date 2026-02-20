import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "@/constants/theme";

interface HeaderProps {
  title:        string;
  showBack?:    boolean;
  rightAction?: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void };
}

export function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const navigation = useNavigation();
  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      {showBack ? (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-xl bg-surface"
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
      ) : (
        <View className="w-10" />
      )}
      <Text className="text-white text-lg font-bold">{title}</Text>
      {rightAction ? (
        <TouchableOpacity
          onPress={rightAction.onPress}
          className="w-10 h-10 items-center justify-center rounded-xl bg-surface"
        >
          <Ionicons name={rightAction.icon} size={22} color={COLORS.white} />
        </TouchableOpacity>
      ) : (
        <View className="w-10" />
      )}
    </View>
  );
}
