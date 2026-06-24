import { test, expect } from "@playwright/test";

/**
 * E2E — the Profile screen's primary journey:
 *   1. From the Library home, the navbar account avatar opens `/profile`
 *      (the navigation contract — the avatar is how Profile is reached).
 *   2. The screen renders + hydrates; the dev MSW worker answers `/api/profile`,
 *      and the header + stat tiles paint.
 *   3. A reading preference is changed (segmented control + a toggle) and
 *      SURVIVES a full page reload — the persisted global store is the point.
 *   4. A destructive Account row opens a real confirm modal that can be
 *      dismissed without acting.
 */
test("profile: reached via the navbar avatar, settings persist across reload, destructive actions are confirm-guarded", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  // 1. From the Library home, the account avatar routes to /profile.
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("button", { name: "Account" })
    .click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page).toHaveTitle("ReadEasily");

  // 2. Header + stats paint from the mocked payload.
  await expect(page.getByRole("heading", { level: 1, name: "Ana" })).toBeVisible();
  await expect(page.getByText("Words saved", { exact: true })).toBeVisible();
  await expect(page.getByText("Practice sets", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Back to Library" }),
  ).toHaveAttribute("href", "/");

  // 3. Change a segmented preference (reading accent → UK) and a toggle
  //    (Autoplay narration → on).
  const ukAccent = page.getByRole("radio", { name: "UK" });
  await ukAccent.click();
  await expect(ukAccent).toHaveAttribute("aria-checked", "true");

  const autoplay = page.getByRole("switch", { name: "Autoplay narration" });
  await autoplay.click();
  await expect(autoplay).toHaveAttribute("aria-checked", "true");

  // ...and both survive a full reload (persisted to localStorage).
  await page.reload();
  await expect(page.getByRole("radio", { name: "UK" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(
    page.getByRole("switch", { name: "Autoplay narration" }),
  ).toHaveAttribute("aria-checked", "true");

  // 4. The destructive "Delete account" row confirms before acting.
  await page.getByRole("button", { name: "Delete account" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Delete account?")).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  expect(pageErrors).toEqual([]);
});
