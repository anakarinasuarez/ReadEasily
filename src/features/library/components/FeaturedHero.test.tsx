import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { axe } from "jest-axe";
import { FeaturedHero } from "./FeaturedHero";
import type { FeaturedBook } from "../types";

/** Install a matchMedia (jsdom ships none); reduced-motion off by default. */
function mockMatchMedia(reduced = false) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  }));
}

const FEATURED: FeaturedBook[] = [
  {
    id: "a-trip-to-the-mountains",
    title: "A Trip to the Mountains",
    level: "B1",
    levelLabel: "Intermediate",
    minutes: 6,
    words: 540,
    coverSrc: "/covers/A-trip-mountains.webp",
    category: "travel",
    href: "/read/a-trip-to-the-mountains",
    eyebrow: "Featured Journey",
    teaser: "A weekend hike and a view worth every step.",
  },
  {
    id: "the-clever-crow",
    title: "The Clever Crow",
    level: "A1",
    levelLabel: "Beginner",
    minutes: 4,
    words: 210,
    coverSrc: "/covers/the-clever-crow.webp",
    category: "fables",
    href: "/read/the-clever-crow",
    eyebrow: "Featured Fable",
    teaser: "A thirsty crow and a few clever stones.",
  },
  {
    id: "the-ant-and-the-grasshopper",
    title: "The Ant and the Grasshopper",
    level: "A2",
    levelLabel: "Elementary",
    minutes: 6,
    words: 312,
    coverSrc: "/covers/the-ant-grasshopper.webp",
    category: "fables",
    href: "/read/the-ant-and-the-grasshopper",
    eyebrow: "Featured Fable",
    badgeLabel: "Editor's pick",
    teaser: "The grasshopper sings while the ants store grain.",
  },
  {
    id: "the-boy-who-cried-wolf",
    title: "The Boy Who Cried Wolf",
    level: "A2",
    levelLabel: "Elementary",
    minutes: 5,
    words: 300,
    coverSrc: "/covers/The-boy-who-cried-wolf.webp",
    category: "fables",
    href: "/read/the-boy-who-cried-wolf",
    eyebrow: "Featured Fable",
    teaser: "One false alarm too many.",
  },
  {
    id: "my-first-smartphone",
    title: "My First Smartphone",
    level: "B1",
    levelLabel: "Intermediate",
    minutes: 6,
    words: 520,
    coverSrc: "/covers/My-first-Smartphone.webp",
    category: "technology",
    href: "/read/my-first-smartphone",
    eyebrow: "Featured Technology",
    teaser: "Unboxing, set-up, and a few funny mistakes.",
  },
];

// 5 stories → BookShowcase opens on the middle index (2) = "The Ant...".
const CENTRE = FEATURED[2];

function cta() {
  return screen.getByRole("link", { name: /Read & Listen/ });
}

describe("FeaturedHero", () => {
  beforeEach(() => mockMatchMedia(false));

  it("describes the centred story — title (h1) + CTA href agree", () => {
    render(<FeaturedHero featured={FEATURED} />);
    expect(
      screen.getByRole("heading", { level: 1, name: CENTRE.title }),
    ).toBeInTheDocument();
    expect(cta()).toHaveAttribute("href", CENTRE.href);
  });

  it("auto-advances over time — copy follows the centre, but the live region stays silent (no auto announce)", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<FeaturedHero featured={FEATURED} />);
      const live = container.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(live.textContent).toBe("");
      expect(
        screen.getByRole("heading", { level: 1, name: CENTRE.title }),
      ).toBeInTheDocument();

      // One rest interval (BookShowcase default 4500ms) → one step.
      act(() => {
        vi.advanceTimersByTime(4500);
      });

      // The centre advanced → the copy follows it…
      const next = FEATURED[3];
      expect(
        screen.getByRole("heading", { level: 1, name: next.title }),
      ).toBeInTheDocument();
      expect(cta()).toHaveAttribute("href", next.href);
      // …but the polite live region was NOT updated by the auto step.
      expect(live.textContent).toBe("");
    } finally {
      vi.useRealTimers();
    }
  });

  it("on a user dot selection: updates h1 + CTA, announces it, and HARD-STOPS auto", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<FeaturedHero featured={FEATURED} />);
      const live = container.querySelector('[aria-live="polite"]') as HTMLElement;

      // Dots are named per story; pick a different one.
      act(() => {
        fireEvent.click(
          screen.getByRole("button", { name: "A Trip to the Mountains" }),
        );
      });

      expect(
        screen.getByRole("heading", { level: 1, name: "A Trip to the Mountains" }),
      ).toBeInTheDocument();
      expect(cta()).toHaveAttribute("href", "/read/a-trip-to-the-mountains");
      // A user change IS announced.
      expect(live.textContent).toContain("A Trip to the Mountains");

      // Auto is hard-stopped: advancing time does not move the centre, and the
      // toggle now offers "Play".
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      expect(
        screen.getByRole("heading", { level: 1, name: "A Trip to the Mountains" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Play featured stories" }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("exposes a Pause/Play toggle (default playing) that pauses auto-rotation", () => {
    vi.useFakeTimers();
    try {
      render(<FeaturedHero featured={FEATURED} />);
      act(() => {
        fireEvent.click(
          screen.getByRole("button", { name: "Pause featured stories" }),
        );
      });
      // Paused: label flips and time no longer advances the centre.
      expect(
        screen.getByRole("button", { name: "Play featured stories" }),
      ).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(20000);
      });
      expect(
        screen.getByRole("heading", { level: 1, name: CENTRE.title }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("under reduced motion: no auto-advance, no toggle; dots still navigate", () => {
    mockMatchMedia(true);
    vi.useFakeTimers();
    try {
      render(<FeaturedHero featured={FEATURED} />);
      // Toggle hidden (nothing to pause).
      expect(
        screen.queryByRole("button", { name: /featured stories/i }),
      ).toBeNull();
      // No auto-advance.
      act(() => {
        vi.advanceTimersByTime(30000);
      });
      expect(
        screen.getByRole("heading", { level: 1, name: CENTRE.title }),
      ).toBeInTheDocument();
      // Dots still work.
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "The Clever Crow" }));
      });
      expect(
        screen.getByRole("heading", { level: 1, name: "The Clever Crow" }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("renders the editor's-pick badge only when the centred story has one", () => {
    render(<FeaturedHero featured={FEATURED} />);
    expect(screen.getByText("Editor's pick")).toBeInTheDocument();

    // Select a story with no badge: the pill disappears.
    fireEvent.click(screen.getByRole("button", { name: "The Clever Crow" }));
    expect(screen.queryByText("Editor's pick")).not.toBeInTheDocument();
  });

  it("renders nothing for an empty featured fan (safe case)", () => {
    const { container } = render(<FeaturedHero featured={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("has no axe violations", async () => {
    const { container } = render(<FeaturedHero featured={FEATURED} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
