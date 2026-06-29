import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithQuery } from "../../../../tests/utils/query";
import { getSaved } from "@/features/saved/api/getSaved";
import type {
  ReaderSpeech,
  SpeakOptions,
} from "@/lib/audio/speechController";
import { ReaderScreen } from "@/features/reader/components/ReaderScreen";
import { PracticeOverlay } from "../components/PracticeOverlay";

/** A fake TTS controller: records `speak`/`cancel` so the audio seam can be
 *  asserted in jsdom (which has no `speechSynthesis`). */
function makeFakeSpeech() {
  const calls: { text: string; options?: SpeakOptions }[] = [];
  let cancels = 0;
  const controller: ReaderSpeech = {
    speak: (text, options) => calls.push({ text, options }),
    cancel: () => {
      cancels += 1;
    },
    pause: () => {},
    resume: () => {},
    getVoices: () => [],
    onVoicesChanged: () => () => {},
  };
  return { controller, calls, cancelCount: () => cancels };
}

/** Render the overlay open, with audio forced-on via a fake controller. */
function renderOverlay(
  props: Partial<React.ComponentProps<typeof PracticeOverlay>> = {},
) {
  const speech = makeFakeSpeech();
  const utils = renderWithQuery(
    <PracticeOverlay
      open
      onOpenChange={() => {}}
      word={props.word ?? "Path"}
      translation={props.translation ?? "sendero, camino"}
      language={props.language ?? "es"}
      sourceStoryId="the-ant-and-the-grasshopper"
      sourceStoryTitle="The Ant & the Grasshopper"
      audioController={speech.controller}
      audioSupported
      {...props}
    />,
  );
  return { ...utils, speech };
}

/** The list of 10 sentence cards, once the sample has loaded. */
async function findCards(word = "Path") {
  const list = await screen.findByRole("list", {
    name: `Practice sentences for ${word}`,
  });
  return within(list).getAllByRole("listitem");
}

