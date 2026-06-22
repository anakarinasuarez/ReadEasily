import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { createRef } from "react";
import { StatTile, type StatTileTone } from "./StatTile";

const Icon = () => <svg data-testid="glyph" viewBox="0 0 24 24" aria-hidden="true" />;

describe("StatTile — content", () => {
  it("renders the value and label as plain text", () => {
    render(<StatTile icon={<Icon />} value={12} label="Saved words" />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Saved words")).toBeInTheDocument();
  });

  it("accepts a string value as well as a number", () => {
    render(<StatTile icon={<Icon />} value="1.2k" label="Words" />);
    expect(screen.getByText("1.2k")).toBeInTheDocument();
  });
});

describe("StatTile — non-interactive (reads as text, skipped in tab order)", () => {
  it("exposes no interactive role", () => {
    render(<StatTile icon={<Icon />} value={3} label="New" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("has no focusable element (skipped in tab order)", () => {
    const { container } = render(<StatTile icon={<Icon />} value={3} label="New" />);
    // No tabbable nodes: no native interactives and no tabindex authored.
    expect(container.querySelector("[tabindex]")).toBeNull();
    expect(container.querySelector("a, button, input, select, textarea")).toBeNull();
  });

  it("marks the icon as decorative (aria-hidden)", () => {
    render(<StatTile icon={<Icon />} value={3} label="New" />);
    // The glyph sits inside an aria-hidden tile, so it is hidden from the a11y tree.
    expect(screen.getByTestId("glyph").closest("[aria-hidden='true']")).not.toBeNull();
  });
});

describe("StatTile — API", () => {
  it("forwards the ref to the underlying div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<StatTile ref={ref} icon={<Icon />} value={1} label="x" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("spreads rest props (e.g. data-* and event handlers) onto the root", async () => {
    const onClick = vi.fn();
    render(
      <StatTile icon={<Icon />} value={1} label="x" data-testid="tile" onClick={onClick} />,
    );
    const tile = screen.getByTestId("tile");
    tile.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("merges a custom className with the base classes", () => {
    render(<StatTile icon={<Icon />} value={1} label="x" data-testid="tile" className="w-full" />);
    const tile = screen.getByTestId("tile");
    expect(tile.className).toContain("w-full");
    expect(tile.className).toContain("rounded-card");
  });
});

describe("StatTile — tone never bleeds into the numeral", () => {
  it.each<StatTileTone>(["accent", "warning", "info", "success"])(
    "%s tone keeps the numeral text-primary",
    (tone) => {
      render(<StatTile tone={tone} icon={<Icon />} value={7} label="x" />);
      // Whatever the tile tint, the numeral is always primary ink (matches Figma).
      expect(screen.getByText("7").className).toContain("text-primary");
    },
  );
});

describe("StatTile — a11y (jest-axe)", () => {
  it.each<StatTileTone>(["accent", "warning", "info", "success"])(
    "%s tone has no violations",
    async (tone) => {
      const { container } = render(
        <StatTile tone={tone} icon={<Icon />} value={9} label="Saved words" />,
      );
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
