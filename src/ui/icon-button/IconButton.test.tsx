import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { IconButton } from "./IconButton";

function Icon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("IconButton", () => {
  it("renders a semantic button with type=button by default", () => {
    render(<IconButton icon={<Icon />} aria-label="Close" />);
    const button = screen.getByRole("button", { name: "Close" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("exposes its accessible name from aria-label", () => {
    render(<IconButton icon={<Icon />} aria-label="Save to library" />);
    expect(
      screen.getByRole("button", { name: "Save to library" }),
    ).toBeInTheDocument();
  });

  it("marks the icon as decorative (aria-hidden)", () => {
    render(<IconButton icon={<Icon />} aria-label="Close" />);
    const button = screen.getByRole("button", { name: "Close" });
    // The glyph sits inside an aria-hidden wrapper, so it never contributes a
    // name — the accessible name comes solely from aria-label.
    const iconWrapper = button.querySelector("[aria-hidden='true']");
    expect(iconWrapper).not.toBeNull();
    expect(iconWrapper?.querySelector("svg")).not.toBeNull();
  });

  it("fires onClick when activated by pointer", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={<Icon />} aria-label="Close" onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("activates with the keyboard (Enter and Space)", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={<Icon />} aria-label="Close" onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Close" });
    button.focus();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton icon={<Icon />} aria-label="Close" disabled onClick={onClick} />,
    );
    const button = screen.getByRole("button", { name: "Close" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("blocks onClick and sets aria-busy while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton icon={<Icon />} aria-label="Close" loading onClick={onClick} />,
    );
    const button = screen.getByRole("button", { name: "Close" });
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps its accessible name while loading (WCAG 4.1.2)", () => {
    render(<IconButton icon={<Icon />} aria-label="Closing…" loading />);
    expect(
      screen.getByRole("button", { name: "Closing…" }),
    ).toBeInTheDocument();
  });

  it("forwards the ref to the underlying button element", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<IconButton ref={ref} icon={<Icon />} aria-label="Close" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("spreads rest props onto the button element", () => {
    render(
      <IconButton
        icon={<Icon />}
        aria-label="Close"
        data-testid="close"
        name="dismiss"
      />,
    );
    expect(screen.getByTestId("close")).toHaveAttribute("name", "dismiss");
  });

  it("warns in development when no aria-label is provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // @ts-expect-error — aria-label is required by the type; this exercises the
    // runtime guard for plain-JS callers that bypass the type system.
    render(<IconButton icon={<Icon />} />);
    expect(warn).toHaveBeenCalledOnce();
  });

  it("has no detectable a11y violations across variants", async () => {
    const { container } = render(
      <div>
        <IconButton variant="subtle" icon={<Icon />} aria-label="Subtle" />
        <IconButton variant="ghost" icon={<Icon />} aria-label="Ghost" />
        <IconButton variant="accent" icon={<Icon />} aria-label="Accent" />
        <IconButton icon={<Icon />} aria-label="Disabled" disabled />
        <IconButton icon={<Icon />} aria-label="Loading" loading />
        <IconButton size="sm" icon={<Icon />} aria-label="Small" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
