import { beforeEach, describe, expect, it, vi } from "vitest";
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

// The screen routes the navbar account avatar via the App Router; mock it so
// the component renders without a mounted router in jsdom.
const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: vi.fn() }),
}));

beforeEach(() => pushMock.mockClear());

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

    // A book card from a rail links into Story Detail (not straight to /read).
    expect(
      screen.getByRole("link", { name: /The Tortoise and the Hare/ }),
    ).toHaveAttribute("href", "/story/the-tortoise-and-the-hare");
  });

  it("routes the navbar account avatar to /profile (navigation contract)", async () => {
    const user = userEvent.setup();
    renderWithQuery(<LibraryScreen />);
    await waitForLoaded();

    await user.click(screen.getByRole("button", { name: "Account" }));
    expect(pushMock).toHaveBeenCalledWith("/profile");
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

    // Single-select chips render as a radio group; pick "Travel".
    await user.click(screen.getByRole("radio", { name: "Travel" }));

    // Only the Travel rail remains; Fables + the (all-fables) continue shelf go.
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { level: 2, name: "Fables" }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "Travel" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: "Continue listening" }),
    ).not.toBeInTheDocument();

    // The result is announced politely.
    expect(screen.getByText("Showing Travel")).toBeInTheDocument();
  });

  it("filters by each book's category, not the shelf id — Continue survives a Fables filter (B6)", async () => {
    const user = userEvent.setup();
    renderWithQuery(<LibraryScreen />);
    await waitForLoaded();

    // The "Continue listening" shelf holds in-progress fables.
    expect(
      screen.getByRole("heading", { level: 2, name: "Continue listening" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Fables" }));

    // Fables keeps the Continue shelf BECAUSE it holds fables books — the shelf
    // id ("continue") is irrelevant; each book's category is what matters.
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { level: 2, name: "Travel" }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "Continue listening" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Fables" }),
    ).toBeInTheDocument();

    // Non-fables shelves are gone.
    expect(
      screen.queryByRole("heading", { level: 2, name: "Daily Life" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Showing Fables")).toBeInTheDocument();
  });

  it("renders the featured fan as an interactive carousel — selecting a story updates the hero copy + CTA", async () => {
    const user = userEvent.setup();
    renderWithQuery(<LibraryScreen />);
    await waitForLoaded();

    // The fan IS an exposed carousel whose dots are the accessible control,
    // each named after its story (not "Featured story N").
    const carousel = screen.getByRole("region", { name: "Featured stories" });
    expect(carousel).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Featured story/ }),
    ).not.toBeInTheDocument();

    // The centre story drives the hero; its CTA links into its reader.
    expect(
      screen.getByRole("heading", { level: 1, name: "The Ant and the Grasshopper" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Read & Listen/ }),
    ).toHaveAttribute("href", "/read/the-ant-and-the-grasshopper");

    // Select a different story by its named dot: the h1 + CTA href update together.
    await user.click(
      within(carousel).getByRole("button", { name: "A Trip to the Mountains" }),
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "A Trip to the Mountains" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Read & Listen/ }),
    ).toHaveAttribute("href", "/read/a-trip-to-the-mountains");
  });

  it("links the featured fan's centre cover to Story Detail (not straight to the reader)", async () => {
    renderWithQuery(<LibraryScreen />);
    await waitForLoaded();

    // Scope to the carousel region so we test the FAN's links, not the rail
    // cards or the CTA. The centre cover is an aria-hidden pointer affordance
    // (the dots are the AT control), so query its DOM node directly.
    const carousel = screen.getByRole("region", { name: "Featured stories" });
    // The fan's covers open Story Detail…
    expect(carousel.querySelector('a[href^="/story/"]')).not.toBeNull();
    // …and the fan never links straight to the reader (that's the CTA's job,
    // which lives outside this region).
    expect(carousel.querySelector('a[href^="/read/"]')).toBeNull();
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
