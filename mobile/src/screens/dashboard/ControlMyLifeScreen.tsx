import React, { useState } from "react";
import { View, Text, Switch, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { Header }          from "@/components/layout/Header";
import { Card }            from "@/components/ui/Card";
import { Badge }           from "@/components/ui/Badge";
import { Button }          from "@/components/ui/Button";
import { Divider }         from "@/components/ui/Divider";
import { useAppStore }     from "@/store/app.store";
import { COLORS }          from "@/constants/theme";

const HARDCORE_FEATURES = [
  { id: "appLock",     icon: "lock-closed-outline",   label: "App Lock",             desc: "Phone locks during focus",     color: COLORS.primary },
  { id: "stakePenalty",icon: "cash-outline",           label: "Stake Penalty",        desc: "Auto-deduct on distraction",   color: COLORS.accent  },
  { id: "aiCall",      icon: "call-outline",           label: "AI Accountability Call",desc: "AI calls when you skip goals", color: COLORS.danger  },
  { id: "blocking",    icon: "shield-outline",         label: "Distraction Blocking",  desc: "Block apps during sessions",   color: COLORS.success },
  { id: "deadman",     icon: "warning-outline",        label: "Deadman Mode",          desc: "Alert partner if inactive",    color: COLORS.muted   },
];

export function ControlMyLifeScreen() {
  const { mode, isAIControlActive, setMode, setAIControl } = useAppStore();
  const [features, setFeatures] = useState<Record<string, boolean>>({
    appLock:      true,
    stakePenalty: true,
    aiCall:       true,
    blocking:     true,
    deadman:      false,
  });

  const toggle = (id: string) =>
    setFeatures((prev) => ({ ...prev, [id]: !prev[id] }));

  const isHardcore = mode === "hardcore";

  return (
    <SafeAreaWrapper>
      <Header title="Control My Life" showBack />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 gap-4 pb-8">

          {/* AI Status */}
          <Card elevated className={`items-center py-8 ${isAIControlActive ? "border-danger" : "border-border"}`}>
            <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${isAIControlActive ? "bg-danger/20" : "bg-primary/10"}`}>
              <Ionicons
                name={isAIControlActive ? "shield-checkmark" : "shield-outline"}
                size={38}
                color={isAIControlActive ? COLORS.danger : COLORS.primary}
              />
            </View>
            <Text className="text-white text-xl font-bold">
              {isAIControlActive ? "AI Has Control" : "You Have Control"}
            </Text>
            <Text className="text-muted text-sm mt-1 text-center px-6">
              {isAIControlActive
                ? "System enforcing all active features."
                : "Enable hardcore mode to hand over control."}
            </Text>
            <View className="mt-4">
              <Badge
                label={isAIControlActive ? "ACTIVE" : mode.toUpperCase()}
                variant={isAIControlActive ? "danger" : isHardcore ? "primary" : "muted"}
              />
            </View>
          </Card>

          {/* Big control button */}
          <Button
            label={isAIControlActive ? "⚠️  Disable AI Control" : "🛡  Activate AI Control"}
            onPress={() => setAIControl(!isAIControlActive)}
            variant={isAIControlActive ? "danger" : "primary"}
            fullWidth size="lg"
          />

          {/* Mode toggle */}
          <Card elevated>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-base font-bold">Hardcore Mode</Text>
                <Text className="text-muted text-xs mt-0.5">Real penalties · AI control · App lock</Text>
              </View>
              <Switch
                value={isHardcore}
                onValueChange={(v) => setMode(v ? "hardcore" : "normal")}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </Card>

          {/* Feature toggles */}
          <Card elevated>
            <Text className="text-white text-base font-bold mb-4">Feature Controls</Text>
            <View className="gap-1">
              {HARDCORE_FEATURES.map((f, i) => (
                <React.Fragment key={f.id}>
                  <View className="flex-row items-center gap-3 py-3">
                    <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${f.color}15` }}>
                      <Ionicons name={f.icon as any} size={20} color={f.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-sm font-semibold">{f.label}</Text>
                      <Text className="text-muted text-xs mt-0.5">{f.desc}</Text>
                    </View>
                    <Switch
                      value={features[f.id]}
                      onValueChange={() => toggle(f.id)}
                      trackColor={{ false: COLORS.border, true: f.color }}
                      thumbColor={COLORS.white}
                      disabled={!isHardcore}
                    />
                  </View>
                  {i < HARDCORE_FEATURES.length - 1 && <Divider className="my-0" />}
                </React.Fragment>
              ))}
            </View>
          </Card>

          {/* Quote */}
          <View className="border border-border rounded-2xl px-5 py-4">
            <Text className="text-muted text-sm text-center italic leading-6">
              "Most apps track you. This one can control you."
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
