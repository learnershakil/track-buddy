import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ProfileStackParamList } from "../types";
import { ROUTES } from "@/constants/routes";

import { ProfileScreen }  from "@/screens/profile/ProfileScreen";
import { SettingsScreen } from "@/screens/profile/SettingsScreen";
import { NotificationsScreen } from "@/screens/notifications/NotificationsScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.PROFILE}  component={ProfileScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
