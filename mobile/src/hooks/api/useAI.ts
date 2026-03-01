import { useQuery, useMutation } from "@tanstack/react-query";
import { aiService } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";

export function useAISummary() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey:   ["ai-summary", userId],
    queryFn:    () => aiService.summary(userId!),
    enabled:    !!userId,
    staleTime:  1000 * 60 * 5,  // refresh every 5 min
  });
}

export function useAIAnalysis() {
  return useMutation({
    mutationFn: ({ userId, commitmentId }: { userId: string; commitmentId?: string }) =>
      aiService.analyze(userId, commitmentId),
  });
}

export function useAIPredict() {
  return useMutation({
    mutationFn: ({ userId, commitmentId }: { userId: string; commitmentId?: string }) =>
      aiService.predict(userId, commitmentId),
  });
}
