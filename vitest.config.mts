import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Unit-test config. Intentionally jsdom-only and browser-free so `npm run test`
// is fast and deterministic in CI. Storybook's optional browser-based test
// runner (@storybook/addon-vitest) is NOT wired in here; if we adopt it later
// it should live in its own project/command, not the default unit run.
export default defineConfig({
  plugins: [react()],
  // Vitest 4 / Vite resolve the "@/*" alias from tsconfig.json natively, so
  // tests import the same way app code does.
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    css: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],
    // Keep Storybook example stories and Playwright e2e out of the unit run.
    exclude: ["node_modules", ".next", "e2e", "**/*.stories.*", "src/stories/**"],
  },
});
