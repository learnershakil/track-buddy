import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/services/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failCount, error) => {
        if (error instanceof ApiError && error.statusCode < 500) return false;
        return failCount < 2;
      },
      staleTime: 1000 * 60 * 2,      // 2 min
      gcTime:    1000 * 60 * 10,     // 10 min cache
    },
    mutations: {
      retry: false,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
