import { test, expect } from "@playwright/test";

/**
 * E2E — the Reader's primary journey: open `/read/the-clever-crow`, the screen
 * renders server-side and hydrates, the dev MSW worker answers `/api/story/:id`
 * (parsing the Markdown + Spanish sidecar) and `/api/saved`, the reading card
 * paints, a word is tapped to open its meaning popover, and the word is saved —
 * confirmed in-dialog by the Save button flipping to "Saved". (A full reload to
 * the Saved screen would reset the in-memory mock, so the Saved-list reflection
 * is asserted in the behavior tests, not here.) Roving-tabindex / pagination /
 * voice switch / save-gating are covered by the ReaderScreen + hook tests. A
 * second test covers the translation-language dropdown journey.
 */
test("reader opens a story, shows a word meaning, and saves it", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  const response = await page.goto("/read/the-clever-crow");
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle(/ReadEasily/);

  // The story title (centered H1) and the breadcrumb-back to Library.
  await expect(
    page.getByRole("heading", { level: 1, name: "The Clever Crow" }),
  ).toBeVisible();
  // Breadcrumb-back is origin-aware: catalog cards reach the reader via Story
  // Detail, so back returns to this story's detail screen.
  await expect(
    page.getByRole("link", { name: "Back to Story Detail" }),
  ).toHaveAttribute("href", "/story/the-clever-crow");

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

/**
 * E2E — the translation-language dropdown (Figma 1154:3342). Open the story,
 * confirm the default Spanish translation block, open the ES/FR/PT menu from the
 * header pill, pick Français, and confirm the block re-renders in French in
 * place (and the Spanish text is gone). Audio-independent, so it never flakes on
 * speechSynthesis availability.
 */
test("reader switches the translation language from the header dropdown", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await page.goto("/read/the-clever-crow");
  await expect(
    page.getByRole("heading", { level: 1, name: "The Clever Crow" }),
  ).toBeVisible();

  // Default language is Spanish.
  await expect(page.getByText(/Un cuervo tiene mucha sed/)).toBeVisible();

  // Open the language menu and choose Français.
  await page.getByRole("button", { name: "Translation language" }).click();
  await page.getByRole("menuitemradio", { name: "Français" }).click();

  // The translation block re-renders in French in place.
  await expect(page.getByText(/Un corbeau a très soif/)).toBeVisible();
  await expect(page.getByText(/Un cuervo tiene mucha sed/)).toHaveCount(0);

  expect(pageErrors).toEqual([]);
});

/**
 * E2E (mobile regression) — the PlayerBar transport row at a narrow 360×800
 * Android viewport. Guards a change we just shipped: the full-screen / expand
 * (⛶) control is now exposed on mobile (previously desktop-only), and the five
 * transport controls (restart · prev · play/pause · next · skip-to-end) must
 * stay centred and NOT overflow or clip off the right edge on narrow widths.
 *
 * The viewport override is scoped to this describe block via `test.use`, so the
 * two journeys above keep the project's default (desktop) viewport. This test is
 * deliberately audio-independent — it never touches the play control's
 * enabled/disabled state (Web Speech availability varies in headless), it only
 * asserts layout containment — so it can't flake on engine availability.
 */
test.describe("mobile PlayerBar at 360px", () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test("exposes the full-screen toggle and keeps the transport row within the viewport", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/read/the-clever-crow");

    // Reader hydrated: the centered story H1 is painted.
    await expect(
      page.getByRole("heading", { level: 1, name: "The Clever Crow" }),
    ).toBeVisible();

    // The PlayerBar region and — the point of this regression — the expand
    // control, which is now visible on mobile (label flips to "Exit full
    // screen" once active).
    const player = page.getByRole("region", { name: "Audio player" });
    await expect(player).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Enter full screen" }),
    ).toBeVisible();

    // No horizontal overflow / clipping at 360px: every button in the bar and
    // the bar itself must sit fully inside [0, 360] on the x-axis (sub-pixel
    // tolerance for fractional layout rounding).
    const VIEWPORT_W = 360;
    const TOLERANCE = 0.5;

    const regionBox = await player.boundingBox();
    expect(regionBox).not.toBeNull();
    expect(regionBox!.x).toBeGreaterThanOrEqual(-TOLERANCE);
    expect(regionBox!.width).toBeLessThanOrEqual(VIEWPORT_W + TOLERANCE);

    const buttons = player.getByRole("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(-TOLERANCE);
      expect(box!.x + box!.width).toBeLessThanOrEqual(VIEWPORT_W + TOLERANCE);
    }

    expect(pageErrors).toEqual([]);
  });
});
