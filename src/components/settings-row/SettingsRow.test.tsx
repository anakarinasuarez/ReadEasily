import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useState } from "react";
import { SettingsRow } from "./SettingsRow";

/** Controlled wrapper so the toggle variant actually flips in the DOM. */
function ControlledToggle(props: {
  label?: string;
  description?: string;
  disabled?: boolean;
  initial?: boolean;
  onCheckedChange?: (v: boolean) => void;
}) {
  const [checked, setChecked] = useState(props.initial ?? false);
  return (
    <SettingsRow
      variant="toggle"
      label={props.label ?? "Autoplay"}
      description={props.description}
      disabled={props.disabled}
      checked={checked}
      onCheckedChange={(v) => {
        setChecked(v);
        props.onCheckedChange?.(v);
      }}
    />
  );
}

describe("SettingsRow — toggle variant", () => {
  it("flips the switch by clicking the LABEL text (not a nested button row)", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<ControlledToggle label="Autoplay narration" onCheckedChange={onCheckedChange} />);

    const sw = screen.getByRole("switch", { name: "Autoplay narration" });
    expect(sw).toHaveAttribute("aria-checked", "false");

    // Click the visible label, NOT the switch — the <label htmlFor> must
    // forward activation to the Toggle.
    await user.click(screen.getByText("Autoplay narration"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("exposes exactly one interactive element (the switch), so the row is not a button", () => {
    render(<ControlledToggle />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getAllByRole("switch")).toHaveLength(1);
  });

  it("wires the description as the switch's accessible description", () => {
    render(<ControlledToggle label="Autoplay" description="Play stories automatically" />);
    expect(screen.getByRole("switch")).toHaveAccessibleDescription(
      "Play stories automatically",
    );
  });

  it("does not fire when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<ControlledToggle disabled initial onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByText("Autoplay"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("loading state swaps the switch for a busy indicator", () => {
    render(
      <SettingsRow
        variant="toggle"
        label="Autoplay"
        loading
        checked
        onCheckedChange={() => {}}
      />,
    );
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    // aria-busy lives on the row container.
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });
});

describe("SettingsRow — nav variant", () => {
  it("the row itself is a single button that fires onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SettingsRow
        variant="nav"
        label="Translation language"
        description="Word meanings"
        value="Español"
        onClick={onClick}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAccessibleName("Translation language");
    // The current value is folded into the description so SR users hear it
    // (the name stays the label only — the value is not part of the name).
    expect(buttons[0]).toHaveAccessibleDescription("Word meanings Español");

    await user.click(buttons[0]);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("activates with the keyboard (Enter)", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SettingsRow variant="nav" label="Account" onClick={onClick} />);

    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("the decorative value is not part of the accessible name", () => {
    render(<SettingsRow variant="nav" label="Reading accent" value="US" onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveAccessibleName("Reading accent");
  });

  it("does not fire when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SettingsRow variant="nav" label="Account" disabled onClick={onClick} />);

    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("SettingsRow — badge & custom variants", () => {
  it("renders the badge with its meaning carried by text", () => {
    render(
      <SettingsRow
        variant="badge"
        label="Subscription"
        badge={{ tone: "success", children: "Active" }}
      />,
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
    // Non-interactive: no button/switch in the row.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("hosts a custom trailing control", () => {
    render(
      <SettingsRow
        variant="custom"
        label="Theme"
        control={<span data-testid="custom-control">custom</span>}
      />,
    );
    expect(screen.getByTestId("custom-control")).toBeInTheDocument();
  });
});

describe("SettingsRow — a11y (jest-axe)", () => {
  it("toggle variant has no violations", async () => {
    const { container } = render(<ControlledToggle label="Autoplay" description="Play stories" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("nav variant has no violations", async () => {
    const { container } = render(
      <SettingsRow variant="nav" label="Translation" description="Meanings" value="ES" onClick={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("badge variant has no violations", async () => {
    const { container } = render(
      <SettingsRow variant="badge" label="Plan" badge={{ tone: "info", children: "Free" }} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
