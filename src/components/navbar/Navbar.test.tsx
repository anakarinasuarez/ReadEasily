import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Navbar, type NavbarItem } from "./Navbar";

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
    render(<Navbar items={items} user={user} activeKey="library" />);
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
  });

  it("renders each item as a link with its href by default", () => {
    render(<Navbar items={items} user={user} activeKey="library" />);
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
    render(<Navbar items={items} user={user} activeKey="search" />);
    expect(screen.getByRole("link", { name: "Search" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Library" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("gives every item a stable accessible name (survives the mobile label collapse)", () => {
    render(<Navbar items={items} user={user} activeKey="library" />);
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
    render(
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

  it("exposes a labelled account button driven by the user", async () => {
    const onAccountClick = vi.fn();
    render(
      <Navbar
        items={items}
        user={user}
        activeKey="library"
        onAccountClick={onAccountClick}
      />,
    );
    const account = screen.getByRole("button", { name: "Account" });
    await userEvent.click(account);
    expect(onAccountClick).toHaveBeenCalledTimes(1);
  });

  it("links the logo to the home target", () => {
    render(
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
    render(
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
    const { container } = render(
      <Navbar items={items} user={user} activeKey="library" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
