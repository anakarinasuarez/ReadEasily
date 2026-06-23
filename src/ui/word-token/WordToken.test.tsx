import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { WordToken } from "./WordToken";

describe("WordToken", () => {
  it("renders the word as the button's accessible name", () => {
    render(<WordToken word="ants" />);
    const button = screen.getByRole("button", { name: "ants" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
  });

  it("fires onActivate when clicked", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<WordToken word="ants" onActivate={onActivate} />);
    await user.click(screen.getByRole("button"));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("fires onActivate via Enter and Space (and not twice per key)", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<WordToken word="ants" onActivate={onActivate} />);
    const button = screen.getByRole("button");
    button.focus();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onActivate).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it("still calls a supplied onClick alongside onActivate", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onActivate = vi.fn();
    render(<WordToken word="ants" onClick={onClick} onActivate={onActivate} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("defaults tabIndex to 0 when the parent passes none", () => {
    render(<WordToken word="ants" />);
    expect(screen.getByRole("button")).toHaveAttribute("tabindex", "0");
  });

  it("respects a tabIndex supplied by the parent (roving tabindex = -1)", () => {
    render(<WordToken word="ants" tabIndex={-1} />);
    expect(screen.getByRole("button")).toHaveAttribute("tabindex", "-1");
  });

  it("exposes aria-current only when selected", () => {
    const { rerender } = render(<WordToken word="ants" />);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-current");
    rerender(<WordToken word="ants" selected />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-current", "true");
  });

  it("does not announce the speaking state (visual only — no aria, name unchanged)", () => {
    render(<WordToken word="ants" speaking />);
    const button = screen.getByRole("button", { name: "ants" });
    expect(button).not.toHaveAttribute("aria-current");
    expect(button).not.toHaveAttribute("aria-label");
    expect(button).not.toHaveAttribute("aria-live");
    expect(button).not.toHaveAttribute("role", "status");
  });

  it("does not fire onActivate when disabled", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<WordToken word="ants" disabled onActivate={onActivate} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("forwards the ref to the underlying button", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<WordToken word="ants" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("spreads arbitrary props onto the button", () => {
    render(<WordToken word="ants" data-testid="wt" />);
    expect(screen.getByTestId("wt")).toBeInTheDocument();
  });

  it("has no detectable a11y violations across its states (in a paragraph context)", async () => {
    const { container } = render(
      <p>
        <WordToken word="Near" /> the <WordToken word="ants" selected /> carried{" "}
        <WordToken word="grain" speaking /> home.
      </p>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
