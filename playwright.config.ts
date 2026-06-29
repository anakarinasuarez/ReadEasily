import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Playwright boots `next dev` itself (webServer) and drives a real
 * browser against it, so MSW's Service Worker is active and journeys run fully
 * mock-backed — no real network, deterministic. Unit tests stay in Vitest;
 * this dir (e2e/) is excluded from the Vitest run.
 */
const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // In CI, run serially: the e2e webServer is `next dev`, which compiles each
  // route on-demand. Multiple parallel workers hammering it at once makes the
  // first navigation to a route exceed the action timeout (flaky empty pages).
  // One worker keeps the dev server from thrashing; the suite is small so the
  // serial cost is a few seconds. Locally, parallel stays on for speed.
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  // CI runs against a COLD `next dev`: the first navigation to each route waits
  // on an on-demand Turbopack compile, which is far slower than a warm local
  // run. Give navigations and assertions generous headroom in CI so a slow
  // first compile reads as "slow", not "failed". Local stays tight for fast feedback.
  expect: { timeout: process.env.CI ? 15_000 : 5_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    navigationTimeout: process.env.CI ? 60_000 : 30_000,
    actionTimeout: process.env.CI ? 15_000 : 0,
    // Honor reduced-motion so motion-driven components are deterministic in e2e
    // (the auto-rotating BookShowcase hero pauses) — removes timing flakes.
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "next dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
