import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";
import { useWallet } from "@/providers/WalletProvider";
import { useWalletStore } from "@/store/wallet.store";
import { useAuthStore } from "@/store/auth.store";

const WALLET_OPTIONS = [
  { id: "metamask",     name: "MetaMask",     icon: "wallet-outline" as const },
  { id: "walletconnect",name: "WalletConnect", icon: "link-outline" as const },
  { id: "coinbase",     name: "Coinbase",     icon: "card-outline" as const },
];

export function ConnectWalletScreen() {
  const navigation              = useNavigation();
  const { connectWallet }       = useWallet();
  const { setWalletAddress }    = useWalletStore();
  const { setOnboardingComplete } = useAuthStore(); // skip to onboarding after connect
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleConnect = async () => {
    if (!selected) return;
    setLoading(true);
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
      // Navigate to onboarding after wallet connect
      (navigation as any).replace("Onboarding");
    }
    setLoading(false);
  };

  return (
    <SafeAreaWrapper>
      <View className="flex-1 px-6 justify-center">
        <View className="mb-10">
          <View className="w-14 h-14 rounded-2xl bg-accent/20 items-center justify-center mb-4">
            <Ionicons name="wallet" size={28} color={COLORS.accent} />
          </View>
          <Text className="text-white text-3xl font-bold">Connect Wallet</Text>
          <Text className="text-muted text-sm mt-2">
            Required for staking, rewards, and on-chain records.
          </Text>
        </View>

        <View className="gap-3 mb-8">
          {WALLET_OPTIONS.map((wallet) => (
            <TouchableOpacity
              key={wallet.id}
              onPress={() => setSelected(wallet.id)}
              className={`
                flex-row items-center gap-4 p-4 rounded-2xl border
                ${selected === wallet.id ? "border-primary bg-primary/10" : "border-border bg-surface"}
              `}
            >
              <View className={`w-10 h-10 rounded-xl items-center justify-center ${selected === wallet.id ? "bg-primary" : "bg-card"}`}>
                <Ionicons name={wallet.icon} size={20} color={selected === wallet.id ? COLORS.white : COLORS.muted} />
              </View>
              <Text className={`flex-1 text-base font-semibold ${selected === wallet.id ? "text-white" : "text-muted"}`}>
                {wallet.name}
              </Text>
              {selected === wallet.id && (
                <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Button label="Connect" onPress={handleConnect} loading={loading} disabled={!selected} fullWidth size="lg" />

        <TouchableOpacity className="mt-4 items-center" onPress={() => (navigation as any).replace("Onboarding")}>
          <Text className="text-muted text-sm">Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaWrapper>
  );
}
