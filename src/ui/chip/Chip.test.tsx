import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders its label inside a button", () => {
    render(<Chip>Fantasy</Chip>);
    expect(screen.getByRole("button", { name: "Fantasy" })).toBeInTheDocument();
  });

  it("reflects `selected` via aria-pressed", () => {
    const { rerender } = render(<Chip>Fantasy</Chip>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    rerender(<Chip selected>Fantasy</Chip>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("fires onSelect with the toggled value when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Chip selected={false} onSelect={onSelect}>
        Fantasy
      </Chip>,
    );
    await user.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(true);
  });

  it("toggles via keyboard (Enter and Space)", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Chip onSelect={onSelect}>Fantasy</Chip>);
    const chip = screen.getByRole("button");
    chip.focus();
    expect(chip).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("still calls a supplied onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Fantasy</Chip>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onSelect when disabled", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Chip disabled onSelect={onSelect}>
        Fantasy
      </Chip>,
    );
    const chip = screen.getByRole("button");
    expect(chip).toBeDisabled();
    await user.click(chip);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("forwards the ref to the underlying button", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Chip ref={ref}>Fantasy</Chip>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("spreads arbitrary props onto the button", () => {
    render(<Chip data-testid="chip-x">Fantasy</Chip>);
    expect(screen.getByTestId("chip-x")).toHaveAttribute("type", "button");
  });

  it("has no detectable a11y violations", async () => {
    const { container } = render(
      <div>
        <Chip>Unselected</Chip>
        <Chip selected>Selected</Chip>
        <Chip disabled>Disabled</Chip>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
