/**
 * Client-side instrumentation (Next runs this before the app becomes
 * interactive). We use it to start the MSW Service Worker in development only,
 * so the running app is served by the same mock handlers the tests use. The
 * dynamic import keeps msw/browser and the handlers out of the production
 * bundle; the worker is never started outside development.
 */
if (process.env.NODE_ENV === "development") {
  void import("../tests/mocks/browser").then(({ worker }) =>
    // `bypass` lets real assets/HMR through; only declared handlers are mocked.
    worker.start({ onUnhandledRequest: "bypass" }),
  );
}
