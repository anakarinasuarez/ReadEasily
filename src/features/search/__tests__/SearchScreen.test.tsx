import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { axe } from "jest-axe";
import { server } from "../../../../tests/mocks/server";
import { renderWithQuery } from "../../../../tests/utils/query";
import { SearchScreen } from "../components/SearchScreen";

// The screen routes the navbar account avatar via the App Router; mock it so
// the component renders without a mounted router in jsdom.
const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: vi.fn() }),
}));

/**
 * Behavior tests for the Search screen. MSW serves the same `/api/search`
 * payload dev/e2e use (tests/setup.ts wires it), so these assert on the real
 * mocked catalog, not bespoke fixtures. The screen browses BY CATEGORY and also
 * supports live text search (typing filters the whole catalog); both the
 * category filter and the search↔browse interaction are under test, plus the
 * loaded / error states.
 */

/** Resolve once the query has settled into its loaded "All stories" view. */
async function waitForLoaded() {
  expect(
    await screen.findByRole("heading", { level: 2, name: "All stories" }),
  ).toBeInTheDocument();
}

describe("SearchScreen", () => {
  it("renders the navbar with Search active, the four categories with counts, and lands on All stories", async () => {
    renderWithQuery(<SearchScreen />);
    await waitForLoaded();

    // Navbar present with Search as the active destination.
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: "Search" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    // The H1 + the four category cards (as links) with honest counts.
    expect(
      screen.getByRole("heading", { level: 1, name: "Find a story" }),
    ).toBeInTheDocument();
    const grid = screen.getByRole("region", { name: "Browse by category" });
    for (const label of ["Fables", "Daily Life", "Technology", "Travel"]) {
      expect(within(grid).getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(within(grid).getByText("4 stories")).toBeInTheDocument();
    expect(within(grid).getAllByText("2 stories")).toHaveLength(3);

    // Lands on "All": no category card is current, and both a fable and a
    // travel story are visible (whole catalog).
    expect(within(grid).getByRole("link", { name: "Fables" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(
      screen.getByRole("link", { name: /The Tortoise and the Hare/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Lost at the Airport/ }),
    ).toBeInTheDocument();
  });

  it("seeds the active view from the ?category= deep-link (validated, else All)", async () => {
    // A valid deep-link / open-in-new-tab lands directly on that category.
    const { unmount } = renderWithQuery(
      <SearchScreen initialCategory="travel" />,
    );
    expect(
      await screen.findByRole("heading", { level: 2, name: "Travel" }),
    ).toBeInTheDocument();
    const grid = screen.getByRole("region", { name: "Browse by category" });
    expect(within(grid).getByRole("link", { name: "Travel" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: /Lost at the Airport/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /The Tortoise and the Hare/ }),
    ).not.toBeInTheDocument();
    unmount();

    // An unknown value falls back to the "All stories" view.
    renderWithQuery(<SearchScreen initialCategory="not-a-category" />);
    expect(
      await screen.findByRole("heading", { level: 2, name: "All stories" }),
    ).toBeInTheDocument();
  });

  it("filters results + section header + aria-current when a category is selected", async () => {
    const user = userEvent.setup();
    renderWithQuery(<SearchScreen />);
    await waitForLoaded();

    const grid = screen.getByRole("region", { name: "Browse by category" });
    await user.click(within(grid).getByRole("link", { name: "Travel" }));

    // Header becomes the category label; results are travel-only.
    expect(
      await screen.findByRole("heading", { level: 2, name: "Travel" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: "All stories" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Lost at the Airport/ }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByRole("link", { name: /The Tortoise and the Hare/ }),
      ).not.toBeInTheDocument();
    });

    // The selected card carries aria-current="page".
    expect(within(grid).getByRole("link", { name: "Travel" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    // Polite announcement reflects the filter.
    expect(screen.getByText("Showing Travel")).toBeInTheDocument();
  });

  it("returns to All stories when the active category is re-selected", async () => {
    const user = userEvent.setup();
    renderWithQuery(<SearchScreen />);
    await waitForLoaded();

    const grid = screen.getByRole("region", { name: "Browse by category" });
    const fables = within(grid).getByRole("link", { name: "Fables" });

    await user.click(fables);
    expect(
      await screen.findByRole("heading", { level: 2, name: "Fables" }),
    ).toBeInTheDocument();

    // Re-selecting the active category toggles back to the All view.
    await user.click(within(grid).getByRole("link", { name: "Fables" }));
    expect(
      await screen.findByRole("heading", { level: 2, name: "All stories" }),
    ).toBeInTheDocument();
    expect(within(grid).getByRole("link", { name: "Fables" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("is keyboard-operable — a focused category card activates with Enter", async () => {
    const user = userEvent.setup();
    renderWithQuery(<SearchScreen />);
    await waitForLoaded();

    const grid = screen.getByRole("region", { name: "Browse by category" });
    const technology = within(grid).getByRole("link", { name: "Technology" });

    technology.focus();
    expect(technology).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(
      await screen.findByRole("heading", { level: 2, name: "Technology" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /My First Smartphone/ }),
    ).toBeInTheDocument();
  });

  it("live-searches the WHOLE catalog by title, ignoring the active category", async () => {
    const user = userEvent.setup();
    renderWithQuery(<SearchScreen />);
    await waitForLoaded();

    // Narrow the browse view to Fables first — the text search must ignore it.
    const grid = screen.getByRole("region", { name: "Browse by category" });
    await user.click(within(grid).getByRole("link", { name: "Fables" }));
    await screen.findByRole("heading", { level: 2, name: "Fables" });

    // "lost" matches stories in TWO different categories (daily-life + travel).
    await user.type(screen.getByRole("searchbox"), "lost");

    expect(
      await screen.findByRole("heading", { level: 2, name: 'Results for "lost"' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /The Lost Keys/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Lost at the Airport/ }),
    ).toBeInTheDocument();
    // A fable that doesn't match is dropped even though Fables was the view.
    expect(
      screen.queryByRole("link", { name: /The Clever Crow/ }),
    ).not.toBeInTheDocument();
    // No category card is current while searching.
    expect(
      within(grid).getByRole("link", { name: "Fables" }),
    ).not.toHaveAttribute("aria-current");
    // The live region announces the count.
    expect(screen.getByText('2 results for "lost"')).toBeInTheDocument();
  });

  it("restores the previously-selected category when the search is cleared", async () => {
    const user = userEvent.setup();
    renderWithQuery(<SearchScreen />);
    await waitForLoaded();

    const grid = screen.getByRole("region", { name: "Browse by category" });
    await user.click(within(grid).getByRole("link", { name: "Travel" }));
    await screen.findByRole("heading", { level: 2, name: "Travel" });

    await user.type(screen.getByRole("searchbox"), "smartphone");
    expect(
      await screen.findByRole("link", { name: /My First Smartphone/ }),
    ).toBeInTheDocument();

    // Clear via the SearchField's own ✕ — the prior Travel view comes back.
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(
      await screen.findByRole("heading", { level: 2, name: "Travel" }),
    ).toBeInTheDocument();
    expect(within(grid).getByRole("link", { name: "Travel" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("shows the EmptyState on no matches, whose action clears back to browse", async () => {
    const user = userEvent.setup();
    renderWithQuery(<SearchScreen />);
    await waitForLoaded();

    await user.type(screen.getByRole("searchbox"), "zzzznotathing");

    // EmptyState is a region labelled by its title.
    expect(
      await screen.findByRole("region", { name: "No stories found" }),
    ).toBeInTheDocument();
    expect(screen.getByText('No stories found for "zzzznotathing"')).toBeInTheDocument();

    // The action returns to the browse view (default "All stories" here).
    await user.click(screen.getByRole("button", { name: /Browse all stories/ }));
    expect(
      await screen.findByRole("heading", { level: 2, name: "All stories" }),
    ).toBeInTheDocument();
  });

  it("surfaces an error state with a working retry when the query fails", async () => {
    server.use(
      http.get("/api/search", () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderWithQuery(<SearchScreen />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Something went wrong/,
    );
    // Navbar stays mounted through the error.
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();

    // Recover: drop the failing override, then retry loads the catalog.
    server.resetHandlers();
    await user.click(screen.getByRole("button", { name: /Try again/ }));
    await waitForLoaded();
  });

  it("has no axe violations once loaded", async () => {
    const { container } = renderWithQuery(<SearchScreen />);
    await waitForLoaded();

    expect(await axe(container)).toHaveNoViolations();
  });
});
