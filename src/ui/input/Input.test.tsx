import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { createRef } from "react";
import { Input } from "./Input";

describe("Input", () => {
  it("associates the visible label with the input", () => {
    render(<Input label="Email" />);
    // getByLabelText only resolves if htmlFor/id wiring is correct.
    expect(screen.getByLabelText("Email")).toBeInstanceOf(HTMLInputElement);
  });

  it("typing updates the value (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Input label="Email" />);
    const input = screen.getByLabelText<HTMLInputElement>("Email");

    await user.type(input, "hello@readeasily.app");

    expect(input.value).toBe("hello@readeasily.app");
  });

  it("calls onChange for controlled usage", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input label="Email" value="" onChange={handleChange} />);

    await user.type(screen.getByLabelText("Email"), "a");

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("marks the field invalid and wires aria-describedby to the error message", () => {
    render(<Input label="Email" errorMessage="Please enter a valid email address" />);
    const input = screen.getByLabelText("Email");

    expect(input).toHaveAttribute("aria-invalid", "true");

    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const message = document.getElementById(describedBy as string);
    expect(message).toHaveTextContent("Please enter a valid email address");
  });

  it("is not invalid and has no error message when no error is provided", () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText("Email");

    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("merges a consumer-provided aria-describedby with the error id", () => {
    render(
      <Input label="Email" aria-describedby="hint" errorMessage="Bad email" />,
    );
    const describedBy = screen
      .getByLabelText("Email")
      .getAttribute("aria-describedby");

    expect(describedBy).toContain("hint");
    expect(describedBy?.split(" ").length).toBe(2);
  });

  it("blocks input when disabled", async () => {
    const user = userEvent.setup();
    render(<Input label="Email" disabled />);
    const input = screen.getByLabelText<HTMLInputElement>("Email");

    expect(input).toBeDisabled();
    await user.type(input, "nope");
    expect(input.value).toBe("");
  });

  it("forwards ref to the underlying input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input label="Email" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("spreads passthrough input props (type, name)", () => {
    render(<Input label="Email" type="email" name="email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("name", "email");
  });

  it("has no a11y violations in the default state", async () => {
    const { container } = render(<Input label="Email" placeholder="you@example.com" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no a11y violations in the error state", async () => {
    const { container } = render(
      <Input
        label="Email"
        defaultValue="bad@@email"
        errorMessage="Please enter a valid email address"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("stays focusable and keeps its error wiring when focused (errored + focused)", async () => {
    const user = userEvent.setup();
    render(<Input label="Email" errorMessage="Please enter a valid email address" />);
    const input = screen.getByLabelText<HTMLInputElement>("Email");

    await user.click(input);

    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
  });
});
