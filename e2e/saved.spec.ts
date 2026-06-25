import { test, expect } from "@playwright/test";

/**
 * E2E — the Saved screen's primary journey: open `/saved`, the screen renders
 * server-side and hydrates, the dev MSW worker answers `/api/saved`, and the
 * saved-word collection paints. Asserts the navbar (Saved active) and the stat
 * pills, then exercises the core interaction — removing (unsaving) a word makes
 * its card disappear while the rest remain. Per-card remove focus management and
 * the empty transition are covered by the SavedScreen behavior tests.
 */
test("saved screen lists words and removes one", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  const response = await page.goto("/saved");
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle("ReadEasily");

  // Navbar with Saved as the active destination.
  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav.getByRole("link", { name: "Saved" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  // The H1 + the breadcrumb-back to Library.
  await expect(
    page.getByRole("heading", { level: 1, name: "Saved words" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Library" })).toHaveAttribute(
    "href",
    "/library",
  );

  // The collection paints — a sample of the saved words is visible.
  await expect(page.getByRole("link", { name: "Path" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Taught" })).toBeVisible();

  // Stat pills.
  await expect(page.getByText("words to review")).toBeVisible();
  await expect(page.getByText("practice sets")).toBeVisible();

  // The word link is origin-aware — it points at its source story's detail
  // screen (catalog cards land on Story Detail first).
  await expect(page.getByRole("link", { name: "Path" })).toHaveAttribute(
    "href",
    "/story/the-ant-and-the-grasshopper",
  );

  // Remove "Path": its card animates out and disappears; the rest remain.
  await page.getByRole("button", { name: "Remove Path from saved" }).click();
  await expect(page.getByRole("link", { name: "Path" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Taught" })).toBeVisible();

  expect(pageErrors).toEqual([]);
});
