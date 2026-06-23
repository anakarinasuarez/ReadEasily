import { test, expect } from "@playwright/test";

/**
 * E2E — the Reader's primary journey: open `/read/the-clever-crow`, the screen
 * renders server-side and hydrates, the dev MSW worker answers `/api/story/:id`
 * (parsing the Markdown + Spanish sidecar) and `/api/saved`, the reading card
 * paints, a word is tapped to open its meaning popover, and the word is saved —
 * confirmed in-dialog by the Save button flipping to "Saved". (A full reload to
 * the Saved screen would reset the in-memory mock, so the Saved-list reflection
 * is asserted in the behavior tests, not here.) Roving-tabindex / pagination /
 * translation toggle / save-gating are covered by the ReaderScreen behavior tests.
 */
test("reader opens a story, shows a word meaning, and saves it", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  const response = await page.goto("/read/the-clever-crow");
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle("ReadEasily");

  // The story title (centered H1) and the breadcrumb-back to Library.
  await expect(
    page.getByRole("heading", { level: 1, name: "The Clever Crow" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Library" })).toHaveAttribute(
    "href",
    "/",
  );

  // The passage renders as a roving group of word buttons.
  const group = page.getByRole("group", {
    name: "Story text — tap a word for its meaning",
  });
  await expect(group).toBeVisible();

  // The PlayerBar is present. Audio is Web Speech (client TTS): when the test
  // browser exposes speechSynthesis the play control is live; where it doesn't
  // (some headless builds) the bar keeps its inert "Audio is unavailable" state.
  // Assert support-aware so the journey never flakes on engine availability —
  // the transport/highlight logic is covered by the useReaderAudio hook tests.
  await expect(page.getByRole("region", { name: "Audio player" })).toBeVisible();
  const speechSupported = await page.evaluate(
    () =>
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof window.SpeechSynthesisUtterance !== "undefined",
  );
  const play = page.getByRole("button", { name: "Play", exact: true });
  if (speechSupported) {
    await expect(play).toBeEnabled();
  } else {
    await expect(play).toBeDisabled();
  }

  // Tap "sun" → its meaning popover opens with the Spanish translation.
  await group.getByRole("button", { name: "sun" }).click();
  const dialog = page.getByRole("dialog", { name: "Sun" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("sol")).toBeVisible();

  // Save the word → the button flips to "Saved" (optimistic; the word lands in
  // the shared saved cache the Saved screen reads). The Saved screen reflecting
  // it is covered by the behavior tests; a full reload here would reset the
  // in-memory mock, so the journey ends at the confirmed save.
  await dialog.getByRole("button", { name: "Save word" }).click();
  await expect(dialog.getByRole("button", { name: "Saved" })).toBeVisible();

  expect(pageErrors).toEqual([]);
});
