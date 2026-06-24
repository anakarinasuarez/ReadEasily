import { test, expect } from "@playwright/test";

/**
 * E2E — the Practice overlay's primary journey: open the Reader, tap a word that
 * has a precomputed practice sample ("water"), open the WordPopover's Practice
 * button, and exercise the overlay — ten sentence cards paint, the target word
 * is highlighted, the active-language translations toggle off/on, "New sentences"
 * reorders the set, and "Save to practice later" confirms. The dev MSW worker
 * answers `/api/story/:id`, `/api/practice/:word` and `/api/saved`.
 *
 * The Saved-list reflection of the save is asserted in the behavior tests (a full
 * reload resets the in-memory mock); here we confirm the in-overlay state flip.
 */
test("practice overlay opens from a word and runs its core controls", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  const response = await page.goto("/read/the-clever-crow");
  expect(response?.ok()).toBe(true);

  await expect(
    page.getByRole("heading", { level: 1, name: "The Clever Crow" }),
  ).toBeVisible();

  // Tap the word "water" (a glossary + practice-sample word) to open its meaning.
  const group = page.getByRole("group", {
    name: "Story text — tap a word for its meaning",
  });
  await group.getByRole("button", { name: "water", exact: true }).first().click();

  // The meaning popover offers Practice; opening it brings up the overlay.
  await page.getByRole("button", { name: "Practice" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", { level: 2, name: "Water" }),
  ).toBeVisible();

  // Ten sentence cards.
  const list = dialog.getByRole("list", {
    name: "Practice sentences for Water",
  });
  await expect(list).toBeVisible();
  await expect(list.getByRole("listitem")).toHaveCount(10);

  // The target word is highlighted at least once.
  await expect(dialog.getByTestId("practice-highlight").first()).toBeVisible();

  // Hide translations → the per-sentence lines collapse; toggling back restores.
  const firstCard = list.getByRole("listitem").first();
  await dialog.getByRole("button", { name: "Hide Español" }).click();
  await expect(
    dialog.getByRole("button", { name: "Show Español" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Show Español" }).click();
  await expect(
    dialog.getByRole("button", { name: "Hide Español" }),
  ).toBeVisible();

  // New sentences reorders the set (still ten cards, different leading text).
  const firstBefore = await firstCard.innerText();
  await dialog.getByRole("button", { name: "New sentences" }).click();
  await expect(list.getByRole("listitem")).toHaveCount(10);
  await expect(firstCard).not.toHaveText(firstBefore);

  // Save to practice later confirms in-overlay.
  await dialog.getByRole("button", { name: "Save to practice later" }).click();
  await expect(
    dialog.getByRole("button", { name: "Saved to practice" }),
  ).toBeVisible();

  // Esc dismisses the overlay (focus returns to the reading passage).
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  expect(pageErrors).toEqual([]);
});
