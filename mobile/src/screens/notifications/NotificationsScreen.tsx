import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { Header }          from "@/components/layout/Header";
import { Card }            from "@/components/ui/Card";
import { Badge }           from "@/components/ui/Badge";
import { Divider }         from "@/components/ui/Divider";
import { COLORS }          from "@/constants/theme";

type NotificationType = "ai_report" | "stake" | "deadman" | "team" | "general";

interface NotificationItem {
  id:       string;
  title:    string;
  message:  string;
  type:     NotificationType;
  timeAgo:  string;
  unread:   boolean;
}

const ICON_MAP: Record<NotificationType, { icon: string; color: string; label: string }> = {
  ai_report: { icon: "sparkles-outline",       color: COLORS.accent,  label: "AI Report" },
  stake:     { icon: "cash-outline",           color: COLORS.primary, label: "Stake"     },
  deadman:   { icon: "warning-outline",        color: COLORS.danger,  label: "Deadman"   },
  team:      { icon: "people-outline",         color: COLORS.success, label: "Team"      },
  general:   { icon: "notifications-outline",  color: COLORS.muted,   label: "System"    },
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id:      "n1",
    title:   "Brutal AI report ready",
    message: "You wasted 2.8 hrs today. At this rate your launch slips by 3 months.",
    type:    "ai_report",
    timeAgo: "5m ago",
    unread:  true,
  },
  {
    id:      "n2",
    title:   "Stake penalty applied",
    message: "₹50 deducted for opening Instagram during focus session.",
    type:    "stake",
    timeAgo: "1h ago",
    unread:  true,
  },
  {
    id:      "n3",
    title:   "Deadman mode triggered",
    message: "You were inactive for 35 minutes. Partner notified and day logged on-chain.",
    type:    "deadman",
    timeAgo: "3h ago",
    unread:  false,
  },
  {
    id:      "n4",
    title:   "Team leaderboard updated",
    message: "Riya just overtook you. You are now rank #2 on the team.",
    type:    "team",
    timeAgo: "6h ago",
    unread:  false,
  },
];

export function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  const hasUnread = items.some((n) => n.unread);

  return (
    <SafeAreaWrapper>
      <Header
        title="Notifications"
        showBack
        rightAction={
          hasUnread
            ? { icon: "checkmark-done-outline", onPress: markAllRead }
            : undefined
        }
      />
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="gap-3 pb-8 pt-2">
          {items.length === 0 ? (
            <View className="flex-1 items-center justify-center py-24">
              <View className="w-16 h-16 rounded-2xl bg-surface items-center justify-center mb-4">
                <Ionicons name="notifications-off-outline" size={26} color={COLORS.muted} />
              </View>
              <Text className="text-white text-lg font-bold">All clear</Text>
              <Text className="text-muted text-sm mt-1 text-center px-6">
                No notifications. Stay consistent and we’ll keep you posted.
              </Text>
            </View>
          ) : (
            items.map((n, index) => {
              const meta = ICON_MAP[n.type];
              return (
                <Card
                  key={n.id}
                  elevated
                  className={`flex-row gap-3 items-start ${n.unread ? "border-primary/50" : ""}`}
                >
                  {/* Icon */}
                  <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${meta.color}20` }}>
                    <Ionicons name={meta.icon as any} size={20} color={meta.color} />
                  </View>
                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-white text-sm font-semibold flex-1 pr-2">
                        {n.title}
                      </Text>
                      <Text className="text-muted text-xs">{n.timeAgo}</Text>
                    </View>
                    <Text className="text-muted text-xs leading-5 mb-2">
                      {n.message}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Badge label={meta.label} variant="muted" />
                      {n.unread && (
                        <View className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
