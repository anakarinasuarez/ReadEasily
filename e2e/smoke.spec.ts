import { test, expect } from "@playwright/test";

/**
 * E2E smoke: the dev server boots, the route renders server-side, and the
 * client tree (Providers + dev MSW worker) hydrates without throwing. This is
 * the foundation the critical-journey specs (sign-up → read → save → practice)
 * build on once those screens exist.
 *
 * The home route now mounts the real Library landing (the placeholder + its
 * container-width token bug are gone), so this canary asserts the persistent
 * ReadEasily brand frame is visible. The Library landing's own behavior is
 * covered in depth by library.spec.ts.
 */
test("home route renders and hydrates", async ({ page }) => {
  // Fail loudly if anything throws during hydration / the dev MSW worker start.
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);

  await expect(page).toHaveTitle("ReadEasily");

  // The brand home link in the navbar is always present once the frame mounts.
  await expect(
    page.getByRole("link", { name: "ReadEasily home" }),
  ).toBeVisible();

  expect(pageErrors).toEqual([]);
});
