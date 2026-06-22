import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { axe } from "jest-axe";
import { server } from "../../../../tests/mocks/server";
import { renderWithQuery } from "../../../../tests/utils/query";
import { LibraryScreen } from "../components/LibraryScreen";
import type { LibraryData } from "../types";

/**
 * Behavior tests for the Library landing. MSW serves the same `/api/library`
 * payload dev/e2e use (tests/setup.ts wires it), so these assert on the real
 * mocked catalog, not bespoke fixtures. Per-test handler overrides exercise the
 * loading / error / empty branches.
 */

/** Resolve once the query has settled into its loaded UI. */
async function waitForLoaded() {
  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: "The Ant and the Grasshopper",
    }),
  ).toBeInTheDocument();
}

describe("LibraryScreen", () => {
  it("renders the navbar, the featured hero, and the catalog rails from the mock", async () => {
    renderWithQuery(<LibraryScreen />);
    await waitForLoaded();

    // Navbar present with the active Library destination.
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(
      within(nav).getByRole("link", { name: "Library" }),
    ).toHaveAttribute("aria-current", "page");

    // Rails from the mock render as named regions.
    expect(
      screen.getByRole("heading", { level: 2, name: "Fables" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Continue listening" }),
    ).toBeInTheDocument();

    // A book card from a rail links into the reader.
    expect(
      screen.getByRole("link", { name: /The Tortoise and the Hare/ }),
    ).toHaveAttribute("href", "/read/the-tortoise-and-the-hare");
  });

  it("links the featured CTA to the reader for the featured book", async () => {
    renderWithQuery(<LibraryScreen />);
    await waitForLoaded();

    expect(
      screen.getByRole("link", { name: /Read & Listen/ }),
    ).toHaveAttribute("href", "/read/the-ant-and-the-grasshopper");
  });

  it("filters the visible rails when a category chip is selected", async () => {
    const user = userEvent.setup();
    renderWithQuery(<LibraryScreen />);
    await waitForLoaded();

    // Both a Fables rail and a Travel rail are visible under "All".
    expect(
      screen.getByRole("heading", { level: 2, name: "Fables" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Travel" }),
    ).toBeInTheDocument();

    // Single-select chips render as a radio group; pick "Fables".
    await user.click(screen.getByRole("radio", { name: "Fables" }));

    // Only the Fables rail remains; Travel + the continue shelf are gone.
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { level: 2, name: "Travel" }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "Fables" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: "Continue listening" }),
    ).not.toBeInTheDocument();

    // The result is announced politely.
    expect(screen.getByText("Showing Fables")).toBeInTheDocument();
  });

  it("filters by each book's category, keeping a travel book on the Continue shelf (B6)", async () => {
    const user = userEvent.setup();
    renderWithQuery(<LibraryScreen />);
    await waitForLoaded();

    // The in-progress travel story lives on the "Continue listening" shelf,
    // alongside a daily-life story.
    expect(
      screen.getByRole("link", { name: /The Lighthouse Keeper/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /A Cup of Coffee/ }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Travel" }));

    // Travel keeps the Continue shelf BECAUSE it holds a travel book — the
    // shelf id ("continue") is irrelevant; the book's category is what matters.
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 2, name: "Continue listening" }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("link", { name: /The Lighthouse Keeper/ }),
    ).toBeInTheDocument();

    // The non-travel story on that same shelf is filtered out.
    expect(
      screen.queryByRole("link", { name: /A Cup of Coffee/ }),
    ).not.toBeInTheDocument();

    // The dedicated Travel shelf is present; the Fables shelf is gone.
    expect(
      screen.getByRole("heading", { level: 2, name: "Travel" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: "Fables" }),
    ).not.toBeInTheDocument();
  });

  it("renders the featured fan as decorative — no carousel control that does nothing (B5)", async () => {
    renderWithQuery(<LibraryScreen />);
    await waitForLoaded();

    // The single-featured hero must NOT advertise a choice: no "Choose a
    // featured story" dot group, and no per-cover/dot buttons promising a swap.
    expect(
      screen.queryByRole("group", { name: "Choose a featured story" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Featured story/ }),
    ).not.toBeInTheDocument();

    // The fan region is hidden from AT (the copy block carries the real info),
    // so the carousel region is not exposed.
    expect(
      screen.queryByRole("region", { name: "Featured stories" }),
    ).not.toBeInTheDocument();
  });

  it("shows the empty state when a filter yields no rails, and resets via Show all", async () => {
    // A category with no matching section drives the empty branch.
    const base = await (await fetch("/api/library")).json() as LibraryData;
    const withEmptyCategory: LibraryData = {
      ...base,
      categories: [...base.categories, { id: "poetry", label: "Poetry" }],
    };
    server.use(
      http.get("/api/library", () => HttpResponse.json(withEmptyCategory)),
    );

    const user = userEvent.setup();
    renderWithQuery(<LibraryScreen />);
    await waitForLoaded();

    await user.click(screen.getByRole("radio", { name: "Poetry" }));

    expect(
      await screen.findByRole("heading", { name: "No stories here yet" }),
    ).toBeInTheDocument();

    // "Show all" resets the filter and brings the rails back.
    await user.click(screen.getByRole("button", { name: /Show all/ }));
    expect(
      await screen.findByRole("heading", { level: 2, name: "Fables" }),
    ).toBeInTheDocument();
  });

  it("surfaces an error state with a working retry when the query fails", async () => {
    server.use(
      http.get("/api/library", () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderWithQuery(<LibraryScreen />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Something went wrong/,
    );
    // Navbar stays mounted through the error.
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();

    // Recover: drop the failing override (restoring the default success
    // handler), then retry loads the catalog.
    server.resetHandlers();
    await user.click(screen.getByRole("button", { name: /Try again/ }));
    await waitForLoaded();
  });

  it("has no axe violations once loaded", async () => {
    const { container } = renderWithQuery(<LibraryScreen />);
    await waitForLoaded();

    expect(await axe(container)).toHaveNoViolations();
  });
});
