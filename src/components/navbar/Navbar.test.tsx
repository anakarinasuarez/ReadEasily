import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Navbar, type NavbarItem, type NavbarAccount } from "./Navbar";

/**
 * Behavior tests for the Navbar. It is PURELY PRESENTATIONAL — no Query, store
 * or router dependencies — so these render it directly. The account popover's
 * data + side-effects arrive as the `account` prop + callbacks (wired in the app
 * by `useNavbarAccount`).
 */

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

  it("exposes the account avatar as a dialog trigger (haspopup + expanded)", () => {
    render(<Navbar items={items} user={user} activeKey="library" />);
    const account = screen.getByRole("button", { name: "Account" });
    expect(account).toHaveAttribute("aria-haspopup", "dialog");
    expect(account).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the account popover on avatar click; its View profile fires onAccountClick", async () => {
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

  it("renders the account data (email + saved count) from the account prop", async () => {
    const account: NavbarAccount = {
      email: "karina@example.com",
      wordsSaved: 24,
      finished: 3,
      onSignOut: () => {},
    };
    render(
      <Navbar items={items} user={user} activeKey="library" account={account} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Account" }));
    const dialog = screen.getByRole("dialog", { name: "Account" });
    expect(within(dialog).getByText("karina@example.com")).toBeInTheDocument();
    expect(within(dialog).getByText("24")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
  });

  it("calls onSignOut (and closes the popover) when Sign out is pressed", async () => {
    const onSignOut = vi.fn();
    render(
      <Navbar
        items={items}
        user={user}
        activeKey="library"
        account={{ email: "k@e.com", wordsSaved: 0, onSignOut }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Account" }));
    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
    // The popover closes after sign-out.
    expect(screen.queryByRole("dialog", { name: "Account" })).toBeNull();
  });

  it("hides Sign out for a guest (no onSignOut on the account prop)", async () => {
    render(
      <Navbar
        items={items}
        user={user}
        activeKey="library"
        account={{ wordsSaved: 0 }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Account" }));
    expect(
      screen.queryByRole("button", { name: "Sign out" }),
    ).toBeNull();
  });

  it("supports a controlled open-state (reports changes via onAccountOpenChange)", async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Navbar
          items={items}
          user={user}
          activeKey="library"
          accountOpen={open}
          onAccountOpenChange={setOpen}
        />
      );
    }
    render(<Controlled />);
    const account = screen.getByRole("button", { name: "Account" });
    expect(account).toHaveAttribute("aria-expanded", "false");
    // Opening flows through the controlled state → dialog appears.
    await userEvent.click(account);
    expect(account).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "Account" })).toBeInTheDocument();
    // Esc closes via onAccountOpenChange(false).
    await userEvent.keyboard("{Escape}");
    expect(account).toHaveAttribute("aria-expanded", "false");
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
