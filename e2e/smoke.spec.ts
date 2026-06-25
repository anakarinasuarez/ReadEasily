import { test, expect } from "@playwright/test";

/**
 * E2E smoke: the dev server boots, the route renders server-side, and the
 * client tree (Providers + dev MSW worker) hydrates without throwing. This is
 * the foundation the critical-journey specs (sign-up → read → save → practice)
 * build on once those screens exist.
 *
 * The home route now mounts the marketing Landing (the reading catalog lives at
 * /library), so this canary asserts the Landing's stable affordances render. The
 * Landing's own behavior is covered in depth by library.spec.ts (catalog) and
 * the auth specs.
 */
test("home route renders and hydrates", async ({ page }) => {
  // Fail loudly if anything throws during hydration / the dev MSW worker start.
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);

  await expect(page).toHaveTitle("ReadEasily");

  // The Landing's brand + primary CTA are present once it hydrates. (The
  // header is Figma-exact: centered brand, no Log in link.)
  await expect(page.getByRole("img", { name: "ReadEasily" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Start reading/ }),
  ).toBeVisible();

  expect(pageErrors).toEqual([]);
});
