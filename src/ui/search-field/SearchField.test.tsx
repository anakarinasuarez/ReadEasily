import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SearchField } from "./SearchField";
import type { SearchFieldProps } from "./SearchField";

/** Controlled host mirroring real usage; lets us assert end-to-end behavior. */
function Harness(props: Partial<SearchFieldProps>) {
  const [value, setValue] = useState(props.value ?? "");
  return <SearchField {...props} value={value} onValueChange={setValue} />;
}

describe("SearchField", () => {
  it("is a search input with the default accessible name and placeholder", () => {
    render(<Harness />);
    const input = screen.getByRole("searchbox", { name: "Search stories" });
    expect(input).toHaveAttribute("type", "search");
    expect(input).toHaveAttribute("placeholder", "Search stories, themes…");
  });

  it("uses a custom aria-label as the accessible name", () => {
    render(<Harness aria-label="Find a story" />);
    expect(
      screen.getByRole("searchbox", { name: "Find a story" }),
    ).toBeInTheDocument();
  });

  it("reports each keystroke through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    // Uncontrolled-from-the-spy angle: pass a fixed value + spy to count calls.
    render(<SearchField value="" onValueChange={onValueChange} />);
    await user.type(screen.getByRole("searchbox"), "cat");
    expect(onValueChange).toHaveBeenCalledTimes(3);
    expect(onValueChange).toHaveBeenNthCalledWith(1, "c");
  });

  it("hides the clear button when empty", () => {
    render(<Harness />);
    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();
  });

  it("shows the clear button once the field has a value", () => {
    render(<Harness value="dragons" />);
    expect(
      screen.getByRole("button", { name: "Clear search" }),
    ).toBeInTheDocument();
  });

  it("clears the value and returns focus to the input", async () => {
    const user = userEvent.setup();
    render(<Harness value="dragons" />);
    const input = screen.getByRole("searchbox");
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    // The button disappears now that the field is empty.
    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();
  });

  it("calls a custom onClear instead of resetting when provided", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <SearchField value="dragons" onValueChange={() => {}} onClear={onClear} />,
    );
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("is disabled and hides the clear button when disabled", () => {
    render(<Harness value="dragons" disabled />);
    expect(screen.getByRole("searchbox")).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();
  });

  it("forwards the ref to the underlying input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<SearchField ref={ref} value="" onValueChange={() => {}} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("spreads rest props onto the input", () => {
    render(
      <SearchField
        value=""
        onValueChange={() => {}}
        data-testid="field"
        name="q"
      />,
    );
    expect(screen.getByTestId("field")).toHaveAttribute("name", "q");
  });

  it("is keyboard operable: tab focuses the input", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("has no detectable a11y violations (empty and filled)", async () => {
    const { container } = render(
      <div>
        <Harness />
        <Harness value="dragons" />
        <Harness value="dragons" disabled />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
