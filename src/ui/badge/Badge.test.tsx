import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Badge } from "./Badge";
import type { BadgeTone } from "./Badge";

const TONES: BadgeTone[] = [
  "neutral",
  "accent",
  "success",
  "warning",
  "danger",
  "info",
  "selected",
];

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge tone="info">A2 Elementary</Badge>);
    expect(screen.getByText("A2 Elementary")).toBeInTheDocument();
  });

  it("is a non-interactive <span> by default (no role, no button)", () => {
    render(<Badge tone="success">Completed</Badge>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Completed").closest("span")).toBeInTheDocument();
  });

  it("renders the status dot as decorative (aria-hidden), so meaning is in the label", () => {
    const { container } = render(<Badge tone="warning">Needs review</Badge>);
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    // exactly one decorative element: the dot
    expect(hidden).toHaveLength(1);
    // the meaning is present as real text, not conveyed by the dot alone
    expect(screen.getByText("Needs review")).toBeInTheDocument();
  });

  it("does not render a dot for neutral / accent / selected tones", () => {
    const { container } = render(<Badge tone="selected">Spanish</Badge>);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0);
  });

  it("renders a leading icon as decorative (aria-hidden); the label carries the meaning", async () => {
    const { container } = render(
      <Badge tone="accent" icon={<svg data-testid="star" />}>
        Editor&apos;s pick
      </Badge>,
    );
    expect(screen.getByText("Editor's pick")).toBeInTheDocument();
    // the icon is wrapped in a decorative, aria-hidden span (one hidden element)
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
    expect(screen.getByTestId("star")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("omits the + affordance when onAdd is not provided", () => {
    render(<Badge tone="neutral">Serendipity</Badge>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders onAdd as a real, labelled button that fires onAdd on click", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(
      <Badge tone="neutral" onAdd={onAdd} addLabel="Save word">
        Serendipity
      </Badge>,
    );
    const button = screen.getByRole("button", { name: "Save word" });
    await user.click(button);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("the + button is keyboard-operable (Enter)", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(
      <Badge tone="accent" onAdd={onAdd} addLabel="Save word">
        Whisper
      </Badge>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Save word" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("forwards ref and spreads rest props onto the span", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(
      <Badge ref={ref} data-testid="badge" tone="info">
        New
      </Badge>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(screen.getByTestId("badge")).toBe(ref.current);
  });

  it.each(TONES)("has no a11y violations — %s tone", async (tone) => {
    const { container } = render(
      <Badge tone={tone}>{tone === "selected" ? "Spanish" : "Label"}</Badge>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no a11y violations with the interactive onAdd button", async () => {
    const { container } = render(
      <Badge tone="neutral" onAdd={() => {}} addLabel="Save word">
        Serendipity
      </Badge>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
