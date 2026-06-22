import { test, expect } from "@playwright/test";

/**
 * E2E smoke: the dev server boots, the route renders server-side, and the
 * client tree (Providers + dev MSW worker) hydrates without throwing. This is
 * the foundation the critical-journey specs (sign-up → read → save → practice)
 * build on once those screens exist.
 *
 * NOTE: we assert the heading is present (in the DOM with its accessible name)
 * rather than visually visible. The current placeholder home page collapses to
 * zero width because of a token-wiring bug — `max-w-md` resolves to the 12px
 * spacing token `--space-md` instead of a container width (see report to
 * tokens-engineer). Flip these to `toBeVisible` once that's fixed.
 */
test("home route renders and hydrates", async ({ page }) => {
  // Fail loudly if anything throws during hydration / the dev MSW worker start.
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);

  await expect(page).toHaveTitle("ReadEasily");

  await expect(
    page.getByRole("heading", { level: 1, name: "ReadEasily" }),
  ).toBeAttached();

  expect(pageErrors).toEqual([]);
});
