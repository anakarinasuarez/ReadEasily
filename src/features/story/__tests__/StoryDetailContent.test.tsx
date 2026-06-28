import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithQuery } from "../../../../tests/utils/query";
import { StoryDetailContent } from "../components/StoryDetailContent";
import { getStoryContent } from "../server/getStoryContent";

// The navbar island routes its account avatar via the App Router; mock it so the
// component renders without a mounted router in jsdom.
const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: vi.fn() }),
}));

/**
 * Behavior tests for Story Detail (server-first). The static copy is rendered
 * from `getStoryContent` (catalog-derived) and is present synchronously — no
 * network. The key-words chips are a client island fed by MSW (wired in
 * tests/setup.ts) via the real `/api/story/:id/detail` handler, so the flip +
 * save behaviour asserts against the real mocked glossary.
 */

const FABLE = "the-ant-and-the-grasshopper";
const NON_FABLE = "my-first-smartphone";

function renderStory(id: string) {
  return renderWithQuery(
    <StoryDetailContent content={getStoryContent(id)!} storyId={id} />,
  );
}

describe("StoryDetailContent", () => {
  it("renders the title, meta, cover, teaser and a CTA that hops to the reader", () => {
    renderStory(FABLE);

    // Title (server-rendered, present immediately).
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "The Ant and the Grasshopper",
      }),
    ).toBeInTheDocument();

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
    expect(screen.getByRole("link", { name: /Read & Listen/ })).toHaveAttribute(
      "href",
      `/read/${FABLE}`,
    );

    // Breadcrumb-back to the Library.
    expect(
      screen.getByRole("link", { name: "Back to Library" }),
    ).toHaveAttribute("href", "/library");
  });

  it("shows the moral for a fable and hides it for a non-fable", () => {
    const { unmount } = renderStory(FABLE);

    expect(
      screen.getByRole("region", { name: /the moral/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("There is a time for work and a time for play."),
    ).toBeInTheDocument();

    unmount();

    renderStory(NON_FABLE);
    expect(
      screen.getByRole("heading", { level: 1, name: "My First Smartphone" }),
    ).toBeInTheDocument();
    // No moral on a non-fable — the callout is absent.
    expect(
      screen.queryByRole("region", { name: /the moral/i }),
    ).not.toBeInTheDocument();
  });

  it("renders key-word chips (client island) that flip in place to reveal the meaning", async () => {
    const user = userEvent.setup();
    renderStory(FABLE);

    // The chips arrive from the MSW-fed island.
    const keyWords = await screen.findByRole("region", {
      name: /key words you/i,
    });
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
    const { queryClient } = renderStory(FABLE);

    const keyWords = await screen.findByRole("region", {
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

    // …and the word lands in the shared Saved cache (the Saved screen's seam).
    await waitFor(() => {
      const saved = queryClient.getQueryData<{ words: { word: string }[] }>([
        "saved",
      ]);
      expect(
        saved?.words.some((w) => w.word.toLowerCase() === "grasshopper"),
      ).toBe(true);
    });
  });

  it("treats an unknown story id as not-found (the page 404s)", () => {
    expect(getStoryContent("no-such-story")).toBeNull();
  });

  it("has no detectable a11y violations once the chips have loaded", async () => {
    const { container } = renderStory(FABLE);
    await screen.findByRole("region", { name: /key words you/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
