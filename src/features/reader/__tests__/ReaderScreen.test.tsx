import { describe, expect, it, beforeEach } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithQuery } from "../../../../tests/utils/query";
import {
  usePreferences,
  DEFAULT_PREFERENCES,
} from "@/stores/preferences";
import { ReaderScreen } from "../components/ReaderScreen";
import type { ReaderSpeech, SpeakOptions } from "@/lib/audio/speechController";

/** A fake TTS controller: records `speak` calls so the test can drive the
 *  per-sentence transport (and the auto-scroll that rides on it) in jsdom. */
function makeFakeSpeech() {
  const calls: { text: string; options?: SpeakOptions }[] = [];
  const controller: ReaderSpeech = {
    speak: (text, options) => calls.push({ text, options }),
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    getVoices: () => [],
    onVoicesChanged: () => () => {},
  };
  return { controller, calls };
}

/**
 * Behavior tests for the Reader. MSW serves the same `/api/story/:id` +
 * `/api/saved` payloads dev/e2e use (parsing the real Markdown + Spanish
 * sidecar), so these assert on the real mocked story. Under test: the rendered
 * page, the roving-tabindex word navigation, tap-a-word → meaning popover, the
 * optimistic save, pagination + chevron bounds, the translation toggle, and the
 * passage's a11y (continuous prose preserved) + jest-axe.
 */

const STORY = "the-clever-crow";

// The Reader now reads/writes the GLOBAL preferences store (Option B): language
// + voice live there, and autoplay / pronounceOnTap drive behavior. Reset to
// factory defaults before each test so cases are isolated (mirrors how the
// ProfileScreen tests drive the store).
beforeEach(() => {
  localStorage.clear();
  usePreferences.setState({ ...DEFAULT_PREFERENCES, _hasHydrated: false });
});

/** Resolve once the story has loaded (its title is the centered H1). */
async function waitForStory() {
  expect(
    await screen.findByRole("heading", { level: 1, name: "The Clever Crow" }),
  ).toBeInTheDocument();
}

function readingGroup() {
  return screen.getByRole("group", {
    name: "Story text — tap a word for its meaning",
  });
}

