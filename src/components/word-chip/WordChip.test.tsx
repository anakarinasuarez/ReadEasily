import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { WordChip, type WordChipProps } from "./WordChip";

function renderChip(props: Partial<WordChipProps> = {}) {
  return render(
    <WordChip word="grasshopper" translation="saltamontes" pos="noun" {...props} />,
  );
}

describe("WordChip", () => {
  it("shows the word on the front face, collapsed by default", () => {
    renderChip();
    const body = screen.getByRole("button", { name: "grasshopper" });
    expect(body).toHaveAttribute("aria-expanded", "false");
  });

  it("flips front↔back on click, toggling aria-expanded", async () => {
    const user = userEvent.setup();
    renderChip();
    const body = screen.getByRole("button", { name: "grasshopper" });

    await user.click(body);
    expect(body).toHaveAttribute("aria-expanded", "true");
    // After the flip the back face (meaning) becomes the accessible name.
    expect(
      screen.getByRole("button", { name: /saltamontes/ }),
    ).toHaveAttribute("aria-expanded", "true");

    await user.click(body);
    expect(
      screen.getByRole("button", { name: "grasshopper" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("flips with the keyboard (Enter and Space)", async () => {
    const user = userEvent.setup();
    renderChip();
    const body = screen.getByRole("button", { name: "grasshopper" });

    body.focus();
    await user.keyboard("{Enter}");
    expect(body).toHaveAttribute("aria-expanded", "true");

    await user.keyboard(" ");
    expect(body).toHaveAttribute("aria-expanded", "false");
  });

  it("fires onSave from the '+' button with a per-word name, NOT nested in the body", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderChip({ onSave });

    const save = screen.getByRole("button", { name: "Save grasshopper" });
    // The save button must be a sibling, never a descendant of the flip body.
    const body = screen.getByRole("button", { name: "grasshopper" });
    expect(body.contains(save)).toBe(false);

    await user.click(save);
    expect(onSave).toHaveBeenCalledTimes(1);
    // Clicking save does not flip the body.
    expect(body).toHaveAttribute("aria-expanded", "false");
  });

  it("reflects the saved state on the '+' button", () => {
    renderChip({ saved: true });
    const save = screen.getByRole("button", { name: "Saved grasshopper" });
    expect(save).toHaveAttribute("aria-pressed", "true");
  });

  it("drives saved state from the consumer", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [saved, setSaved] = useState(false);
      return (
        <WordChip
          word="field"
          translation="campo"
          saved={saved}
          onSave={() => setSaved((s) => !s)}
        />
      );
    }
    render(<Harness />);

    const save = screen.getByRole("button", { name: "Save field" });
    expect(save).toHaveAttribute("aria-pressed", "false");
    await user.click(save);
    expect(
      screen.getByRole("button", { name: "Saved field" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("has no axe violations (default, flipped, saved)", async () => {
    const user = userEvent.setup();
    const { container } = renderChip();
    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: "grasshopper" }));
    expect(await axe(container)).toHaveNoViolations();

    const savedView = renderChip({ saved: true });
    expect(await axe(savedView.container)).toHaveNoViolations();
  });
});
