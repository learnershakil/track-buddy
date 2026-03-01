import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/services/api";

export function useBackendHealth() {
  return useQuery({
    queryKey:        ["health"],
    queryFn:         () => healthService.check(),
    staleTime:       30_000,
    refetchInterval: 30_000,
    retry:           1,
  });
}
