import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionsService, LogSessionPayload } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import { COMMITMENTS_KEY } from "./useCommitments";

export function useLogSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LogSessionPayload) =>
      sessionsService.log(payload),
    onSuccess: () => {
      // Refresh commitments so session logs & violations stay in sync
      qc.invalidateQueries({ queryKey: [COMMITMENTS_KEY] });
    },
  });
}

export function useSessions() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["sessions", userId],
    queryFn:  () => sessionsService.listByUser(userId!),
    enabled:  !!userId,
  });
}
