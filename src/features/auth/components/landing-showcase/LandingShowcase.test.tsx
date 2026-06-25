import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { axe } from "jest-axe";
import { LandingShowcase, type LandingShowcaseItem } from "./LandingShowcase";

const ITEMS: LandingShowcaseItem[] = [
  { coverSrc: "/covers/the-ant-grasshopper.webp", alt: "The Ant and the Grasshopper" },
  { coverSrc: "/covers/The-tortoise-and-the-hare.webp", alt: "The Tortoise and the Hare" },
  { coverSrc: "/covers/the-clever-crow.webp", alt: "The Clever Crow" },
  { coverSrc: "/covers/The-boy-who-cried-wolf.webp", alt: "The Boy Who Cried Wolf" },
  { coverSrc: "/covers/A-trip-mountains.webp", alt: "A Trip to the Mountains" },
];

/** The active cover's underlying <img> src (next/image URL-encodes the path). */
function activeCoverSrc(): string {
  const img = screen.getByTestId("landing-showcase-cover").querySelector("img");
  return img?.getAttribute("src") ?? "";
}

afterEach(() => {
  vi.useRealTimers();
});

describe("LandingShowcase — decorative", () => {
  it("renders hidden from assistive tech with no tab stops", () => {
    const { container } = render(<LandingShowcase items={ITEMS} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    // Purely visual: no interactive controls of any kind.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows the initial active cover (the first item)", () => {
    render(<LandingShowcase items={ITEMS} />);
    expect(screen.getByTestId("landing-showcase-cover")).toBeInTheDocument();
    expect(activeCoverSrc()).toContain("the-ant-grasshopper");
  });

  it("has no a11y violations", async () => {
    const { container } = render(<LandingShowcase items={ITEMS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("LandingShowcase — motion", () => {
  it("auto-advances the active cover after the interval", () => {
    vi.useFakeTimers();
    render(<LandingShowcase items={ITEMS} autoAdvanceMs={3600} />);
    expect(activeCoverSrc()).toContain("the-ant-grasshopper");
    act(() => {
      vi.advanceTimersByTime(3600);
    });
    expect(activeCoverSrc()).toContain("The-tortoise-and-the-hare");
  });

  it("stays static when reduceMotion is set (no auto-advance)", () => {
    vi.useFakeTimers();
    render(<LandingShowcase items={ITEMS} autoAdvanceMs={3600} reduceMotion />);
    expect(activeCoverSrc()).toContain("the-ant-grasshopper");
    act(() => {
      vi.advanceTimersByTime(3600 * 3);
    });
    expect(activeCoverSrc()).toContain("the-ant-grasshopper");
  });
});