describe("ReaderScreen", () => {
  it("renders the story title, the breadcrumb-back, the page passage, and a disabled PlayerBar", async () => {
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    // Breadcrumb-back is origin-aware: catalog cards reach the reader via Story
    // Detail, so back returns to this story's detail screen.
    expect(
      screen.getByRole("link", { name: "Back to Story Detail" }),
    ).toHaveAttribute("href", `/story/${STORY}`);

    // The passage is one roving group of word buttons.
    const group = readingGroup();
    expect(within(group).getAllByRole("button").length).toBeGreaterThan(10);

    // The PlayerBar is present but audio is unavailable this pass (disabled).
    expect(
      screen.getByRole("region", { name: "Audio player" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Audio is unavailable for this story.")).toBeInTheDocument();
    // Its transport is inert.
    expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
  });

  it("exposes a roving tabindex and moves focus with the arrow keys", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    const words = within(readingGroup()).getAllByRole("button");
    // Exactly one tab stop: the first word is tabbable, the next is not.
    expect(words[0]).toHaveAttribute("tabindex", "0");
    expect(words[1]).toHaveAttribute("tabindex", "-1");

    words[0].focus();
    expect(words[0]).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(words[1]).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(words[0]).toHaveFocus();

    await user.keyboard("{End}");
    expect(words[words.length - 1]).toHaveFocus();

    await user.keyboard("{Home}");
    expect(words[0]).toHaveFocus();
  });

  it("opens a meaning popover when a word is activated", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    // "sun" is unique on the first page and is in the glossary (→ "sol").
    await user.click(within(readingGroup()).getByRole("button", { name: "sun" }));

    const dialog = await screen.findByRole("dialog", { name: "Sun" });
    expect(within(dialog).getByText("sol")).toBeInTheDocument();
    // POS pill from the glossary (English POS, per Figma — "noun").
    expect(within(dialog).getByText("noun")).toBeInTheDocument();
  });

  it("saves a word optimistically and reflects the saved state", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    await user.click(within(readingGroup()).getByRole("button", { name: "sun" }));
    const dialog = await screen.findByRole("dialog", { name: "Sun" });

    // A dictionary hit is savable.
    const save = within(dialog).getByRole("button", { name: "Save word" });
    expect(save).toBeEnabled();

    // Save word → the button flips to "Saved" once the optimistic cache lands.
    await user.click(save);
    expect(
      await within(dialog).findByRole("button", { name: "Saved" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("resolves a common word via the shared fallback and allows saving it", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    // "very" is a high-frequency function word that isn't in the story's own
    // glossary but IS covered by the shared common-words fallback (merged in at
    // load), so the popover shows a real meaning — not the pending placeholder —
    // and Save is enabled. (The "true miss → Save disabled" guarantee is unit-
    // tested on lookupWord, since no real story word misses anymore.)
    await user.click(within(readingGroup()).getByRole("button", { name: "very" }));
    const dialog = await screen.findByRole("dialog", { name: "Very" });
    expect(
      within(dialog).queryByText("(traducción pendiente)"),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Save word" }),
    ).toBeEnabled();
  });

  it("renders the pronounce chip inert (audio deferred) and skips it on focus", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    await user.click(within(readingGroup()).getByRole("button", { name: "sun" }));
    const dialog = await screen.findByRole("dialog", { name: "Sun" });

    // Pronounce is disabled this pass; initial focus lands on the first ENABLED
    // control (Save), never on the dead chip.
    expect(
      within(dialog).getByRole("button", { name: "Pronounce Sun" }),
    ).toBeDisabled();
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Save word" })).toHaveFocus(),
    );
  });

  it("paginates and disables the chevrons at the bounds", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    // First page: previous disabled, "Page 1 of 2".
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Next page" }));

    // Last page: next disabled, previous enabled.
    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
  });

  it("keeps focus on a page chevron across a turn and announces the page in place", async () => {
    const user = userEvent.setup();
    const { container } = renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    // Capture the single persistent live region BEFORE the turn.
    const live = container.querySelector<HTMLElement>('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(live).toHaveTextContent("Page 1 of 2");

    const next = screen.getByRole("button", { name: "Next page" });
    next.focus();
    await user.click(next);

    // SAME node mutated in place (not remounted) → a polite SR announcement.
    expect(live).toHaveTextContent("Page 2 of 2");

    // Next is now disabled at the last page → focus is handed to the still-enabled
    // Prev chevron, never lost to <body> (which would force a re-Tab from the top).
    const prev = screen.getByRole("button", { name: "Previous page" });
    await waitFor(() => expect(prev).toHaveFocus());
    expect(document.body).not.toHaveFocus();
  });

  it("switches the translation language for the block and the popover", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    // Default is Spanish — the translation block reads ES.
    expect(screen.getByText(/Un cuervo tiene mucha sed/)).toBeInTheDocument();

    // Open the language menu (a real role=menu of menuitemradio rows) and pick FR.
    await user.click(
      screen.getByRole("button", { name: "Translation language" }),
    );
    await user.click(
      await screen.findByRole("menuitemradio", { name: "Français" }),
    );

    // The block re-renders in French in place; the Spanish text is gone.
    expect(
      await screen.findByText(/Un corbeau a très soif/),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByText(/Un cuervo tiene mucha sed/),
      ).not.toBeInTheDocument(),
    );
    // The block label reflects the language (CSS-uppercased; node text "Français").
    expect(screen.getByText("Français")).toBeInTheDocument();

    // The tap-a-word popover now resolves the meaning in French too.
    await user.click(within(readingGroup()).getByRole("button", { name: "sun" }));
    const dialog = await screen.findByRole("dialog", { name: "Sun" });
    expect(within(dialog).getByText("soleil")).toBeInTheDocument();
  });

  it("auto-scrolls to follow the spoken sentence while playing", async () => {
    const user = userEvent.setup();
    const { controller, calls } = makeFakeSpeech();

    // jsdom has no scrollIntoView; record the elements it's called on.
    const scrolled: Element[] = [];
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function scrollIntoView(this: Element) {
      scrolled.push(this);
    };

    try {
      renderWithQuery(
        <ReaderScreen
          storyId={STORY}
          audioController={controller}
          audioSupported
        />,
      );
      await waitForStory();

      // Start playback → the fake records the title utterance first (it carries
      // no card word, so it doesn't scroll), then the body sentences.
      await user.click(screen.getByRole("button", { name: "Play" }));

      // Title (calls[0]) → no word range → no scroll. Advance to the first BODY
      // sentence (calls[1], word 0) → the active sentence highlights → follow.
      act(() => calls[0].options?.onStart?.());
      act(() => calls[0].options?.onEnd?.());
      act(() => calls[1].options?.onStart?.());

      await waitFor(() => expect(scrolled).toHaveLength(1));
      expect((scrolled[0] as HTMLElement).getAttribute("data-word-index")).toBe(
        "0",
      );

      // Advance to the next body sentence → the scroll target moves to a later word.
      act(() => calls[1].options?.onEnd?.());
      act(() => calls[2].options?.onStart?.());

      await waitFor(() => expect(scrolled).toHaveLength(2));
      expect(
        (scrolled[1] as HTMLElement).getAttribute("data-word-index"),
      ).not.toBe("0");
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it("pauses story playback when a word's meaning popover is opened", async () => {
    const user = userEvent.setup();
    const { controller } = makeFakeSpeech();
    renderWithQuery(
      <ReaderScreen storyId={STORY} audioController={controller} audioSupported />,
    );
    await waitForStory();

    // Start playback → the transport flips to Pause.
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

    // Tapping a word to see its meaning must stop the narration running over the
    // reader — the transport returns to Play (paused).
    await user.click(within(readingGroup()).getByRole("button", { name: "very" }));
    await screen.findByRole("dialog", { name: "Very" });
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("keeps the passage readable as continuous prose for assistive tech", async () => {
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    // The group's text content reconstitutes the sentence (words + separators),
    // so a screen reader still reads the prose, not a shredded list.
    expect(readingGroup().textContent).toContain("A crow is very thirsty.");
  });

  it("has no axe violations in the loaded state", async () => {
    const { container } = renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ReaderScreen — driven by the global preferences store", () => {
  it("renders the translation in the store's language (FR) on load", async () => {
    // Source of truth: the store. Setting FR before mount = the Reader opens in
    // French (no local default override).
    usePreferences.setState({ translationLang: "FR" });
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    expect(
      await screen.findByText(/Un corbeau a très soif/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Un cuervo tiene mucha sed/),
    ).not.toBeInTheDocument();
  });

  it("changing the language in the Reader writes the store (vice versa)", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    expect(usePreferences.getState().translationLang).toBe("ES");
    await user.click(
      screen.getByRole("button", { name: "Translation language" }),
    );
    await user.click(
      await screen.findByRole("menuitemradio", { name: "Português" }),
    );
    expect(usePreferences.getState().translationLang).toBe("PT");
  });

  it("reflects the store's reading accent (AU) in the voice menu", async () => {
    const user = userEvent.setup();
    usePreferences.setState({ readingAccent: "AU" });
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    await user.click(screen.getByRole("button", { name: "Audio voice" }));
    expect(
      await screen.findByRole("menuitemradio", { name: "Australian English" }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("changing the voice in the Reader writes the store accent (CA)", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    expect(usePreferences.getState().readingAccent).toBe("US");
    await user.click(screen.getByRole("button", { name: "Audio voice" }));
    await user.click(
      await screen.findByRole("menuitemradio", { name: "Canadian English" }),
    );
    expect(usePreferences.getState().readingAccent).toBe("CA");
  });

  it("autostarts narration when store.autoplay is on and audio is supported", async () => {
    const { controller, calls } = makeFakeSpeech();
    usePreferences.setState({ autoplay: true });
    renderWithQuery(
      <ReaderScreen storyId={STORY} audioController={controller} audioSupported />,
    );
    await waitForStory();

    // The page becoming ready autostarts playback (once) without any user input:
    // an utterance is queued and the transport flips to Pause.
    await waitFor(() => expect(calls.length).toBeGreaterThan(0));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument(),
    );
  });

  it("does NOT autostart when store.autoplay is off (default)", async () => {
    const { controller, calls } = makeFakeSpeech();
    renderWithQuery(
      <ReaderScreen storyId={STORY} audioController={controller} audioSupported />,
    );
    await waitForStory();

    // Give any stray effect a chance, then assert the transport stayed inert.
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(calls.length).toBe(0);
  });

  it("speaks a tapped word when store.pronounceOnTap is on (default)", async () => {
    const user = userEvent.setup();
    const { controller, calls } = makeFakeSpeech();
    renderWithQuery(
      <ReaderScreen storyId={STORY} audioController={controller} audioSupported />,
    );
    await waitForStory();

    await user.click(within(readingGroup()).getByRole("button", { name: "sun" }));
    // The popover still opens AND the word is spoken immediately.
    await screen.findByRole("dialog", { name: "Sun" });
    expect(calls.some((c) => c.text === "Sun")).toBe(true);
  });

  it("only opens the popover (no speech) when store.pronounceOnTap is off", async () => {
    const user = userEvent.setup();
    const { controller, calls } = makeFakeSpeech();
    usePreferences.setState({ pronounceOnTap: false });
    renderWithQuery(
      <ReaderScreen storyId={STORY} audioController={controller} audioSupported />,
    );
    await waitForStory();

    await user.click(within(readingGroup()).getByRole("button", { name: "sun" }));
    await screen.findByRole("dialog", { name: "Sun" });
    expect(calls.length).toBe(0);
  });
});
