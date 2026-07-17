import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithQuery } from "../../../../tests/utils/query";
import { server } from "../../../../tests/mocks/server";
import { usePreferences, DEFAULT_PREFERENCES } from "@/stores/preferences";
import { ReaderScreen } from "../components/ReaderScreen";

/**
 * Behavior tests for the Reader's tap-a-word CASCADE: story glossary FIRST,
 * Gemini translation as the fallback on a glossary MISS.
 *
 * `the-clever-crow` has a fully-covered glossary (used for the "hit → no fetch"
 * case); `the-lost-keys` contains the proper noun "Tom", which no glossary or
 * common-words entry backs, so tapping it exercises the fallback: loading →
 * translation → savable, plus the error/retry and OFF paths. The MSW handler
 * returns a deterministic `<word> (<lang>)` stub in tests (no network/model),
 * so these assert the WIRING, not a real translation.
 */

const HIT_STORY = "the-clever-crow";
const MISS_STORY = "the-lost-keys";
/** A word present in `the-lost-keys` that misses every glossary tier. */
const MISS_WORD = "Tom";

beforeEach(() => {
  localStorage.clear();
  usePreferences.setState({ ...DEFAULT_PREFERENCES, _hasHydrated: false });
});

afterEach(() => {
  server.events.removeAllListeners();
});

function readingGroup() {
  return screen.getByRole("group", {
    name: "Story text — tap a word for its meaning",
  });
}

/** Record every `/api/translate/*` request the run makes (to prove non-fetches). */
function trackTranslateRequests(): string[] {
  const seen: string[] = [];
  server.events.on("request:start", ({ request }) => {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/api/translate/")) seen.push(pathname);
  });
  return seen;
}

