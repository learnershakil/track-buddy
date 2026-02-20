import React, { useState } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AuthStackParamList } from "@/navigation/types";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/Button";
import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { useAuthStore } from "@/store/auth.store";

type Nav = NativeStackNavigationProp<AuthStackParamList, "Login">;

export function LoginScreen() {
  const navigation    = useNavigation<Nav>();
  const { setUser }   = useAuthStore();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // TODO: Call auth.api.ts
    setTimeout(() => {
      setUser({ id: "1", email, name: "Founder" }, "mock_token");
      setLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
          {/* Brand */}
          <View className="items-center mb-12">
            <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">TB</Text>
            </View>
            <Text className="text-white text-3xl font-bold">TrackBuddy</Text>
            <Text className="text-muted text-sm mt-2">AI that enforces discipline.</Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <View>
              <Text className="text-muted text-sm mb-2 font-medium">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-base"
              />
            </View>
            <View>
              <Text className="text-muted text-sm mb-2 font-medium">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                className="bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-base"
              />
            </View>

            <Button label="Sign In" onPress={handleLogin} loading={loading} fullWidth size="lg" />

            <View className="flex-row items-center gap-2 justify-center mt-4">
              <Text className="text-muted text-sm">Don't have an account?</Text>
              <Text
                className="text-primary text-sm font-semibold"
                onPress={() => navigation.navigate(ROUTES.REGISTER)}
              >
                Sign Up
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
