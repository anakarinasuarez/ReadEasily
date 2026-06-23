import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithQuery } from "../../../../tests/utils/query";
import { ReaderScreen } from "../components/ReaderScreen";

/**
 * Behavior tests for the Reader. MSW serves the same `/api/story/:id` +
 * `/api/saved` payloads dev/e2e use (parsing the real Markdown + Spanish
 * sidecar), so these assert on the real mocked story. Under test: the rendered
 * page, the roving-tabindex word navigation, tap-a-word → meaning popover, the
 * optimistic save, pagination + chevron bounds, the translation toggle, and the
 * passage's a11y (continuous prose preserved) + jest-axe.
 */

const STORY = "the-clever-crow";

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

    // Breadcrumb-back returns to Library (Story Detail route doesn't exist yet).
    expect(
      screen.getByRole("link", { name: "Back to Library" }),
    ).toHaveAttribute("href", "/");

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
    // POS pill from the glossary.
    expect(within(dialog).getByText("sustantivo")).toBeInTheDocument();
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

  it("opens the popover for a non-glossary word but does NOT allow saving it", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    // "very" is unique on page one and is NOT in the glossary. The popover still
    // opens (the placeholder translation is fine for reading) but Save is gated
    // off so a junk "(traducción pendiente)" entry can never be persisted.
    await user.click(within(readingGroup()).getByRole("button", { name: "very" }));
    const dialog = await screen.findByRole("dialog", { name: "Very" });
    expect(within(dialog).getByText("(traducción pendiente)")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Save word" })).toBeDisabled();
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

  it("toggles the Spanish translation block", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ReaderScreen storyId={STORY} />);
    await waitForStory();

    // The translation block is visible by default.
    expect(screen.getByText(/Un cuervo tiene mucha sed/)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Hide Spanish translation" }),
    );
    await waitFor(() =>
      expect(screen.queryByText(/Un cuervo tiene mucha sed/)).not.toBeInTheDocument(),
    );

    // Toggle is now in the "show" state.
    expect(
      screen.getByRole("button", { name: "Show Spanish translation" }),
    ).toBeInTheDocument();
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
