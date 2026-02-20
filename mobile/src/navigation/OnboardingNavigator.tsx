import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OnboardingStackParamList } from "./types";
import { ROUTES } from "@/constants/routes";

import { GoalsScreen }       from "@/screens/onboarding/GoalsScreen";
import { ModeSelectScreen }  from "@/screens/onboarding/ModeSelectScreen";
import { PartnerSetupScreen } from "@/screens/onboarding/PartnerSetupScreen";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name={ROUTES.GOALS}        component={GoalsScreen} />
      <Stack.Screen name={ROUTES.MODE_SELECT}  component={ModeSelectScreen} />
      <Stack.Screen name={ROUTES.PARTNER_SETUP} component={PartnerSetupScreen} />
    </Stack.Navigator>
  );
}
