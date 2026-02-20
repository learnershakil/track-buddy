import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { FocusStackParamList } from "../types";
import { ROUTES } from "@/constants/routes";

import { FocusHomeScreen }    from "@/screens/focus/FocusHomeScreen";
import { FocusSessionScreen } from "@/screens/focus/FocusSessionScreen";
import { TaskCreateScreen }   from "@/screens/focus/TaskCreateScreen";

const Stack = createNativeStackNavigator<FocusStackParamList>();

export function FocusStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.FOCUS_HOME}    component={FocusHomeScreen} />
      <Stack.Screen name={ROUTES.FOCUS_SESSION} component={FocusSessionScreen} />
      <Stack.Screen name={ROUTES.TASK_CREATE}   component={TaskCreateScreen} />
    </Stack.Navigator>
  );
}
