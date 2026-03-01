import { useMutation } from "@tanstack/react-query";
import { callsService } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";

export function useTriggerCall() {
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (message?: string) =>
      callsService.trigger(userId!, message),
  });
}

export function useViolationCall() {
  return useMutation({
    mutationFn: ({ userId, commitmentId }: { userId: string; commitmentId: string }) =>
      callsService.violation(userId, commitmentId),
  });
}
