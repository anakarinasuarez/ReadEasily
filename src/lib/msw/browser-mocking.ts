/**
 * Browser-side mock control (MSW). Shared by `instrumentation-client.ts` (starts
 * the worker as early as possible) and the app's Providers (refetches once the
 * worker is ready). Centralizing it in one module keeps the start a singleton:
 * both callers await the SAME promise, so the worker starts exactly once.
 *
 * Mocking is on in development, and in any environment where
 * `NEXT_PUBLIC_API_MOCKING=enabled` — that flag turns a Vercel deployment into a
 * working, mock-backed DEMO until a real backend (Supabase) is wired. With the
 * flag off (the default for real production), this is inert: `startMocking()`
 * resolves immediately and the msw/browser + handlers code is never imported.
 */
export const mockingEnabled =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

let startPromise: Promise<void> | null = null;

/**
 * Start the MSW Service Worker once. Resolves when the worker is active and
 * controlling the page (so requests made afterwards are intercepted). Repeated
 * calls share the one promise. A failure to start is swallowed (logged) so it
 * can never block the app.
 */
export function startMocking(): Promise<void> {
  if (!mockingEnabled) return Promise.resolve();
  if (!startPromise) {
    startPromise = import("../../../tests/mocks/browser")
      .then(({ worker }) =>
        // `bypass` lets real assets pass through; `quiet` silences MSW's
        // per-request logging in the demo deployment.
        worker.start({ onUnhandledRequest: "bypass", quiet: true }),
      )
      .then(() => {
        // True first visit: the worker just registered but does NOT control the
        // page it registered on, so every request bypasses MSW and 404s. A
        // single reload hands control to the now-active worker; `sessionStorage`
        // guards against a loop (and it only ever fires once per session).
        if (
          typeof navigator !== "undefined" &&
          !navigator.serviceWorker.controller &&
          !sessionStorage.getItem("msw-claimed")
        ) {
          sessionStorage.setItem("msw-claimed", "1");
          window.location.reload();
        }
      })
      .catch((err) => {
        console.error("[mocking] failed to start the MSW worker", err);
      });
  }
  return startPromise;
}
