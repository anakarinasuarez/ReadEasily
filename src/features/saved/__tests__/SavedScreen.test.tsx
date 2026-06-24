import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { axe } from "jest-axe";
import { server } from "../../../../tests/mocks/server";
import { renderWithQuery } from "../../../../tests/utils/query";
import { deriveSavedStats, type SavedData, type SavedWord } from "../types";
import { SavedScreen } from "../components/SavedScreen";

/**
 * Behavior tests for the Saved screen. MSW serves the same `/api/saved` payload
 * dev/e2e use (tests/setup.ts wires it, and resets the mutable list between
 * tests), so these assert on the real mocked collection. Under test: the loaded
 * list + derived stat pills, the optimistic remove (drops one card, preserves
 * the rest, updates the count, moves focus), the empty state, the
 * last-word-removed → empty transition, plus loading and error.
 */

const ONE_WORD: SavedWord = {
  id: "path",
  word: "Path",
  translation: "sendero, camino",
  sourceStoryId: "the-ant-and-the-grasshopper",
  sourceStoryTitle: "The Ant & the Grasshopper",
  sentencesReady: 10,
  savedAt: "2026-06-22T10:00:00.000Z",
};

/** Resolve once the query has settled into its loaded list. */
async function waitForLoaded() {
  expect(await screen.findByRole("link", { name: "Path" })).toBeInTheDocument();
}

describe("SavedScreen", () => {
  it("renders the navbar with Saved active, the words, and the two derived stat pills", async () => {
    renderWithQuery(<SavedScreen />);
    await waitForLoaded();

    // Navbar present with Saved as the active destination.
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: "Saved" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    // H1 + breadcrumb-back to Library.
    expect(
      screen.getByRole("heading", { level: 1, name: "Saved words" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to Library" }),
    ).toHaveAttribute("href", "/");

    // A sample of the eight words, including a phonetic-only card.
    expect(screen.getByRole("link", { name: "Taught" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bright" })).toBeInTheDocument();

    // The word link is origin-aware: it points at its source story's detail
    // screen (catalog cards land on Story Detail first).
    expect(screen.getByRole("link", { name: "Path" })).toHaveAttribute(
      "href",
      "/story/the-ant-and-the-grasshopper",
    );

    // Derived stat pills: 8 words to review, 2 practice sets.
    expect(screen.getByText("words to review")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("practice sets")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("removes a word optimistically, preserves the rest, updates the count, and moves focus", async () => {
    // Stub DELETE with a NON-mutating 204 so this test's removal cannot touch
    // the shared module seed (a late-resolving default-handler DELETE could
    // otherwise re-delete "Path" from the next test's fresh seed). The screen's
    // remove is intentionally fire-and-forget, so isolating the seam is the
    // robust guard — mirrors the last-word / rollback tests below.
    server.use(
      http.delete("/api/saved/:id", () => new HttpResponse(null, { status: 204 })),
    );

    const user = userEvent.setup();
    renderWithQuery(<SavedScreen />);
    await waitForLoaded();

    // Remove the first card ("Path", which carries a practice set).
    await user.click(
      screen.getByRole("button", { name: "Remove Path from saved" }),
    );

    // It disappears; the others remain.
    await waitFor(() => {
      expect(screen.queryByRole("link", { name: "Path" })).not.toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: "Taught" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bright" })).toBeInTheDocument();

    // Counts re-derive: 7 words to review, 1 practice set.
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    // Focus moved to the next card's word link.
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Taught" })).toHaveFocus();
    });

    // The removal is announced politely.
    expect(screen.getByText(/Removed Path\. 7 words saved\./)).toBeInTheDocument();
  });

  it("shows the EmptyState (CTA → Library home) when there are no saved words", async () => {
    const empty: SavedData = { words: [], stats: deriveSavedStats([]) };
    server.use(http.get("/api/saved", () => HttpResponse.json(empty)));

    renderWithQuery(<SavedScreen />);

    const region = await screen.findByRole("region", {
      name: "No saved words yet",
    });
    expect(region).toBeInTheDocument();
    expect(
      within(region).getByRole("link", { name: /Start reading/ }),
    ).toHaveAttribute("href", "/");
    // No stat pills in the empty state.
    expect(screen.queryByText("words to review")).not.toBeInTheDocument();
  });

  it("transitions to the EmptyState and focuses the CTA when the last word is removed", async () => {
    const single: SavedData = {
      words: [ONE_WORD],
      stats: deriveSavedStats([ONE_WORD]),
    };
    server.use(
      http.get("/api/saved", () => HttpResponse.json(single)),
      http.delete("/api/saved/:id", () => new HttpResponse(null, { status: 204 })),
    );

    const user = userEvent.setup();
    renderWithQuery(<SavedScreen />);
    await waitForLoaded();

    await user.click(
      screen.getByRole("button", { name: "Remove Path from saved" }),
    );

    const region = await screen.findByRole("region", {
      name: "No saved words yet",
    });
    expect(region).toBeInTheDocument();
    await waitFor(() => {
      expect(
        within(region).getByRole("link", { name: /Start reading/ }),
      ).toHaveFocus();
    });
  });

  it("restores the word if the remove request fails (rollback)", async () => {
    server.use(
      http.delete("/api/saved/:id", () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderWithQuery(<SavedScreen />);
    await waitForLoaded();

    await user.click(
      screen.getByRole("button", { name: "Remove Path from saved" }),
    );

    // Optimistically removed, then the failed DELETE rolls it back into place.
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Path" })).toBeInTheDocument();
    });
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("shows a loading skeleton before the collection arrives", () => {
    renderWithQuery(<SavedScreen />);
    // Synchronously after render the query is pending: the skeleton announces it.
    expect(screen.getByText("Loading saved words")).toBeInTheDocument();
    // Navbar frame is mounted through loading.
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
  });

  it("surfaces an error state with a working retry when the query fails", async () => {
    server.use(
      http.get("/api/saved", () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderWithQuery(<SavedScreen />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Something went wrong/,
    );
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();

    // Recover: drop the failing override, then retry loads the collection.
    server.resetHandlers();
    await user.click(screen.getByRole("button", { name: /Try again/ }));
    await waitForLoaded();
  });

  it("has no axe violations once loaded", async () => {
    const { container } = renderWithQuery(<SavedScreen />);
    await waitForLoaded();

    expect(await axe(container)).toHaveNoViolations();
  });
});