describe("PracticeOverlay", () => {
  it("renders 10 cards for a sample word, the word highlighted, translations in the active language", async () => {
    renderOverlay({ word: "Path", language: "es" });

    const cards = await findCards();
    expect(cards).toHaveLength(10);

    // The eyebrow reports the count.
    expect(screen.getByText("Practice · 10 sentences")).toBeInTheDocument();

    // The target word is highlighted (styling-only spans) — at least one reads "path".
    const highlights = screen.getAllByTestId("practice-highlight");
    expect(highlights.length).toBeGreaterThan(0);
    expect(
      highlights.some((el) => /path/i.test(el.textContent ?? "")),
    ).toBe(true);

    // The Spanish translation line shows (active language = es).
    expect(
      screen.getByText("El sendero a través del bosque es muy hermoso en otoño."),
    ).toBeInTheDocument();
  });

  it("shows translations in the chosen language and hides them with the toggle", async () => {
    const user = userEvent.setup();
    renderOverlay({ word: "Path", language: "fr" });
    await findCards();

    // French line present; Spanish line absent.
    expect(
      screen.getByText("Le sentier à travers la forêt est très beau en automne."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "El sendero a través del bosque es muy hermoso en otoño.",
      ),
    ).not.toBeInTheDocument();

    // Toggle hides the per-sentence translation lines.
    await user.click(screen.getByRole("button", { name: "Hide Français" }));
    expect(
      screen.queryByText(
        "Le sentier à travers la forêt est très beau en automne.",
      ),
    ).not.toBeInTheDocument();
    // The toggle flips to "Show …" and reports its pressed state.
    const toggle = screen.getByRole("button", { name: "Show Français" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);
    expect(
      screen.getByText("Le sentier à travers la forêt est très beau en automne."),
    ).toBeInTheDocument();
  });

  it("'New sentences' bumps the nonce and refetches a reordered set", async () => {
    const user = userEvent.setup();
    renderOverlay({ word: "Path" });
    await findCards();

    const firstBefore = (await findCards())[0].textContent;
    expect(firstBefore).toMatch(/The .*path.* through the forest/i);

    await user.click(screen.getByRole("button", { name: "New sentences" }));

    // Still 10 cards, but the order changed (the nonce drives a shuffled set).
    await waitFor(async () => {
      const cards = await findCards();
      expect(cards).toHaveLength(10);
      expect(cards[0].textContent).not.toBe(firstBefore);
    });
  });

  it("'Save to practice later' persists sentencesReady and flips to a confirmed state", async () => {
    const user = userEvent.setup();
    // "Water" is a sample word that is NOT in the saved seed → a fresh save.
    renderOverlay({ word: "Water", translation: "agua" });
    await findCards("Water");

    await user.click(
      screen.getByRole("button", { name: "Save to practice later" }),
    );

    // The CTA confirms.
    expect(
      await screen.findByRole("button", { name: "Saved to practice" }),
    ).toHaveAttribute("aria-pressed", "true");

    // The Saved collection now carries the word with its ready sentences.
    await waitFor(async () => {
      const saved = await getSaved();
      const water = saved.words.find((w) => w.word === "Water");
      expect(water?.sentencesReady).toBe(10);
    });
  });

  it("voices a sentence through the injected audio controller", async () => {
    const user = userEvent.setup();
    const { speech } = renderOverlay({ word: "Path" });
    await findCards();

    await user.click(screen.getByRole("button", { name: "Listen to sentence 1" }));

    expect(
      speech.calls.some((c) =>
        /The path through the forest is very beautiful in autumn\./.test(c.text),
      ),
    ).toBe(true);
  });

  it("pronounces the word from the header chip", async () => {
    const user = userEvent.setup();
    const { speech } = renderOverlay({ word: "Path" });
    await findCards();

    await user.click(screen.getByRole("button", { name: "Pronounce Path" }));
    expect(speech.calls.some((c) => c.text === "Path")).toBe(true);
  });

  it("generates fallback sentences for a word with no precomputed sample", async () => {
    renderOverlay({ word: "Xyzzy", translation: "" });

    // Every word now gets sentences (template fallback) — no "coming soon".
    const cards = await findCards("Xyzzy");
    expect(cards).toHaveLength(8);
    // The word is rendered + highlighted in the generated sentences.
    expect(screen.getAllByTestId("practice-highlight").length).toBeGreaterThan(0);
    expect(
      screen.queryByText("Practice sentences for this word are coming soon."),
    ).not.toBeInTheDocument();
  });

  it("has no axe violations in the loaded state", async () => {
    renderOverlay({ word: "Path" });
    await findCards();
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations in the generated fallback state", async () => {
    renderOverlay({ word: "Xyzzy", translation: "" });
    await findCards("Xyzzy");
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

describe("Practice from the Reader popover", () => {
  it("opens the overlay from the WordPopover Practice button for a sample word", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId="the-clever-crow" />);

    // Wait for the story, then tap the word "water" (a glossary + sample word).
    await screen.findByRole("heading", { level: 1, name: "The Clever Crow" });
    const group = screen.getByRole("group", {
      name: "Story text — tap a word for its meaning",
    });
    const waterWord = within(group)
      .getAllByRole("button")
      .find((b) => (b.textContent ?? "").trim().toLowerCase() === "water");
    expect(waterWord).toBeDefined();
    await user.click(waterWord!);

    // The popover offers Practice; clicking it opens the overlay.
    await user.click(await screen.findByRole("button", { name: "Practice" }));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { level: 2, name: "Water" }),
    ).toBeInTheDocument();
    const cards = await findCards("Water");
    expect(cards).toHaveLength(10);
  });

  it("takes the PATCH (update) path for an already-saved word — no duplicate, sentencesReady 0 → 10", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId="the-clever-crow" />);

    await screen.findByRole("heading", { level: 1, name: "The Clever Crow" });
    const group = screen.getByRole("group", {
      name: "Story text — tap a word for its meaning",
    });

    // 1) Save the word from the popover first (POST → lands in Saved with
    //    sentencesReady: 0). "water" is NOT in the saved seed, so this is the
    //    fresh-save path; afterwards the word exists as a REAL server row.
    const waterWord = within(group)
      .getAllByRole("button")
      .find((b) => (b.textContent ?? "").trim().toLowerCase() === "water");
    expect(waterWord).toBeDefined();
    await user.click(waterWord!);

    await user.click(screen.getByRole("button", { name: "Save word" }));
    // The popover flips to "Saved" once the save lands (cache now holds "water").
    await screen.findByRole("button", { name: "Saved" });

    // Sanity: the server row exists with NO practice sentences yet.
    await waitFor(async () => {
      const saved = await getSaved();
      const water = saved.words.filter((w) => w.word === "Water");
      expect(water).toHaveLength(1);
      expect(water[0].sentencesReady).toBe(0);
    });

    // 2) Open Practice for that SAME word and "Save to practice later". Because
    //    the word is already a real saved row, this must take the PATCH branch
    //    (markPracticeReady), NOT a second POST.
    await user.click(screen.getByRole("button", { name: "Practice" }));
    await findCards("Water");
    await user.click(
      screen.getByRole("button", { name: "Save to practice later" }),
    );

    // (a) the CTA confirms.
    expect(
      await screen.findByRole("button", { name: "Saved to practice" }),
    ).toBeInTheDocument();

    // (b) still exactly one "Water" row (no duplicate POST), and (c) its
    //     sentencesReady went 0 → 10 on the SERVER (proves the PATCH ran —
    //     a wrong POST would echo the existing row unchanged at 0).
    await waitFor(async () => {
      const saved = await getSaved();
      const water = saved.words.filter((w) => w.word === "Water");
      expect(water).toHaveLength(1);
      expect(water[0].sentencesReady).toBe(10);
    });
  });
});
