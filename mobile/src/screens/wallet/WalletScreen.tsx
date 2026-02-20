import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper }  from "@/components/layout/SafeAreaWrapper";
import { Card }             from "@/components/ui/Card";
import { SectionHeader }    from "@/components/ui/SectionHeader";
import { Divider }          from "@/components/ui/Divider";
import { useWalletStore }   from "@/store/wallet.store";
import { COLORS }           from "@/constants/theme";
import { ROUTES }           from "@/constants/routes";

const QUICK_ACTIONS = [
  { label: "Stake",   icon: "lock-closed-outline" as const, color: COLORS.primary, route: ROUTES.STAKE      },
  { label: "Pay UPI", icon: "qr-code-outline" as const,     color: COLORS.accent,  route: ROUTES.CRYPTO_UPI },
  { label: "Save",    icon: "save-outline" as const,        color: COLORS.success, route: ROUTES.MICRO_SAVING },
  { label: "Bounty",  icon: "gift-outline" as const,        color: COLORS.muted,   route: ROUTES.BOUNTY     },
];

const TX_ICONS: Record<string, { icon: string; color: string }> = {
  stake:   { icon: "lock-closed-outline", color: COLORS.primary },
  reward:  { icon: "star-outline",        color: COLORS.success  },
  penalty: { icon: "warning-outline",     color: COLORS.danger   },
  saving:  { icon: "save-outline",        color: COLORS.accent   },
  payment: { icon: "arrow-up-outline",    color: COLORS.muted    },
};

export function WalletScreen() {
  const navigation = useNavigation();
  const { balance, stakedAmount, rewardBalance, savedBalance, walletAddress, transactions } = useWalletStore();

  return (
    <SafeAreaWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-8 gap-4">

          {/* Balance hero */}
          <Card elevated className="py-8 items-center">
            <Text className="text-muted text-sm font-semibold uppercase tracking-wider mb-2">Total Balance</Text>
            <Text className="text-white text-5xl font-bold">₹{balance.toLocaleString("en-IN")}</Text>
            <Text className="text-muted text-xs mt-2">{walletAddress ?? "Wallet not connected"}</Text>
            <View className="flex-row gap-6 mt-6">
              {[
                { label: "Staked",  value: `₹${stakedAmount}`,  color: COLORS.primary },
                { label: "Rewards", value: `₹${rewardBalance}`, color: COLORS.success },
                { label: "Saved",   value: `₹${savedBalance}`,  color: COLORS.accent  },
              ].map((s) => (
                <View key={s.label} className="items-center">
                  <Text className="text-lg font-bold" style={{ color: s.color }}>{s.value}</Text>
                  <Text className="text-muted text-xs mt-0.5">{s.label}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Quick actions */}
          <View className="flex-row gap-3">
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => (navigation as any).navigate(a.route)}
                className="flex-1 bg-surface border border-border rounded-2xl py-4 items-center gap-1.5"
              >
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${a.color}20` }}>
                  <Ionicons name={a.icon} size={20} color={a.color} />
                </View>
                <Text className="text-white text-xs font-semibold">{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Transaction history */}
          <Card elevated>
            <SectionHeader title="Recent Transactions" />
            {transactions.length === 0 ? (
              <Text className="text-muted text-sm text-center py-8">No transactions yet</Text>
            ) : (
              transactions.map((tx, i) => {
                const meta = TX_ICONS[tx.type] ?? TX_ICONS.payment;
                const isDebit = tx.type === "penalty" || tx.type === "payment" || tx.type === "stake";
                return (
                  <React.Fragment key={tx.id}>
                    <View className="flex-row items-center gap-3 py-3">
                      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${meta.color}15` }}>
                        <Ionicons name={meta.icon as any} size={18} color={meta.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-sm font-semibold capitalize">{tx.type}</Text>
                        <Text className="text-muted text-xs mt-0.5" numberOfLines={1}>{tx.note}</Text>
                      </View>
                      <Text className={`text-sm font-bold ${isDebit ? "text-danger" : "text-success"}`}>
                        {isDebit ? "-" : "+"}₹{tx.amount}
                      </Text>
                    </View>
                    {i < transactions.length - 1 && <Divider className="my-0" />}
                  </React.Fragment>
                );
              })
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
