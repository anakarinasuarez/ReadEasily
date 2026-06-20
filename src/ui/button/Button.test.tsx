import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Button } from "./Button";

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

describe("Button", () => {
  it("renders a semantic button with type=button by default", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("fires onClick when activated by pointer", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("activates with the keyboard (Enter and Space)", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
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
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("blocks onClick and sets aria-busy while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards the ref to the underlying button element", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("spreads rest props onto the button element", () => {
    render(
      <Button data-testid="cta" name="submit">
        Save
      </Button>,
    );
    const button = screen.getByTestId("cta");
    expect(button).toHaveAttribute("name", "submit");
  });

  it("exposes an accessible name from aria-label for an icon-only button", () => {
    render(<Button aria-label="Save to library" leftIcon={<Icon />} />);
    expect(
      screen.getByRole("button", { name: "Save to library" }),
    ).toBeInTheDocument();
  });

  it("warns in development when an icon-only button has no accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button leftIcon={<Icon />} />);
    expect(warn).toHaveBeenCalledOnce();
  });

  it("renders as the child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/story">Go to story</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Go to story" });
    expect(link).toHaveAttribute("href", "/story");
  });

  it("has no detectable a11y violations across variants", async () => {
    const { container } = render(
      <div>
        <Button variant="primary" leftIcon={<Icon />}>
          Primary
        </Button>
        <Button variant="secondary" leftIcon={<Icon />}>
          Secondary
        </Button>
        <Button variant="ghost" leftIcon={<Icon />}>
          Ghost
        </Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
        <Button aria-label="Icon only" leftIcon={<Icon />} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
