import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaWrapper }  from "@/components/layout/SafeAreaWrapper";
import { Header }           from "@/components/layout/Header";
import { Card }             from "@/components/ui/Card";
import { Badge }            from "@/components/ui/Badge";
import { Button }           from "@/components/ui/Button";
import { EmptyState }       from "@/components/ui/EmptyState";
import { MOCK_BOUNTIES }    from "@/constants/mock";
import { COLORS }           from "@/constants/theme";

type Tab = "available" | "mine";

const STATUS_STYLE: Record<string, "primary" | "muted" | "success"> = {
  open:      "primary",
  taken:     "muted",
  completed: "success",
};

export function BountyScreen() {
  const [tab, setTab]         = useState<Tab>("available");
  const [showCreate, setShow] = useState(false);
  const [taskTitle, setTitle] = useState("");
  const [reward, setReward]   = useState("");

  return (
    <SafeAreaWrapper>
      <Header
        title="Micro Bounties"
        showBack
        rightAction={{ icon: "add-circle-outline", onPress: () => setShow(true) }}
      />

      {/* Tabs */}
      <View className="flex-row mx-5 mb-4 bg-surface rounded-xl p-1">
        {(["available", "mine"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg items-center ${tab === t ? "bg-primary" : ""}`}
          >
            <Text className={`text-sm font-semibold capitalize ${tab === t ? "text-white" : "text-muted"}`}>
              {t === "mine" ? "My Bounties" : "Available"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="gap-3 pb-8">
          {tab === "available" ? (
            MOCK_BOUNTIES.map((b) => (
              <Card key={b.id} elevated>
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 pr-3">
                    <Text className="text-white text-sm font-bold">{b.title}</Text>
                    <Text className="text-muted text-xs mt-1">by {b.creator} · {b.category}</Text>
                  </View>
                  <View className="items-end gap-1.5">
                    <Text className="text-success text-base font-bold">₹{b.reward}</Text>
                    <Badge label={b.status} variant={STATUS_STYLE[b.status]} />
                  </View>
                </View>
                {b.status === "open" && (
                  <Button label="Accept Bounty" size="sm" fullWidth />
                )}
              </Card>
            ))
          ) : (
            <EmptyState
              icon="gift-outline"
              title="No Active Bounties"
              message="Create a bounty task to delegate work and save time."
              action={
                <Button label="Create Bounty" onPress={() => setShow(true)} size="sm" />
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Create modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-surface rounded-t-3xl px-6 pt-6 pb-12 gap-4">
            <Text className="text-white text-lg font-bold mb-2">Create Bounty Task</Text>
            <TextInput value={taskTitle} onChangeText={setTitle} placeholder="Describe the task"
              placeholderTextColor="#64748B"
              className="bg-card border border-border rounded-xl px-4 py-3.5 text-white" />
            <TextInput value={reward} onChangeText={setReward} placeholder="Reward amount (₹)"
              placeholderTextColor="#64748B" keyboardType="numeric"
              className="bg-card border border-border rounded-xl px-4 py-3.5 text-white" />
            <Button label="Post Bounty" onPress={() => { setShow(false); }} fullWidth />
            <Button label="Cancel" onPress={() => setShow(false)} variant="ghost" fullWidth />
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
}
