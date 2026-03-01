import { useQuery, useMutation } from "@tanstack/react-query";
import { bridgeService } from "@/services/api";

export function useAlgoPrice() {
  return useQuery({
    queryKey:  ["algo-price"],
    queryFn:   () => bridgeService.getPrice(),
    staleTime: 1000 * 60,    // 1 min (backend caches 1 min too)
    refetchInterval: 1000 * 60,
  });
}

export function useConvertAlgo(algoAmount: number) {
  return useQuery({
    queryKey:  ["algo-convert", algoAmount],
    queryFn:   () => bridgeService.convert(algoAmount),
    enabled:   algoAmount > 0,
  });
}

export function useBridgePayout() {
  return useMutation({
    mutationFn: ({
      bridgeId,
      algoAmount,
      userUpiId,
    }: {
      bridgeId: string;
      algoAmount: number;
      userUpiId: string;
    }) => bridgeService.payout(bridgeId, algoAmount, userUpiId),
  });
}

export function useBridgeStatus(id: string) {
  return useQuery({
    queryKey: ["bridge-status", id],
    queryFn:  () => bridgeService.getStatus(id),
    enabled:  !!id,
    refetchInterval: 5000,   // poll every 5s while status pending
  });
}
