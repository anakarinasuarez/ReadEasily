import { http, HttpResponse } from "msw";

/**
 * Mock-first API surface. ReadEasily runs against these handlers everywhere —
 * unit tests (node), e2e/dev (browser worker) — until real Supabase endpoints
 * are wired. Feature/backend engineers append their handlers to this array;
 * keep it the single source of mock truth so node + browser stay in sync.
 *
 * Convention: mock under the `/api/*` prefix so real fetches and mocks share a
 * path namespace and swapping in the real backend is a base-URL change.
 */
export const handlers = [
  // Health/echo — the canary that proves mocking is live in any environment.
  http.get("/api/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),

  // Reference demo endpoint, consumed by the Query+MSW proof component/test.
  // Safe to delete once real feature handlers land.
  http.get("/api/demo/greeting", () => {
    return HttpResponse.json({ message: "Hello from MSW" });
  }),
];
