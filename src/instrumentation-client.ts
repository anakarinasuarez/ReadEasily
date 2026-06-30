/**
 * Client-side instrumentation (Next runs this before the app becomes
 * interactive). Two responsibilities:
 *   1. Initialize Sentry in the browser (errors + Web Vitals). No-op without a
 *      DSN, so dev/CI are unaffected until one is configured.
 *   2. Start the MSW Service Worker so the app is served by the same mock
 *      handlers the tests use. Active in development, and in any environment
 *      where `NEXT_PUBLIC_API_MOCKING=enabled` is set — that flag turns the
 *      Vercel deployment into a working, mock-backed DEMO until a real backend
 *      (Supabase) is wired. The dynamic import keeps msw/browser + the handlers
 *      out of the bundle whenever mocking is off (the default for real prod).
 */
import * as Sentry from "@sentry/nextjs";
import { startMocking } from "./lib/msw/browser-mocking";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  // Sample 10% of transactions in production; tune to taste / budget.
  tracesSampleRate: 0.1,
  // Don't send default PII (IP, cookies). Flip on only with a privacy review.
  sendDefaultPii: false,
});

// Instruments App Router client-side navigations for tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// Start MSW as early as possible. Providers re-fetches once it's ready so the
// first paint's queries aren't lost to the service-worker "claim" race.
void startMocking();
