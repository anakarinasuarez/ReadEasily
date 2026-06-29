// Server-side instrumentation entrypoint. Next.js calls `register()` once when
// the server boots; we load the Sentry config for whichever runtime is active.
// `onRequestError` forwards errors from Server Components, route handlers and
// middleware to Sentry. All no-ops without a DSN.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
