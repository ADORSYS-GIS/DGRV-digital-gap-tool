import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Data is considered fresh for 2 minutes — no refetch on every mount
      staleTime: 2 * 60 * 1000,
      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Don't refetch just because the window regained focus
      refetchOnWindowFocus: false,
      // Do refetch when the network comes back online
      refetchOnReconnect: true,
    },
  },
});
