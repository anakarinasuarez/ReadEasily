import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SegmentedControl } from "./SegmentedControl";

const OPTIONS = [
  { value: "ES", label: "ES" },
  { value: "FR", label: "FR" },
  { value: "PT", label: "PT" },
];

/** Controlled wrapper so selection actually updates across interactions. */
function Harness({
  initial = "ES",
  onChange,
}: {
  initial?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <SegmentedControl
      aria-label="Translation language"
      options={OPTIONS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe("SegmentedControl", () => {
  it("renders a radiogroup of radios (not toggle buttons)", () => {
    render(<Harness />);
    expect(
      screen.getByRole("radiogroup", { name: "Translation language" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    // It must NOT expose toggle-button semantics.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("reflects the passed value via aria-checked", () => {
    render(<Harness initial="FR" />);
    expect(screen.getByRole("radio", { name: "ES" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(screen.getByRole("radio", { name: "FR" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("fires onChange and flips aria-checked when a segment is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: "PT" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("PT");
    expect(screen.getByRole("radio", { name: "PT" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "ES" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("moves selection AND focus with the arrow keys (native radio pattern)", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const es = screen.getByRole("radio", { name: "ES" });
    es.focus();
    await user.keyboard("{ArrowRight}");
    const fr = screen.getByRole("radio", { name: "FR" });
    expect(fr).toHaveAttribute("aria-checked", "true");
    expect(fr).toHaveFocus();
    // Wraps from last back to first.
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(es).toHaveAttribute("aria-checked", "true");
    expect(es).toHaveFocus();
    // ArrowLeft goes the other way (wraps to last).
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "PT" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("selects via Space/Enter on the focused segment", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    screen.getByRole("radio", { name: "FR" }).focus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith("FR");
  });

  it("exposes exactly one tab stop (roving tabindex on the selected radio)", () => {
    render(<Harness initial="FR" />);
    const radios = screen.getAllByRole("radio");
    const tabbable = radios.filter((r) => r.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName("FR");
    radios
      .filter((r) => r !== tabbable[0])
      .forEach((r) => expect(r).toHaveAttribute("tabindex", "-1"));
  });

  it("keeps radiogroup semantics with the lg label size", () => {
    render(
      <SegmentedControl
        size="lg"
        aria-label="Translation language"
        options={OPTIONS}
        value="ES"
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole("radiogroup", { name: "Translation language" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "ES" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    // Larger labels must not introduce toggle-button semantics.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("has no detectable a11y violations (info and accent tones)", async () => {
    const { container } = render(
      <div>
        <Harness />
        <SegmentedControl
          tone="accent"
          aria-label="Reading accent"
          options={[
            { value: "US", label: "US" },
            { value: "UK", label: "UK" },
          ]}
          value="US"
          onChange={() => {}}
        />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
