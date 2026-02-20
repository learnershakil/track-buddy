import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RootStackParamList } from "./types";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore } from "@/store/app.store";

import { AuthNavigator } from "./AuthNavigator";
import { OnboardingNavigator } from "./OnboardingNavigator";
import { AppNavigator } from "./AppNavigator";

import { DistractionAlertScreen } from "@/screens/modals/DistractionAlertScreen";
import { FocusLockScreen }        from "@/screens/modals/FocusLockScreen";
import { AICallScreen }           from "@/screens/modals/AICallScreen";
import { DeadmanAlertScreen }     from "@/screens/modals/DeadmanAlertScreen";
import { OnChainRecordScreen }    from "@/screens/modals/OnChainRecordScreen";

const Root = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();
  const { isHardcoreLocked } = useAppStore();

  const getInitialRoute = () => {
    if (!isAuthenticated) return ROUTES.AUTH;
    if (!hasCompletedOnboarding) return ROUTES.ONBOARDING;
    return ROUTES.APP;
  };

  return (
    <Root.Navigator
      initialRouteName={getInitialRoute()}
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      {/* Main flows */}
      <Root.Screen name={ROUTES.AUTH}       component={AuthNavigator} />
      <Root.Screen name={ROUTES.ONBOARDING} component={OnboardingNavigator} />
      <Root.Screen name={ROUTES.APP}        component={AppNavigator} />

      {/* Global modals — always available from anywhere */}
      <Root.Group
        screenOptions={{
          presentation:  "fullScreenModal",
          headerShown:   false,
          gestureEnabled: false,
          animation:     "slide_from_bottom",
        }}
      >
        <Root.Screen name={ROUTES.FOCUS_LOCK}        component={FocusLockScreen} />
        <Root.Screen name={ROUTES.AI_CALL}           component={AICallScreen} />
        <Root.Screen name={ROUTES.DEADMAN_ALERT}     component={DeadmanAlertScreen} />
        <Root.Screen name={ROUTES.ON_CHAIN_RECORD}   component={OnChainRecordScreen} />
        <Root.Screen
          name={ROUTES.DISTRACTION_ALERT}
          component={DistractionAlertScreen}
          options={{ gestureEnabled: true }}
        />
      </Root.Group>
    </Root.Navigator>
  );
}
