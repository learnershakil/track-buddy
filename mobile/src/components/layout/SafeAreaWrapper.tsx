import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaWrapperProps {
  children:   React.ReactNode;
  className?: string;
}

export function SafeAreaWrapper({ children, className = "" }: SafeAreaWrapperProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={`flex-1 bg-background ${className}`}
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {children}
    </View>
  );
}
