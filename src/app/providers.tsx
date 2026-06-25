"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PreferencesEffects } from "./PreferencesEffects";

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
        // Retry a few times (exponential backoff ~1s/2s/4s). In dev this rides
        // out the MSW service-worker "claim" race: the worker is started
        // fire-and-forget and only takes control of the page a few hundred ms
        // after the first paint, so the very first query can hit the network
        // (404) before the mock is live. Retrying lets it succeed on the next
        // attempt instead of flashing the error state; against a real backend
        // it just adds normal transient-failure resilience.
        retry: 3,
        // Always attempt the request instead of pausing when React Query's
        // onlineManager believes the browser is offline. Our data is same-origin
        // (MSW today, an HTTP backend later), so "offline pausing" gives no
        // benefit and can hang a query forever if the manager initialises
        // offline and never sees an `online` event to resume it.
        networkMode: "always",
      },
      mutations: {
        // Same rationale as queries — never pause writes on perceived-offline.
        networkMode: "always",
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Keep one client per browser session; useState's initializer runs once so a
  // re-render never throws the cache away.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {/* App-root preference effects: hydrate the persisted store once + reflect
          reduceMotion onto <html> for the global reduced-motion reset. */}
      <PreferencesEffects />
      {children}
    </QueryClientProvider>
  );
}
