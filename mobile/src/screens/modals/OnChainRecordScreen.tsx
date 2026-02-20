import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { ModalParamList }     from "@/navigation/types";
import { Card }               from "@/components/ui/Card";
import { Badge }              from "@/components/ui/Badge";
import { Button }             from "@/components/ui/Button";
import { SectionHeader }      from "@/components/ui/SectionHeader";
import { Divider }            from "@/components/ui/Divider";
import { useDisciplineStore } from "@/store/discipline.store";
import { COLORS }             from "@/constants/theme";

type Route = RouteProp<ModalParamList, "OnChainRecord">;

export function OnChainRecordScreen() {
  const route         = useRoute<Route>();
  const navigation    = useNavigation();
  const { weeklyLogs } = useDisciplineStore();
  const { date, txHash } = route.params;

  const log = weeklyLogs.find((l) => l.date === date) ?? weeklyLogs[weeklyLogs.length - 1];

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <Text className="text-white text-lg font-bold">On-Chain Record</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-9 h-9 rounded-xl bg-surface items-center justify-center"
        >
          <Ionicons name="close" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-8">

          {/* Verified banner */}
          <View className="flex-row items-center gap-3 bg-success/10 border border-success/20 rounded-2xl px-5 py-4">
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            <View>
              <Text className="text-success text-sm font-bold">Verified on Polygon</Text>
              <Text className="text-muted text-xs mt-0.5">Immutable proof of discipline</Text>
            </View>
          </View>

          {/* Day stats */}
          <Card elevated>
            <SectionHeader title="Day Summary" subtitle={log?.date ?? date} />
            {[
              { label: "Discipline Score",  value: `${log?.score ?? 72}%` },
              { label: "Focus Hours",       value: `${log?.focusHours ?? 5.5}h` },
              { label: "Tasks Completed",   value: `${log?.tasksCompleted ?? 4}/${log?.tasksTotal ?? 5}` },
              { label: "Distraction Time",  value: `${log?.distractionTime ?? 0.9}h` },
            ].map((row, i, arr) => (
              <React.Fragment key={row.label}>
                <View className="flex-row justify-between py-3">
                  <Text className="text-muted text-sm">{row.label}</Text>
                  <Text className="text-white text-sm font-bold">{row.value}</Text>
                </View>
                {i < arr.length - 1 && <Divider className="my-0" />}
              </React.Fragment>
            ))}
          </Card>

          {/* TX Hash */}
          <Card elevated>
            <SectionHeader title="Transaction Hash" />
            <View className="bg-card rounded-xl px-4 py-3">
              <Text className="text-primary text-xs font-mono leading-5" selectable>
                {txHash || "0x7f3a2b1c9e8d5f4a0b6c3e2d1a9f8b7c5e4d3a2b1c0e9f8d7c6b5a4f3e2d1a0b"}
              </Text>
            </View>
            <View className="flex-row items-center gap-2 mt-3">
              <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.success} />
              <Text className="text-success text-xs">Cannot be altered or deleted</Text>
            </View>
          </Card>

          {/* Chain info */}
          <Card elevated>
            <View className="flex-row items-center justify-between py-1">
              <Text className="text-muted text-sm">Network</Text>
              <Badge label="Polygon Mumbai" variant="primary" />
            </View>
            <Divider />
            <View className="flex-row items-center justify-between py-1">
              <Text className="text-muted text-sm">Block</Text>
              <Text className="text-white text-sm font-bold">#48,392,104</Text>
            </View>
            <Divider />
            <View className="flex-row items-center justify-between py-1">
              <Text className="text-muted text-sm">Gas Used</Text>
              <Text className="text-white text-sm font-bold">21,000</Text>
            </View>
          </Card>

          <Button label="View on Explorer" onPress={() => {}} variant="outline" fullWidth />
        </View>
      </ScrollView>
    </View>
  );
}
