import "../global.css";

import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "@/navigation/RootNavigator";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WalletProvider } from "@/providers/WalletProvider";
import { SocketProvider } from "@/providers/SocketProvider";

export default function App() {
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <ThemeProvider>
          <WalletProvider>
            <SocketProvider>
              <NavigationContainer>
                <StatusBar style="light" backgroundColor="#0A0A0F" />
                <RootNavigator />
              </NavigationContainer>
            </SocketProvider>
          </WalletProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
