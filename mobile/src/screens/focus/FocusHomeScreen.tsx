import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper }  from "@/components/layout/SafeAreaWrapper";
import { Header }           from "@/components/layout/Header";
import { Card }             from "@/components/ui/Card";
import { Badge }            from "@/components/ui/Badge";
import { Button }           from "@/components/ui/Button";
import { StatCard }         from "@/components/ui/StatCard";
import { EmptyState }       from "@/components/ui/EmptyState";
import { useSessionStore }  from "@/store/session.store";
import { useDisciplineStore } from "@/store/discipline.store";
import { COLORS }           from "@/constants/theme";
import { ROUTES }           from "@/constants/routes";

const CATEGORY_COLOR: Record<string, string> = {
  coding: COLORS.primary,
  study:  COLORS.accent,
  gym:    COLORS.success,
  other:  COLORS.muted,
};

const CATEGORY_ICON: Record<string, string> = {
  coding: "code-slash-outline",
  study:  "book-outline",
  gym:    "barbell-outline",
  other:  "ellipsis-horizontal-circle-outline",
};

export function FocusHomeScreen() {
  const navigation              = useNavigation();
  const { tasks, removeTask }   = useSessionStore();
  const { todayScore, streak }  = useDisciplineStore();

  return (
    <SafeAreaWrapper>
      <Header
        title="Focus"
        rightAction={{
          icon: "add-circle-outline",
          onPress: () => (navigation as any).navigate(ROUTES.TASK_CREATE),
        }}
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-8 gap-4">

          {/* Quick stats */}
          <View className="flex-row gap-3">
            <StatCard icon="star-outline"  iconColor={COLORS.primary} value={`${todayScore}%`}  label="Score"  trend="↑4%" trendUp />
            <StatCard icon="flame-outline" iconColor={COLORS.accent}  value={`${streak}d`}      label="Streak" />
            <StatCard icon="list-outline"  iconColor={COLORS.success} value={`${tasks.length}`} label="Tasks"  />
          </View>

          {/* Task list */}
          <Text className="text-muted text-sm font-semibold uppercase tracking-wider">Your Tasks</Text>

          {tasks.length === 0 ? (
            <EmptyState
              icon="clipboard-outline"
              title="No Tasks Yet"
              message="Create your first task to start a focus session."
              action={
                <Button
                  label="Create Task"
                  onPress={() => (navigation as any).navigate(ROUTES.TASK_CREATE)}
                  size="sm"
                />
              }
            />
          ) : (
            tasks.map((task) => {
              const color = CATEGORY_COLOR[task.category] ?? COLORS.muted;
              const icon  = CATEGORY_ICON[task.category]  ?? "time-outline";
              return (
                <Card key={task.id} elevated>
                  <View className="flex-row items-start gap-3 mb-4">
                    {/* Category icon */}
                    <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                      <Ionicons name={icon as any} size={21} color={color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-sm font-bold">{task.title}</Text>
                      <View className="flex-row items-center gap-2 mt-1.5">
                        <Ionicons name="timer-outline" size={13} color={COLORS.muted} />
                        <Text className="text-muted text-xs">{task.duration} min</Text>
                        <Badge label={task.category} variant="primary" />
                        {task.stake && task.stake > 0 && (
                          <Badge label={`₹${task.stake}`} variant="accent" />
                        )}
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => removeTask(task.id)} className="p-1">
                      <Ionicons name="close-circle-outline" size={20} color={COLORS.muted} />
                    </TouchableOpacity>
                  </View>
                  <Button
                    label="Start Focus Session"
                    onPress={() =>
                      (navigation as any).navigate(ROUTES.FOCUS_SESSION, {
                        taskId:   task.id,
                        duration: task.duration,
                        stake:    task.stake,
                      })
                    }
                    fullWidth size="sm"
                  />
                </Card>
              );
            })
          )}

          {/* Add more */}
          <TouchableOpacity
            onPress={() => (navigation as any).navigate(ROUTES.TASK_CREATE)}
            className="border-2 border-dashed border-border rounded-2xl py-5 items-center gap-2"
          >
            <Ionicons name="add-circle-outline" size={26} color={COLORS.muted} />
            <Text className="text-muted text-sm">Add another task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