describe("ReaderScreen — glossary-first (no fallback fetch)", () => {
  it("shows the curated meaning for a glossary hit and never calls the translator", async () => {
    const user = userEvent.setup();
    const translateReqs = trackTranslateRequests();
    renderWithQuery(<ReaderScreen storyId={HIT_STORY} />);
    await screen.findByRole("heading", { level: 1, name: "The Clever Crow" });

    // "sun" is in the crow's glossary (→ "sol"), so the popover is instantly
    // ready with the curated sense and Save is enabled.
    await user.click(within(readingGroup()).getByRole("button", { name: "sun" }));
    const dialog = await screen.findByRole("dialog", { name: "Sun" });
    expect(within(dialog).getByText("sol")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Save word" })).toBeEnabled();

    // Let any stray effect flush — a glossary hit must NOT reach the fallback.
    await new Promise((r) => setTimeout(r, 0));
    expect(translateReqs).toHaveLength(0);
    // No loading skeleton ever rendered for a hit.
    expect(
      within(dialog).queryByTestId("word-popover-skeleton"),
    ).not.toBeInTheDocument();
  });
});

describe("ReaderScreen — Gemini fallback on a glossary miss", () => {
  it("shows loading, then the fetched translation, and enables Save", async () => {
    const user = userEvent.setup();

    // Gate the fallback response so the loading state is observable deterministically.
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    server.use(
      http.get("/api/translate/:word", async ({ params, request }) => {
        await gate;
        const w = decodeURIComponent((params as { word: string }).word).toLowerCase();
        const lang = new URL(request.url).searchParams.get("lang") ?? "es";
        return HttpResponse.json({
          word: w,
          lang,
          found: true,
          translation: `${w} (${lang})`,
          pos: "noun",
          phonetic: `/${w}/`,
        });
      }),
    );

    renderWithQuery(<ReaderScreen storyId={MISS_STORY} />);
    await screen.findByRole("heading", { level: 1, name: "The Lost Keys" });

    await user.click(
      within(readingGroup()).getAllByRole("button", { name: MISS_WORD })[0],
    );
    const dialog = await screen.findByRole("dialog", { name: MISS_WORD });

    // Loading: the panel announces busy, shows the skeleton, and BOTH actions are
    // disabled (nothing to persist / practice yet).
    await waitFor(() => expect(dialog).toHaveAttribute("aria-busy", "true"));
    expect(within(dialog).getByTestId("word-popover-skeleton")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Save word" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Practice" })).toBeDisabled();

    // Resolve the fallback → the fetched translation renders and both actions turn on.
    release();
    expect(await within(dialog).findByText("tom (es)")).toBeInTheDocument();
    expect(dialog).not.toHaveAttribute("aria-busy");
    const save = within(dialog).getByRole("button", { name: "Save word" });
    await waitFor(() => expect(save).toBeEnabled());
    expect(within(dialog).getByRole("button", { name: "Practice" })).toBeEnabled();

    // Saving the Gemini-translated word persists it (flips to "Saved").
    await user.click(save);
    expect(
      await within(dialog).findByRole("button", { name: "Saved" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("shows an error with Retry on a failed fetch, and retry refetches", async () => {
    const user = userEvent.setup();

    let attempts = 0;
    server.use(
      http.get("/api/translate/:word", ({ params, request }) => {
        attempts += 1;
        if (attempts === 1) return new HttpResponse(null, { status: 500 });
        const w = decodeURIComponent((params as { word: string }).word).toLowerCase();
        const lang = new URL(request.url).searchParams.get("lang") ?? "es";
        return HttpResponse.json({
          word: w,
          lang,
          found: true,
          translation: `${w} (${lang})`,
          pos: "noun",
          phonetic: `/${w}/`,
        });
      }),
    );

    renderWithQuery(<ReaderScreen storyId={MISS_STORY} />);
    await screen.findByRole("heading", { level: 1, name: "The Lost Keys" });

    await user.click(
      within(readingGroup()).getAllByRole("button", { name: MISS_WORD })[0],
    );
    const dialog = await screen.findByRole("dialog", { name: MISS_WORD });

    // Error state: an alert with a Retry affordance; both actions stay disabled.
    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent(/Couldn’t load/);
    const retry = within(dialog).getByRole("button", { name: "Retry" });
    expect(within(dialog).getByRole("button", { name: "Save word" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Practice" })).toBeDisabled();

    // Retry refetches → the second attempt succeeds → the translation renders.
    await user.click(retry);
    expect(await within(dialog).findByText("tom (es)")).toBeInTheDocument();
    expect(attempts).toBe(2);
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Save word" })).toBeEnabled(),
    );
  });

  it("treats a 200 {found:false} as an error with Retry and re-queries (no cached dead-end)", async () => {
    const user = userEvent.setup();

    // The EXACT shape the real route returns on failure (no key / timeout /
    // parse error): HTTP 200 with `found:false` and no translation fields.
    let attempts = 0;
    server.use(
      http.get("/api/translate/:word", ({ params, request }) => {
        attempts += 1;
        const w = decodeURIComponent((params as { word: string }).word).toLowerCase();
        const lang = new URL(request.url).searchParams.get("lang") ?? "es";
        // First tap fails soft; the retry succeeds — proving the miss was NOT
        // cached as a terminal success (a re-query actually happens).
        if (attempts === 1) {
          return HttpResponse.json({ word: w, lang, found: false });
        }
        return HttpResponse.json({
          word: w,
          lang,
          found: true,
          translation: `${w} (${lang})`,
          pos: "noun",
          phonetic: `/${w}/`,
        });
      }),
    );

    renderWithQuery(<ReaderScreen storyId={MISS_STORY} />);
    await screen.findByRole("heading", { level: 1, name: "The Lost Keys" });

    await user.click(
      within(readingGroup()).getAllByRole("button", { name: MISS_WORD })[0],
    );
    const dialog = await screen.findByRole("dialog", { name: MISS_WORD });

    // A soft `found:false` surfaces the SAME error/Retry affordance as a hard
    // failure — never a bare, sense-less, un-retryable dead-end.
    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent(/Couldn’t load/);
    expect(within(dialog).queryByText("tom (es)")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Save word" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Practice" })).toBeDisabled();
    expect(attempts).toBe(1);

    // Retry re-queries (not served from a warm cache) → success this time.
    await user.click(within(dialog).getByRole("button", { name: "Retry" }));
    expect(await within(dialog).findByText("tom (es)")).toBeInTheDocument();
    expect(attempts).toBe(2);
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Save word" })).toBeEnabled(),
    );
  });
});

describe("ReaderScreen — translation Off suppresses the fallback", () => {
  it("does not fetch and shows no sense line when translation is off", async () => {
    const user = userEvent.setup();
    usePreferences.setState({ translationLang: "OFF" });
    const translateReqs = trackTranslateRequests();

    renderWithQuery(<ReaderScreen storyId={MISS_STORY} />);
    await screen.findByRole("heading", { level: 1, name: "The Lost Keys" });

    await user.click(
      within(readingGroup()).getAllByRole("button", { name: MISS_WORD })[0],
    );
    const dialog = await screen.findByRole("dialog", { name: MISS_WORD });

    // OFF → no foreign sense line, no skeleton, and (a true miss with no meaning)
    // Save disabled. Crucially, the fallback is never called.
    expect(within(dialog).queryByText("tom (es)")).not.toBeInTheDocument();
    expect(
      within(dialog).queryByTestId("word-popover-skeleton"),
    ).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Save word" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Practice" })).toBeDisabled();

    await new Promise((r) => setTimeout(r, 0));
    expect(translateReqs).toHaveLength(0);
  });
});
