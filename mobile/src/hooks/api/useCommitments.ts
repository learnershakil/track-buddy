import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commitmentsService, CreateCommitmentPayload } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";

export const COMMITMENTS_KEY = "commitments";

export function useCommitments() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey:  [COMMITMENTS_KEY, userId],
    queryFn:   () => commitmentsService.listByUser(userId!),
    enabled:   !!userId,
  });
}

export function useCommitment(id: string) {
  return useQuery({
    queryKey: [COMMITMENTS_KEY, id],
    queryFn:  () => commitmentsService.getById(id),
    enabled:  !!id,
  });
}

export function useCreateCommitment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommitmentPayload) =>
      commitmentsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [COMMITMENTS_KEY] });
    },
  });
}

export function useConfirmCommitment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, txId }: { id: string; txId: string }) =>
      commitmentsService.confirm(id, txId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [COMMITMENTS_KEY] });
    },
  });
}

export function useOptIn() {
  return useMutation({
    mutationFn: (walletAddress: string) =>
      commitmentsService.buildOptIn(walletAddress),
  });
}
