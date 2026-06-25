import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithQuery } from "../../../../tests/utils/query";
import { StoryDetailScreen } from "../components/StoryDetailScreen";

// The screen routes the navbar account avatar via the App Router; mock it so
// the component renders without a mounted router in jsdom.
const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: vi.fn() }),
}));

/**
 * Behavior tests for Story Detail. MSW (wired in tests/setup.ts) serves the same
 * `/api/story/:id/detail` + `/api/saved` handlers dev/e2e use, so these assert
 * on the real mocked payload (built from the catalog rows + the story glossary).
 * Under test: the rendered screen from `getStoryDetail`, the moral's fable-only
 * visibility, the key-word chips (flip + save reflected in Saved), the CTA →
 * reader hop, the breadcrumb-back, the not-found state, and a11y (jest-axe).
 */

const FABLE = "the-ant-and-the-grasshopper";
const NON_FABLE = "my-first-smartphone";

/** Resolve once the detail has loaded (its title is the H1). */
async function waitForTitle(name: string) {
  expect(
    await screen.findByRole("heading", { level: 1, name }),
  ).toBeInTheDocument();
}

describe("StoryDetailScreen", () => {
  it("renders the title, meta, cover, teaser and a CTA that hops to the reader", async () => {
    renderWithQuery(<StoryDetailScreen storyId={FABLE} />);
    await waitForTitle("The Ant and the Grasshopper");

    // Meta row — level + label, minutes, words.
    expect(screen.getByText("A2 · Elementary")).toBeInTheDocument();
    expect(screen.getByText("6 min")).toBeInTheDocument();
    expect(screen.getByText(/\d+ words/)).toBeInTheDocument();

    // Cover art (next/image renders an <img> with the alt).
    expect(
      screen.getByRole("img", { name: "Cover of The Ant and the Grasshopper" }),
    ).toBeInTheDocument();

    // Teaser copy.
    expect(
      screen.getByText(/the grasshopper sings while the ants store grain/i),
    ).toBeInTheDocument();

    // The "Read & Listen" CTA is the single hop onward into the reader.
    expect(
      screen.getByRole("link", { name: /Read & Listen/ }),
    ).toHaveAttribute("href", `/read/${FABLE}`);

    // Breadcrumb-back to the Library.
    expect(
      screen.getByRole("link", { name: "Back to Library" }),
    ).toHaveAttribute("href", "/library");
  });

  it("shows the moral for a fable and hides it for a non-fable", async () => {
    const { unmount } = renderWithQuery(<StoryDetailScreen storyId={FABLE} />);
    await waitForTitle("The Ant and the Grasshopper");

    // The fable moral renders in its labelled callout.
    expect(
      screen.getByRole("region", { name: /the moral/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("There is a time for work and a time for play."),
    ).toBeInTheDocument();

    unmount();

    renderWithQuery(<StoryDetailScreen storyId={NON_FABLE} />);
    await waitForTitle("My First Smartphone");
    // No moral on a non-fable — the callout is absent.
    expect(
      screen.queryByRole("region", { name: /the moral/i }),
    ).not.toBeInTheDocument();
  });

  it("renders key-word chips that flip in place to reveal the meaning", async () => {
    const user = userEvent.setup();
    renderWithQuery(<StoryDetailScreen storyId={FABLE} />);
    await waitForTitle("The Ant and the Grasshopper");

    const keyWords = screen.getByRole("region", {
      name: /key words you/i,
    });
    // The Figma Ant set renders (grasshopper + field among them).
    const flip = within(keyWords).getByRole("button", { name: "grasshopper" });
    expect(flip).toHaveAttribute("aria-expanded", "false");

    // Flipping reveals the Spanish meaning (same-screen morph, no navigation).
    await user.click(flip);
    expect(
      within(keyWords).getByRole("button", { name: /saltamontes/ }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("saves a key word via the + button, reflected in the Saved cache", async () => {
    const user = userEvent.setup();
    const { queryClient } = renderWithQuery(
      <StoryDetailScreen storyId={FABLE} />,
    );
    await waitForTitle("The Ant and the Grasshopper");

    const keyWords = screen.getByRole("region", {
      name: /key words you/i,
    });
    const saveBtn = within(keyWords).getByRole("button", {
      name: "Save grasshopper",
    });
    expect(saveBtn).toHaveAttribute("aria-pressed", "false");

    await user.click(saveBtn);

    // Optimistic + reconciled: the chip flips to its saved state…
    await waitFor(() => {
      expect(
        within(keyWords).getByRole("button", { name: "Saved grasshopper" }),
      ).toHaveAttribute("aria-pressed", "true");
    });

    // …and the word lands in the shared Saved cache (the seam the Saved screen reads).
    await waitFor(() => {
      const saved = queryClient.getQueryData<{ words: { word: string }[] }>([
        "saved",
      ]);
      expect(
        saved?.words.some((w) => w.word.toLowerCase() === "grasshopper"),
      ).toBe(true);
    });
  });

  it("shows a retryable not-found state for an unknown story id", async () => {
    renderWithQuery(<StoryDetailScreen storyId="no-such-story" />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Try again/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to Library" }),
    ).toBeInTheDocument();
  });

  it("has no detectable a11y violations in the loaded state", async () => {
    const { container } = renderWithQuery(
      <StoryDetailScreen storyId={FABLE} />,
    );
    await waitForTitle("The Ant and the Grasshopper");

    expect(await axe(container)).toHaveNoViolations();
  });
});
