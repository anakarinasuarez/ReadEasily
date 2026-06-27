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
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
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
