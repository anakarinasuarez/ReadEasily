import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useState } from "react";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("exposes role=switch with the accessible name from `label`", () => {
    render(<Toggle label="Dark mode" />);
    const sw = screen.getByRole("switch", { name: "Dark mode" });
    expect(sw).toBeInTheDocument();
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("reflects checked state via aria-checked (controlled)", () => {
    render(<Toggle label="Dark mode" checked onCheckedChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("toggles and fires onCheckedChange when clicked (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Toggle label="Dark mode" onCheckedChange={onCheckedChange} />);

    const sw = screen.getByRole("switch");
    await user.click(sw);

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("toggles with the Space key when focused", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Toggle label="Dark mode" onCheckedChange={onCheckedChange} />);

    const sw = screen.getByRole("switch");
    await user.tab();
    expect(sw).toHaveFocus();

    await user.keyboard("[Space]");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("does not toggle or fire when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Toggle label="Dark mode" disabled onCheckedChange={onCheckedChange} />,
    );

    const sw = screen.getByRole("switch");
    expect(sw).toBeDisabled();

    await user.click(sw);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("supports controlled usage that drives aria-checked", async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [on, setOn] = useState(false);
      return <Toggle label="Dark mode" checked={on} onCheckedChange={setOn} />;
    }

    render(<Controlled />);
    const sw = screen.getByRole("switch");
    expect(sw).toHaveAttribute("aria-checked", "false");

    await user.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("is named by an associated <label> without aria-label", () => {
    render(
      <>
        <label htmlFor="t1">Autoplay audio</label>
        <Toggle id="t1" />
      </>,
    );
    expect(
      screen.getByRole("switch", { name: "Autoplay audio" }),
    ).toBeInTheDocument();
  });

  it("renders the sm size as a switch too", () => {
    render(<Toggle size="sm" label="Compact" />);
    expect(screen.getByRole("switch", { name: "Compact" })).toBeInTheDocument();
  });

  it("has no detectable a11y violations", async () => {
    const { container } = render(
      <>
        <label htmlFor="t2">Save words automatically</label>
        <Toggle id="t2" defaultChecked />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
