import React from "react";
import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";

export function PartnerSetupScreen() {
  const navigation = useNavigation();
  const { setOnboardingComplete } = useAuthStore();

  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-6 justify-center">
        <Text className="text-muted text-sm font-semibold uppercase tracking-wider">Step 3 of 3</Text>
        <Text className="text-white text-3xl font-bold mt-2 mb-4">Add Accountability{"\n"}Partner</Text>
        <Text className="text-muted text-sm mb-10">
          They'll be notified if you go inactive or miss goals.
        </Text>
        {/* TODO: Add partner search / invite UI */}
        <Button label="Skip for Now" variant="outline" onPress={() => { setOnboardingComplete(); (navigation as any).replace("App"); }} fullWidth size="lg" />
      </View>
    </SafeAreaWrapper>
  );
}
