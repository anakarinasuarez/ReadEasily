/**
 * Client-side instrumentation (Next runs this before the app becomes
 * interactive). Two responsibilities:
 *   1. Initialize Sentry in the browser (errors + Web Vitals). No-op without a
 *      DSN, so dev/CI are unaffected until one is configured.
 *   2. Start the MSW Service Worker in development only, so the running app is
 *      served by the same mock handlers the tests use. The dynamic import keeps
 *      msw/browser and the handlers out of the production bundle; the worker is
 *      never started outside development.
 */
import * as Sentry from "@sentry/nextjs";

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

if (process.env.NODE_ENV === "development") {
  void import("../tests/mocks/browser").then(({ worker }) =>
    // `bypass` lets real assets/HMR through; only declared handlers are mocked.
    worker.start({ onUnhandledRequest: "bypass" }),
  );
}
