import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { AppTabParamList } from "./types";
import { ROUTES } from "@/constants/routes";
import { CustomTabBar } from "@/components/layout/CustomTabBar";

import { DashboardStack } from "./stacks/DashboardStack";
import { FocusStack }     from "./stacks/FocusStack";
import { TeamStack }      from "./stacks/TeamStack";
import { WalletStack }    from "./stacks/WalletStack";
import { ProfileStack }   from "./stacks/ProfileStack";

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name={ROUTES.DASHBOARD_STACK} component={DashboardStack} />
      <Tab.Screen name={ROUTES.FOCUS_STACK}     component={FocusStack} />
      <Tab.Screen name={ROUTES.TEAM_STACK}      component={TeamStack} />
      <Tab.Screen name={ROUTES.WALLET_STACK}    component={WalletStack} />
      <Tab.Screen name={ROUTES.PROFILE_STACK}   component={ProfileStack} />
    </Tab.Navigator>
  );
}
