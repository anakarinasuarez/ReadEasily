// Sentry initialization for the Node.js server runtime. Loaded by
// `instrumentation.ts`. A blank DSN makes this a no-op, so the app and CI build
// run fine without Sentry configured.
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
