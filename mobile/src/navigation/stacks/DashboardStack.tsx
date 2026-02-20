import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { DashboardStackParamList } from "../types";
import { ROUTES } from "@/constants/routes";

import { DashboardScreen }      from "@/screens/dashboard/DashboardScreen";
import { AIReportScreen }       from "@/screens/dashboard/AIReportScreen";
import { FuturePredictorScreen } from "@/screens/dashboard/FuturePredictorScreen";
import { ControlMyLifeScreen }  from "@/screens/dashboard/ControlMyLifeScreen";
import { FocusHomeScreen } from "@/screens/focus/FocusHomeScreen";
import { StakeScreen } from "@/screens/wallet/StakeScreen";

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.DASHBOARD_SCREEN}  component={DashboardScreen} />
      <Stack.Screen name={ROUTES.FOCUS_HOME}    component={FocusHomeScreen} />
      <Stack.Screen name={ROUTES.STAKE}        component={StakeScreen} />
      <Stack.Screen name={ROUTES.AI_REPORT}         component={AIReportScreen} />
      <Stack.Screen name={ROUTES.FUTURE_PREDICTOR}  component={FuturePredictorScreen} />
      <Stack.Screen name={ROUTES.CONTROL_MY_LIFE}   component={ControlMyLifeScreen} />
    </Stack.Navigator>
  );
}
