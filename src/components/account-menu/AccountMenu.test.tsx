import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRef, useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AccountMenu } from "./AccountMenu";
import { usePreferences, DEFAULT_PREFERENCES } from "../../stores/preferences";

/**
 * Behavior tests for the account popover. The language pills bind to the global
 * `usePreferences` store (the same one Profile edits), so each test resets it to
 * the factory default first and asserts on the real store after a change.
 */

beforeEach(() => {
  usePreferences.setState({ ...DEFAULT_PREFERENCES });
});

/** Renders the menu with a real trigger button (for focus-return assertions). */
function Harness(props: {
  onClose?: () => void;
  onViewProfile?: () => void;
  onSignOut?: () => void;
  email?: string;
  withSignOut?: boolean;
  startOpen?: boolean;
}) {
  const {
    onClose = () => {},
    onViewProfile = () => {},
    onSignOut,
    email = "karina@example.com",
    withSignOut = true,
    startOpen = true,
  } = props;
  const [open, setOpen] = useState(startOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Account"
        onClick={() => setOpen(true)}
      >
        avatar
      </button>
      <AccountMenu
        open={open}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        identity={{ name: "Karina Aguilar", email }}
        stats={{ words: 24, finished: 3 }}
        onViewProfile={onViewProfile}
        onSignOut={withSignOut ? (onSignOut ?? (() => {})) : undefined}
        triggerRef={triggerRef}
      />
    </div>
  );
}

describe("AccountMenu", () => {
  it("renders identity, stats, language and sign-out inside an Account dialog", () => {
    render(<Harness />);

    const dialog = screen.getByRole("dialog", { name: "Account" });
    // Identity (the header row is one button named for View profile).
    expect(
      within(dialog).getByRole("button", { name: "View profile, Karina Aguilar" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("karina@example.com")).toBeInTheDocument();
    // Stats.
    expect(within(dialog).getByText("24")).toBeInTheDocument();
    expect(within(dialog).getByText("words")).toBeInTheDocument();
    expect(within(dialog).getByText("3")).toBeInTheDocument();
    expect(within(dialog).getByText("finished")).toBeInTheDocument();
    // Language radiogroup with the three options.
    const group = within(dialog).getByRole("radiogroup", {
      name: "Translate words to",
    });
    expect(within(group).getAllByRole("radio")).toHaveLength(3);
    // Sign out.
    expect(
      within(dialog).getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<Harness startOpen={false} />);
    expect(screen.queryByRole("dialog", { name: "Account" })).toBeNull();
  });

  it("moves focus to the View-profile row on open", () => {
    render(<Harness />);
    expect(
      screen.getByRole("button", { name: "View profile, Karina Aguilar" }),
    ).toHaveFocus();
  });

  it("fires onViewProfile when the identity row is activated", async () => {
    const onViewProfile = vi.fn();
    render(<Harness onViewProfile={onViewProfile} />);
    await userEvent.click(
      screen.getByRole("button", { name: "View profile, Karina Aguilar" }),
    );
    expect(onViewProfile).toHaveBeenCalledTimes(1);
  });

  it("writes the chosen language to the shared preferences store", async () => {
    render(<Harness />);
    expect(usePreferences.getState().translationLang).toBe("ES");
    await userEvent.click(screen.getByRole("radio", { name: "FR" }));
    expect(usePreferences.getState().translationLang).toBe("FR");
    expect(screen.getByRole("radio", { name: "FR" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("fires onSignOut when Sign out is pressed", async () => {
    const onSignOut = vi.fn();
    render(<Harness onSignOut={onSignOut} />);
    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("closes on Esc and returns focus to the trigger", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Account" })).toHaveFocus();
  });

  it("closes on a scrim outside-click", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    // The scrim is the decorative (aria-hidden) full-screen layer behind the card.
    const scrim = document.querySelector('[aria-hidden="true"].fixed.inset-0');
    expect(scrim).not.toBeNull();
    await userEvent.click(scrim as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("traps Tab within the dialog (last wraps to first)", async () => {
    render(<Harness />);
    const dialog = screen.getByRole("dialog", { name: "Account" });
    const signOut = within(dialog).getByRole("button", { name: "Sign out" });
    const viewProfile = within(dialog).getByRole("button", {
      name: "View profile, Karina Aguilar",
    });
    signOut.focus();
    await userEvent.tab();
    expect(viewProfile).toHaveFocus();
  });

  it("hides the email line and Sign out for a guest", () => {
    render(<Harness email="" withSignOut={false} />);
    const dialog = screen.getByRole("dialog", { name: "Account" });
    expect(within(dialog).queryByText("karina@example.com")).toBeNull();
    expect(
      within(dialog).queryByRole("button", { name: "Sign out" }),
    ).toBeNull();
  });

  it("has no axe violations when open", async () => {
    // The panel is portaled to <body>, so scan the document, not the render root.
    render(<Harness />);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
