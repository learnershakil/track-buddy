import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { Header }          from "@/components/layout/Header";
import { Card }            from "@/components/ui/Card";
import { Divider }         from "@/components/ui/Divider";
import { useAuthStore }    from "@/store/auth.store";
import { useAppStore }     from "@/store/app.store";
import { COLORS }          from "@/constants/theme";

function SettingsRow({
  icon, label, value, onPress, danger = false, rightEl,
}: {
  icon: string; label: string; value?: string;
  onPress?: () => void; danger?: boolean; rightEl?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !rightEl}
      className="flex-row items-center gap-3 py-3.5"
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: danger ? `${COLORS.danger}15` : `${COLORS.muted}15` }}>
        <Ionicons name={icon as any} size={17} color={danger ? COLORS.danger : COLORS.muted} />
      </View>
      <Text className={`flex-1 text-sm font-semibold ${danger ? "text-danger" : "text-white"}`}>{label}</Text>
      {value && <Text className="text-muted text-xs">{value}</Text>}
      {rightEl ?? (onPress && <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />)}
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const navigation       = useNavigation();
  const { user, logout } = useAuthStore();
  const { mode, setMode } = useAppStore();
  const isHardcore = mode === "hardcore";

  return (
    <SafeAreaWrapper>
      <Header title="Settings" showBack />
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pt-2 pb-8">

          {/* Account */}
          <Card elevated>
            <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-3 px-1">Account</Text>
            <SettingsRow icon="person-outline"    label="Name"   value={user?.name} />
            <Divider className="my-0" />
            <SettingsRow icon="mail-outline"      label="Email"  value={user?.email} />
            <Divider className="my-0" />
            <SettingsRow icon="wallet-outline"    label="Wallet" value={user?.walletAddress ?? "Not connected"} />
          </Card>

          {/* Mode */}
          <Card elevated>
            <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-3 px-1">Discipline Mode</Text>
            <View className="flex-row items-center gap-3 py-3.5">
              <View className="w-8 h-8 rounded-lg bg-primary/15 items-center justify-center">
                <Ionicons name="skull-outline" size={17} color={COLORS.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm font-semibold">Hardcore Mode</Text>
                <Text className="text-muted text-xs mt-0.5">Real penalties + AI control</Text>
              </View>
              <Switch
                value={isHardcore}
                onValueChange={(v) => setMode(v ? "hardcore" : "normal")}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </Card>

          {/* Notifications */}
          <Card elevated>
            <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-3 px-1">Notifications</Text>
            {[
              { icon: "notifications-outline", label: "Focus reminders"     },
              { icon: "call-outline",          label: "AI accountability calls" },
              { icon: "warning-outline",       label: "Deadman mode alerts" },
            ].map((n, i, arr) => (
              <React.Fragment key={n.label}>
                <SettingsRow
                  icon={n.icon} label={n.label}
                  rightEl={<Switch value={true} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor={COLORS.white} />}
                />
                {i < arr.length - 1 && <Divider className="my-0" />}
              </React.Fragment>
            ))}
          </Card>

          {/* Integrations */}
          <Card elevated>
            <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-3 px-1">Integrations</Text>
            <SettingsRow icon="globe-outline"       label="Chrome Extension"  onPress={() => {}} />
            <Divider className="my-0" />
            <SettingsRow icon="code-slash-outline"  label="VSCode Plugin"     onPress={() => {}} />
            <Divider className="my-0" />
            <SettingsRow icon="desktop-outline"     label="Desktop Agent"     onPress={() => {}} />
          </Card>

          {/* Danger zone */}
          <Card elevated>
            <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-3 px-1">Account</Text>
            <SettingsRow icon="log-out-outline"  label="Sign Out"        onPress={logout}  danger />
            <Divider className="my-0" />
            <SettingsRow icon="trash-outline"    label="Delete Account"  onPress={() => {}} danger />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
