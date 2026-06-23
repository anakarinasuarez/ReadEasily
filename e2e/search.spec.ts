import { test, expect } from "@playwright/test";

/**
 * E2E — the Search screen's primary journey: open `/search`, the screen renders
 * server-side and hydrates, the dev MSW worker answers `/api/search`, and the
 * browse-by-category catalog paints. Asserts the navbar (Search active), the
 * four category cards, and the same-screen category filter — the screen's core
 * browse interaction. Live text search (typing filters the whole catalog) is
 * covered by the SearchScreen behavior tests.
 */
test("search screen browses the catalog and filters by category", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  const response = await page.goto("/search");
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle("ReadEasily");

  // Navbar with Search as the active destination.
  const nav = page.getByRole("navigation", { name: "Primary" });
  await expect(nav.getByRole("link", { name: "Search" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  // The H1 + the four category cards.
  await expect(
    page.getByRole("heading", { level: 1, name: "Find a story" }),
  ).toBeVisible();
  const grid = page.getByRole("region", { name: "Browse by category" });
  for (const label of ["Fables", "Daily Life", "Technology", "Travel"]) {
    await expect(grid.getByRole("link", { name: label })).toBeVisible();
  }

  // Lands on "All stories" — both a fable and a travel story are visible.
  await expect(
    page.getByRole("heading", { level: 2, name: "All stories" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /The Tortoise and the Hare/ }),
  ).toBeVisible();

  // Same-screen filter: selecting Travel swaps the header + results.
  await grid.getByRole("link", { name: "Travel" }).click();
  await expect(
    page.getByRole("heading", { level: 2, name: "Travel" }),
  ).toBeVisible();
  await expect(grid.getByRole("link", { name: "Travel" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    page.getByRole("link", { name: /Lost at the Airport/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /The Tortoise and the Hare/ }),
  ).toHaveCount(0);

  expect(pageErrors).toEqual([]);
});
