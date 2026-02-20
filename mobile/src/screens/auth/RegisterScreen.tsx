import React, { useState } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AuthStackParamList } from "@/navigation/types";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/Button";
import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";

type Nav = NativeStackNavigationProp<AuthStackParamList, "Register">;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    // TODO: Call auth.api.ts register endpoint
    setTimeout(() => {
      setLoading(false);
      navigation.navigate(ROUTES.CONNECT_WALLET);
    }, 1000);
  };

  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
          <View className="mb-10">
            <Text className="text-white text-3xl font-bold">Create Account</Text>
            <Text className="text-muted text-sm mt-2">Start your discipline journey today.</Text>
          </View>

          <View className="gap-4">
            {[
              { label: "Full Name",       value: name,     setter: setName,     placeholder: "John Doe",         type: "default" as const },
              { label: "Email",           value: email,    setter: setEmail,    placeholder: "you@example.com", type: "email-address" as const },
              { label: "Password",        value: password, setter: setPassword, placeholder: "Min 8 characters", type: "default" as const, secure: true },
            ].map(({ label, value, setter, placeholder, type, secure }) => (
              <View key={label}>
                <Text className="text-muted text-sm mb-2 font-medium">{label}</Text>
                <TextInput
                  value={value}
                  onChangeText={setter}
                  placeholder={placeholder}
                  placeholderTextColor="#94A3B8"
                  keyboardType={type}
                  autoCapitalize="none"
                  secureTextEntry={secure}
                  className="bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-base"
                />
              </View>
            ))}

            <Button label="Create Account" onPress={handleRegister} loading={loading} fullWidth size="lg" />

            <View className="flex-row items-center gap-2 justify-center mt-4">
              <Text className="text-muted text-sm">Already have an account?</Text>
              <Text
                className="text-primary text-sm font-semibold"
                onPress={() => navigation.goBack()}
              >
                Sign In
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
