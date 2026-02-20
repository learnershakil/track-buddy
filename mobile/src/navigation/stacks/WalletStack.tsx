import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { WalletStackParamList } from "../types";
import { ROUTES } from "@/constants/routes";

import { WalletScreen }      from "@/screens/wallet/WalletScreen";
import { StakeScreen }       from "@/screens/wallet/StakeScreen";
import { CryptoUPIScreen }   from "@/screens/wallet/CryptoUPIScreen";
import { MicroSavingScreen } from "@/screens/wallet/MicroSavingScreen";
import { BountyScreen }      from "@/screens/wallet/BountyScreen";

const Stack = createNativeStackNavigator<WalletStackParamList>();

export function WalletStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.WALLET}       component={WalletScreen} />
      <Stack.Screen name={ROUTES.STAKE}        component={StakeScreen} />
      <Stack.Screen name={ROUTES.CRYPTO_UPI}   component={CryptoUPIScreen} />
      <Stack.Screen name={ROUTES.MICRO_SAVING} component={MicroSavingScreen} />
      <Stack.Screen name={ROUTES.BOUNTY}       component={BountyScreen} />
    </Stack.Navigator>
  );
}
