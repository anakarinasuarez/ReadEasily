import { beforeEach, describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithQuery } from "../../../tests/utils/query";
import { Navbar, type NavbarItem } from "./Navbar";

// The navbar now opens an account popover whose Sign out routes via the App
// Router; mock it so the component renders without a mounted router in jsdom.
const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: vi.fn() }),
}));

beforeEach(() => pushMock.mockClear());

function Icon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}

const items: NavbarItem[] = [
  { key: "library", label: "Library", icon: <Icon />, href: "/library" },
  { key: "search", label: "Search", icon: <Icon />, href: "/search" },
  { key: "saved", label: "Saved", icon: <Icon />, href: "/saved" },
];

const user = { name: "Karina Aguilar" };

describe("Navbar", () => {
  it("renders a primary landmark", () => {
    renderWithQuery(<Navbar items={items} user={user} activeKey="library" />);
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
  });

  it("renders each item as a link with its href by default", () => {
    renderWithQuery(<Navbar items={items} user={user} activeKey="library" />);
    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute(
      "href",
      "/library",
    );
    expect(screen.getByRole("link", { name: "Search" })).toHaveAttribute(
      "href",
      "/search",
    );
    expect(screen.getByRole("link", { name: "Saved" })).toHaveAttribute(
      "href",
      "/saved",
    );
  });

  it("marks only the active item with aria-current=page", () => {
    renderWithQuery(<Navbar items={items} user={user} activeKey="search" />);
    expect(screen.getByRole("link", { name: "Search" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Library" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("gives every item a stable accessible name (survives the mobile label collapse)", () => {
    renderWithQuery(<Navbar items={items} user={user} activeKey="library" />);
    // Inactive items hide their label text below `md`; aria-label keeps the
    // accessible name regardless of viewport (jsdom can't evaluate the query).
    for (const item of items) {
      expect(
        screen.getByRole("link", { name: item.label }),
      ).toHaveAttribute("aria-label", item.label);
    }
  });

  it("renders items as buttons and fires onNavigate when onNavigate is given", async () => {
    const onNavigate = vi.fn();
    renderWithQuery(
      <Navbar
        items={items}
        user={user}
        activeKey="library"
        onNavigate={onNavigate}
      />,
    );
    // No links in SPA mode — items are buttons.
    expect(screen.queryByRole("link", { name: "Search" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(onNavigate).toHaveBeenCalledWith("search");
  });

  it("exposes the account avatar as a dialog trigger (haspopup + expanded)", () => {
    renderWithQuery(<Navbar items={items} user={user} activeKey="library" />);
    const account = screen.getByRole("button", { name: "Account" });
    expect(account).toHaveAttribute("aria-haspopup", "dialog");
    expect(account).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the account popover on avatar click; its View profile fires onAccountClick", async () => {
    const onAccountClick = vi.fn();
    renderWithQuery(
      <Navbar
        items={items}
        user={user}
        activeKey="library"
        onAccountClick={onAccountClick}
      />,
    );
    const account = screen.getByRole("button", { name: "Account" });
    // No dialog until the avatar is pressed.
    expect(screen.queryByRole("dialog", { name: "Account" })).toBeNull();

    await userEvent.click(account);
    expect(account).toHaveAttribute("aria-expanded", "true");
    const dialog = screen.getByRole("dialog", { name: "Account" });
    expect(dialog).toBeInTheDocument();

    // The popover's identity header row is the new /profile entry.
    await userEvent.click(
      screen.getByRole("button", { name: "View profile, Karina Aguilar" }),
    );
    expect(onAccountClick).toHaveBeenCalledTimes(1);
  });

  it("links the logo to the home target", () => {
    renderWithQuery(
      <Navbar
        items={items}
        user={user}
        activeKey="library"
        homeHref="/home"
      />,
    );
    expect(
      screen.getByRole("link", { name: "ReadEasily home" }),
    ).toHaveAttribute("href", "/home");
  });

  it("renders the badge count on an item", () => {
    renderWithQuery(
      <Navbar
        items={items.map((i) =>
          i.key === "saved" ? { ...i, badge: 3 } : i,
        )}
        user={user}
        activeKey="saved"
      />,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithQuery(
      <Navbar items={items} user={user} activeKey="library" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
