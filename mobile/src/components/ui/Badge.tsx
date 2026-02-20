import React from "react";
import { View, Text } from "react-native";

type BadgeVariant = "primary" | "success" | "danger" | "accent" | "muted";

interface BadgeProps {
  label:    string;
  variant?: BadgeVariant;
}

const styles: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/20",  text: "text-primary" },
  success: { bg: "bg-success/20",  text: "text-success" },
  danger:  { bg: "bg-danger/20",   text: "text-danger"  },
  accent:  { bg: "bg-accent/20",   text: "text-accent"  },
  muted:   { bg: "bg-surface",     text: "text-muted"   },
};

export function Badge({ label, variant = "primary" }: BadgeProps) {
  const { bg, text } = styles[variant];
  return (
    <View className={`${bg} px-2.5 py-1 rounded-full`}>
      <Text className={`${text} text-xs font-semibold`}>{label}</Text>
    </View>
  );
}
