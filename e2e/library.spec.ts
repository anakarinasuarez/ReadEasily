import { test, expect } from "@playwright/test";

/**
 * E2E — the Library landing's primary journey: open `/`, the screen renders
 * server-side and hydrates, the dev MSW worker answers `/api/library`, and the
 * real catalog paints. Asserts the navbar, the featured hero, a book card, and
 * the same-screen category filter — the home screen's core interactions.
 *
 * `toBeVisible` (not just attached): the container-width token bug that forced
 * the smoke spec to assert attachment is fixed, so content has real layout.
 */
test("library landing renders the catalog and filters by category", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  const response = await page.goto("/library");
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle("ReadEasily");

  // Navbar with the active Library destination.
  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav.getByRole("link", { name: "Library" })).toBeVisible();

  // Featured hero — centre story title + CTA into Story Detail.
  await expect(
    page.getByRole("heading", { level: 1, name: "The Ant and the Grasshopper" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Read & Listen/ })).toHaveAttribute(
    "href",
    "/story/the-ant-and-the-grasshopper",
  );

  // The hero fan is interactive: selecting another story by its named dot swaps
  // the hero copy + CTA href together (no page navigation).
  const carousel = page.getByRole("region", { name: "Featured stories" });
  await carousel.getByRole("button", { name: "A Trip to the Mountains" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "A Trip to the Mountains" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Read & Listen/ })).toHaveAttribute(
    "href",
    "/story/a-trip-to-the-mountains",
  );

  // At least one BookCard from the rails is visible.
  await expect(
    page.getByRole("heading", { level: 2, name: "Fables" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /The Tortoise and the Hare/ }),
  ).toBeVisible();

  // Same-screen filter: selecting "Travel" drops the Fables rail.
  await page.getByRole("radio", { name: "Travel" }).click();
  await expect(
    page.getByRole("heading", { level: 2, name: "Travel" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Fables" }),
  ).toHaveCount(0);

  expect(pageErrors).toEqual([]);
});
