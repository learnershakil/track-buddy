import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import { ROUTES } from "@/constants/routes";

type TabIcon = {
  active:   keyof typeof Ionicons.glyphMap;
  inactive: keyof typeof Ionicons.glyphMap;
  label:    string;
};

const TAB_ICONS: Record<string, TabIcon> = {
  [ROUTES.DASHBOARD_STACK]: { active: "grid",         inactive: "grid-outline",         label: "Home"    },
  [ROUTES.FOCUS_STACK]:     { active: "timer",         inactive: "timer-outline",         label: "Focus"   },
  [ROUTES.TEAM_STACK]:      { active: "people",        inactive: "people-outline",        label: "Team"    },
  [ROUTES.WALLET_STACK]:    { active: "wallet",        inactive: "wallet-outline",        label: "Wallet"  },
  [ROUTES.PROFILE_STACK]:   { active: "person-circle", inactive: "person-circle-outline", label: "Profile" },
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row bg-surface border-t border-border px-2"
      style={{ paddingBottom: insets.bottom || 12, paddingTop: 10 }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const icons     = TAB_ICONS[route.name];

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            className="flex-1 items-center justify-center gap-1"
            accessibilityRole="button"
          >
            {/* Focus indicator dot */}
            {isFocused && (
              <View className="absolute -top-1 w-1 h-1 rounded-full bg-primary" />
            )}
            <Ionicons
              name={isFocused ? icons?.active : icons?.inactive}
              size={24}
              color={isFocused ? COLORS.primary : COLORS.muted}
            />
            <Text
              className={`text-xs ${isFocused ? "text-primary font-semibold" : "text-muted"}`}
            >
              {icons?.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
