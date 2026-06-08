import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = error?.response?.status || error?.status;
        // Don't retry on client errors (400-499), especially 401/403
        if (status >= 400 && status < 500) return false;
        // Retry up to 5 times for other errors (e.g. 500, network failure)
        return failureCount < 5;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
