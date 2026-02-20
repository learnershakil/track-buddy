import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { Header }          from "@/components/layout/Header";
import { Card }            from "@/components/ui/Card";
import { Button }          from "@/components/ui/Button";
import { useWalletStore }  from "@/store/wallet.store";
import { COLORS }          from "@/constants/theme";

export function CryptoUPIScreen() {
  const { balance, addTransaction } = useWalletStore();
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId]   = useState("");
  const [paid, setPaid]     = useState(false);

  const handlePay = () => {
    if (!amount || !upiId) return;
    addTransaction({ type: "payment", amount: Number(amount), note: `UPI → ${upiId}` });
    setPaid(true);
  };

  if (paid) {
    return (
      <SafeAreaWrapper>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-success/20 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={44} color={COLORS.success} />
          </View>
          <Text className="text-white text-2xl font-bold">Payment Sent</Text>
          <Text className="text-muted text-sm mt-2 text-center">
            Paid ₹{amount} via UPI to {upiId}
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Header title="Crypto → UPI" showBack />
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="gap-5 pt-2 pb-8">

          {/* QR scanner placeholder */}
          <TouchableOpacity
            className="bg-surface border-2 border-dashed border-border rounded-2xl h-48 items-center justify-center gap-3"
            activeOpacity={0.8}
          >
            <View className="w-14 h-14 rounded-2xl bg-primary/20 items-center justify-center">
              <Ionicons name="qr-code-outline" size={30} color={COLORS.primary} />
            </View>
            <Text className="text-white text-sm font-semibold">Tap to Scan UPI QR</Text>
            <Text className="text-muted text-xs">Camera permission required</Text>
          </TouchableOpacity>

          {/* Manual entry */}
          <View>
            <Text className="text-muted text-sm font-semibold mb-2">UPI ID</Text>
            <TextInput
              value={upiId}
              onChangeText={setUpiId}
              placeholder="name@upi"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              className="bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-base"
            />
          </View>

          <View>
            <Text className="text-muted text-sm font-semibold mb-2">Amount (₹)</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              className="bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-base"
            />
          </View>

          {/* Conversion info */}
          <Card elevated>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted text-sm">Conversion Rate</Text>
              <Text className="text-white text-sm font-bold">1 USDT ≈ ₹83.2</Text>
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-muted text-sm">Wallet Balance</Text>
              <Text className="text-white text-sm font-bold">₹{balance.toLocaleString("en-IN")}</Text>
            </View>
          </Card>

          <Button
            label="Pay via UPI"
            onPress={handlePay}
            disabled={!amount || !upiId}
            fullWidth size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
