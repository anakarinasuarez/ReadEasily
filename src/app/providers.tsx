"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * App-wide client providers. Only this subtree is a Client Component — the
 * layout and pages stay Server Components, so static parts keep rendering on
 * the server (Next docs: render providers as deep as possible, wrapping just
 * `children`).
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Treat data fresh for a minute so quick navigations don't refetch.
        staleTime: 60_000,
        // Avoid surprise refetches while developing against mocks.
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Keep one client per browser session; useState's initializer runs once so a
  // re-render never throws the cache away.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
