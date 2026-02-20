import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { TeamStackParamList } from "../types";
import { ROUTES } from "@/constants/routes";

import { TeamMapScreen }      from "@/screens/team/TeamMapScreen";
import { MemberDetailScreen } from "@/screens/team/MemberDetailScreen";

const Stack = createNativeStackNavigator<TeamStackParamList>();

export function TeamStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.TEAM_MAP}      component={TeamMapScreen} />
      <Stack.Screen name={ROUTES.MEMBER_DETAIL} component={MemberDetailScreen} />
    </Stack.Navigator>
  );
}
