import { test, expect } from "@playwright/test";

/**
 * E2E — the Story Detail primary journey, end to end across the new flow:
 *   Library card → `/story/[id]` → "Read & Listen" → `/read/[id]`.
 *
 * The screens render server-side and hydrate; the dev MSW worker answers
 * `/api/library`, `/api/story/:id/detail` and `/api/saved`. Asserts the card
 * hop into Story Detail, the detail surface (title, meta, cover, key-words), a
 * chip flip + save, and the CTA hop onward into the reader.
 */
test("a catalog card opens Story Detail, then Read & Listen opens the reader", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  // Start on the Library and click a rail card — it now lands on Story Detail.
  await page.goto("/");
  await page.getByRole("link", { name: /The Tortoise and the Hare/ }).click();

  await expect(page).toHaveURL("/story/the-tortoise-and-the-hare");
  await expect(
    page.getByRole("heading", { level: 1, name: "The Tortoise and the Hare" }),
  ).toBeVisible();

  // The detail surface: meta row + the contained hero cover.
  await expect(page.getByText("A1 · Beginner")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Cover of The Tortoise and the Hare" }),
  ).toBeVisible();

  // A key-word chip flips in place to reveal its meaning (same-screen morph).
  const keyWords = page.getByRole("region", { name: /key words you/i });
  const tortoiseChip = keyWords.getByRole("button", { name: "tortoise" });
  await tortoiseChip.click();
  await expect(keyWords.getByRole("button", { name: /tortuga/ })).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  // Saving a key word flips its + into the saved state.
  await keyWords.getByRole("button", { name: "Save hare" }).click();
  await expect(
    keyWords.getByRole("button", { name: "Saved hare" }),
  ).toBeVisible();

  // The CTA is the single hop onward into the reader.
  await page.getByRole("link", { name: /Read & Listen/ }).click();
  await expect(page).toHaveURL("/read/the-tortoise-and-the-hare");
  await expect(
    page.getByRole("heading", { level: 1, name: "The Tortoise and the Hare" }),
  ).toBeVisible();

  // The reader breadcrumb is origin-aware — it points back to Story Detail.
  await expect(
    page.getByRole("link", { name: "Back to Story Detail" }),
  ).toHaveAttribute("href", "/story/the-tortoise-and-the-hare");

  expect(pageErrors).toEqual([]);
});
