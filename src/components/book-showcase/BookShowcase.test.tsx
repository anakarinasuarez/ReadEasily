import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { axe } from "jest-axe";
import { BookShowcase, type BookShowcaseItem } from "./BookShowcase";

const ITEMS: BookShowcaseItem[] = Array.from({ length: 7 }, (_, i) => ({
  coverSrc: `https://example.com/cover-${i}.png`,
  alt: `Story ${i + 1}`,
}));

/** Install a `prefers-reduced-motion` aware matchMedia (jsdom ships none). */
function mockMatchMedia(reduced: boolean) {
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

/** Dots are named by their story (the item's `alt`), not "Featured story N". */
function dot(n: number) {
  return screen.getByRole("button", { name: `Story ${n}` });
}

describe("BookShowcase — structure & dot control", () => {
  beforeEach(() => mockMatchMedia(false));

  it("renders one cover tile per item and one dot per item", () => {
    render(<BookShowcase items={ITEMS} />);
    // Covers are decorative (aria-hidden), so query by alt won't see them —
    // assert the dots, which are the accessible control.
    expect(screen.getAllByRole("button")).toHaveLength(ITEMS.length);
    // The carousel region carries the roledescription + name.
    expect(screen.getByRole("region", { name: "Featured stories" })).toBeTruthy();
  });

  it("starts centred on the middle item and marks only that dot aria-current", () => {
    render(<BookShowcase items={ITEMS} />);
    // 7 items → middle index 3 → dot 4. The fan opens symmetrically.
    expect(dot(4)).toHaveAttribute("aria-current", "true");
    expect(dot(1)).not.toHaveAttribute("aria-current");
  });

  it("clicking a side cover brings it to centre", () => {
    const { container } = render(<BookShowcase items={ITEMS} />);
    // Cover tiles are aria-hidden buttons (redundant pointer affordance).
    const covers = container.querySelectorAll('button[aria-hidden="true"]');
    fireEvent.click(covers[0]); // item 0 — a visible side cover
    expect(dot(1)).toHaveAttribute("aria-current", "true");
  });

  it("clicking a dot moves the active state and fires onActiveChange", () => {
    const onActiveChange = vi.fn();
    render(<BookShowcase items={ITEMS} onActiveChange={onActiveChange} />);

    fireEvent.click(dot(3));

    expect(onActiveChange).toHaveBeenCalledWith(2, "user");
    expect(dot(3)).toHaveAttribute("aria-current", "true");
    expect(dot(1)).not.toHaveAttribute("aria-current");
  });

  it("honours a controlled activeIndex without owning state", () => {
    const onActiveChange = vi.fn();
    const { rerender } = render(
      <BookShowcase items={ITEMS} activeIndex={4} onActiveChange={onActiveChange} />,
    );
    expect(dot(5)).toHaveAttribute("aria-current", "true");

    // Click a different dot: it reports the change but does NOT self-advance.
    fireEvent.click(dot(1));
    expect(onActiveChange).toHaveBeenCalledWith(0, "user");
    expect(dot(5)).toHaveAttribute("aria-current", "true");

    rerender(<BookShowcase items={ITEMS} activeIndex={0} onActiveChange={onActiveChange} />);
    expect(dot(1)).toHaveAttribute("aria-current", "true");
  });

  it("arrow keys move active and focus across the dots", () => {
    render(<BookShowcase items={ITEMS} />);
    dot(1).focus();
    fireEvent.keyDown(dot(1), { key: "ArrowRight" });
    expect(dot(2)).toHaveAttribute("aria-current", "true");
    expect(dot(2)).toHaveFocus();
  });

  it("omits the dot rail for a single item", () => {
    render(<BookShowcase items={[ITEMS[0]]} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("uses a true roving tabindex — only the active dot is in the tab order", () => {
    render(<BookShowcase items={ITEMS} />);
    // 7 items → middle index 3 → dot 4 active and tabbable; the rest are -1.
    expect(dot(4)).toHaveAttribute("tabindex", "0");
    expect(dot(1)).toHaveAttribute("tabindex", "-1");
    expect(dot(7)).toHaveAttribute("tabindex", "-1");

    // The single tab stop moves with the selection.
    fireEvent.click(dot(1));
    expect(dot(1)).toHaveAttribute("tabindex", "0");
    expect(dot(4)).toHaveAttribute("tabindex", "-1");

    // Exactly one tab stop exists in the dot group.
    const tabbable = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
  });

  it("names each dot after its story (the item's alt), not a generic index", () => {
    render(<BookShowcase items={ITEMS} />);
    // Every dot carries its story name; none reads "Featured story N".
    for (let i = 1; i <= ITEMS.length; i += 1) {
      expect(screen.getByRole("button", { name: `Story ${i}` })).toBeTruthy();
    }
    expect(
      screen.queryByRole("button", { name: /Featured story/ }),
    ).toBeNull();
  });
});

describe("BookShowcase — center cover link", () => {
  beforeEach(() => mockMatchMedia(false));

  const LINKED: BookShowcaseItem[] = Array.from({ length: 7 }, (_, i) => ({
    coverSrc: `https://example.com/cover-${i}.png`,
    alt: `Story ${i + 1}`,
    href: `/read/story-${i + 1}`,
  }));

  it("renders the CENTER cover as a link to the active story's href", () => {
    const { container } = render(<BookShowcase items={LINKED} />);
    // Center is the middle item (index 3 → href /read/story-4). The link stays
    // aria-hidden + untabbable (a redundant pointer affordance over the dots).
    const link = container.querySelector('a[href="/read/story-4"]');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute("aria-hidden", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
  });

  it("moves the center link to the newly-selected story", () => {
    const { container } = render(<BookShowcase items={LINKED} />);
    fireEvent.click(dot(1)); // bring story 1 to centre
    expect(container.querySelector('a[href="/read/story-1"]')).not.toBeNull();
    expect(container.querySelector('a[href="/read/story-4"]')).toBeNull();
  });

  it("introduces no extra tab stop — the center link is tabIndex -1; only the active dot tabs", () => {
    const { container } = render(<BookShowcase items={LINKED} />);
    // No anchor is tabbable (the cover link is tabIndex -1).
    expect(
      container.querySelectorAll('a:not([tabindex="-1"])'),
    ).toHaveLength(0);
    // The single tab stop is the active dot (a button), via roving tabindex.
    const tabbable = container.querySelectorAll('[tabindex="0"]');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].tagName).toBe("BUTTON");
  });
});

describe("BookShowcase — auto-cycle", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("auto-advances to the next cover after autoAdvanceMs", () => {
    const onActiveChange = vi.fn();
    render(
      <BookShowcase items={ITEMS} autoAdvanceMs={4000} onActiveChange={onActiveChange} />,
    );
    expect(dot(4)).toHaveAttribute("aria-current", "true"); // centred start

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(onActiveChange).toHaveBeenCalledWith(4, "auto");
    expect(dot(5)).toHaveAttribute("aria-current", "true");
  });

  it("pauses auto-advance while the carousel is hovered", () => {
    const onActiveChange = vi.fn();
    render(
      <BookShowcase items={ITEMS} autoAdvanceMs={4000} onActiveChange={onActiveChange} />,
    );
    const region = screen.getByRole("region", { name: "Featured stories" });

    fireEvent.mouseEnter(region);
    act(() => {
      vi.advanceTimersByTime(12000);
    });

    expect(onActiveChange).not.toHaveBeenCalled();
    expect(dot(4)).toHaveAttribute("aria-current", "true");

    // Resumes once the pointer leaves.
    fireEvent.mouseLeave(region);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(dot(5)).toHaveAttribute("aria-current", "true");
  });

  it("resets the timer when the user picks a dot", () => {
    render(<BookShowcase items={ITEMS} autoAdvanceMs={4000} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    fireEvent.click(dot(5)); // user jumps — timer should restart from here
    act(() => {
      vi.advanceTimersByTime(3000); // only 3s since the click: no auto-advance yet
    });
    expect(dot(5)).toHaveAttribute("aria-current", "true");

    act(() => {
      vi.advanceTimersByTime(1000); // now 4s since the click
    });
    expect(dot(6)).toHaveAttribute("aria-current", "true");
  });

  it("does NOT auto-advance when autoAdvance is false (user-driven carousel)", () => {
    const onActiveChange = vi.fn();
    render(
      <BookShowcase
        items={ITEMS}
        autoAdvance={false}
        autoAdvanceMs={1000}
        onActiveChange={onActiveChange}
      />,
    );
    expect(dot(4)).toHaveAttribute("aria-current", "true"); // centred start

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // No timer was ever started — the active cover is unchanged.
    expect(onActiveChange).not.toHaveBeenCalled();
    expect(dot(4)).toHaveAttribute("aria-current", "true");

    // The dots still work — it is user-driven, not frozen.
    fireEvent.click(dot(2));
    expect(dot(2)).toHaveAttribute("aria-current", "true");
  });

  it("treats a non-positive autoAdvanceMs as off (no timer)", () => {
    const onActiveChange = vi.fn();
    render(
      <BookShowcase items={ITEMS} autoAdvanceMs={0} onActiveChange={onActiveChange} />,
    );
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(onActiveChange).not.toHaveBeenCalled();
    expect(dot(4)).toHaveAttribute("aria-current", "true");
  });
});

describe("BookShowcase — reduced motion", () => {
  beforeEach(() => {
    mockMatchMedia(true);
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does NOT auto-advance when prefers-reduced-motion is set", () => {
    const onActiveChange = vi.fn();
    render(
      <BookShowcase items={ITEMS} autoAdvanceMs={2000} onActiveChange={onActiveChange} />,
    );

    act(() => {
      vi.advanceTimersByTime(20000);
    });

    expect(onActiveChange).not.toHaveBeenCalled();
    expect(dot(4)).toHaveAttribute("aria-current", "true");
  });

  it("still lets the user change covers via the dots", () => {
    render(<BookShowcase items={ITEMS} autoAdvanceMs={2000} />);
    fireEvent.click(dot(4));
    expect(dot(4)).toHaveAttribute("aria-current", "true");
  });
});

describe("BookShowcase — circular geometry", () => {
  beforeEach(() => mockMatchMedia(false));

  /** The fan tiles, in item order (first child group of the stage). */
  function tiles(container: HTMLElement) {
    const stage = container.querySelector(
      'div[class*="h-[360px]"]',
    ) as HTMLElement;
    return Array.from(stage.children) as HTMLElement[];
  }

  it("keeps ALL 7 covers visible (opacity>0) for every active index — none vanishes at an edge", () => {
    for (let a = 0; a < ITEMS.length; a += 1) {
      const { container, unmount } = render(
        <BookShowcase items={ITEMS} activeIndex={a} />,
      );
      const visible = tiles(container).filter(
        (t) => Number.parseFloat(t.style.opacity) > 0,
      );
      expect(visible).toHaveLength(ITEMS.length);
      unmount();
    }
  });

  it("suppresses the transition for an item that wraps the seam this step", () => {
    const { container, rerender } = render(
      <BookShowcase items={ITEMS} activeIndex={3} />,
    );
    // Step 3 → 4: item 0's circular offset jumps -3 → +3 (wraps the loop).
    // Use classList (exact tokens) — every tile also has the
    // `motion-reduce:transition-none` variant, which is a different token.
    rerender(<BookShowcase items={ITEMS} activeIndex={4} />);
    expect(tiles(container)[0].classList.contains("transition-none")).toBe(true);
    // A non-wrapping neighbour keeps its tween.
    expect(tiles(container)[4].classList.contains("transition-none")).toBe(false);
  });
});

describe("BookShowcase — Pause/Play toggle", () => {
  beforeEach(() => mockMatchMedia(false));

  it("renders the toggle only when playing + onTogglePlay are provided", () => {
    const { rerender } = render(<BookShowcase items={ITEMS} />);
    expect(
      screen.queryByRole("button", { name: /featured stories/i }),
    ).toBeNull();

    rerender(
      <BookShowcase items={ITEMS} playing onTogglePlay={() => {}} />,
    );
    expect(
      screen.getByRole("button", { name: "Pause featured stories" }),
    ).toBeInTheDocument();
  });

  it("labels the toggle by the ACTION and fires onTogglePlay", () => {
    const onTogglePlay = vi.fn();
    const { rerender } = render(
      <BookShowcase items={ITEMS} playing onTogglePlay={onTogglePlay} />,
    );
    const toggle = screen.getByRole("button", { name: "Pause featured stories" });
    fireEvent.click(toggle);
    expect(onTogglePlay).toHaveBeenCalledTimes(1);

    // Paused: the label flips to the "Play" action.
    rerender(
      <BookShowcase items={ITEMS} playing={false} onTogglePlay={onTogglePlay} />,
    );
    expect(
      screen.getByRole("button", { name: "Play featured stories" }),
    ).toBeInTheDocument();
  });

  it("hides the toggle under reduced motion (nothing to pause)", () => {
    mockMatchMedia(true);
    render(<BookShowcase items={ITEMS} playing onTogglePlay={() => {}} />);
    expect(
      screen.queryByRole("button", { name: /featured stories/i }),
    ).toBeNull();
  });

  it("honours a host-controlled paused prop (auto stops even without hover)", () => {
    vi.useFakeTimers();
    try {
      const onActiveChange = vi.fn();
      render(
        <BookShowcase
          items={ITEMS}
          autoAdvanceMs={1000}
          paused
          onActiveChange={onActiveChange}
        />,
      );
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(onActiveChange).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("has no axe violations with the toggle present", async () => {
    const { container } = render(
      <BookShowcase items={ITEMS} playing onTogglePlay={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("BookShowcase — decorative mode (single featured story)", () => {
  beforeEach(() => mockMatchMedia(false));

  it("exposes NO interactive control — no dot buttons, no Choose-a-story group", () => {
    render(<BookShowcase items={ITEMS} decorative />);
    // No buttons at all (tiles are inert, dots are indicators).
    expect(screen.queryByRole("button")).toBeNull();
    expect(
      screen.queryByRole("group", { name: "Choose a featured story" }),
    ).toBeNull();
  });

  it("hides the whole region from AT (the host copy carries the real info)", () => {
    render(<BookShowcase items={ITEMS} decorative />);
    expect(
      screen.queryByRole("region", { name: "Featured stories" }),
    ).toBeNull();
  });

  it("still auto-cycles visually (the decorative active indicator advances)", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(
        <BookShowcase items={ITEMS} decorative autoAdvanceMs={4000} />,
      );
      // The active indicator is the lone elongated (w-[26px]) pill among the
      // h-[9px] indicators. 7 items → middle index 3 is active at mount.
      const activeIndex = () => {
        const dots = Array.from(
          container.querySelectorAll<HTMLElement>('span[class*="h-[9px]"]'),
        );
        return dots.findIndex((d) => d.className.includes("w-[26px]"));
      };
      expect(activeIndex()).toBe(3);

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      // Auto-cycle advanced the active indicator — with no AT-facing control.
      expect(activeIndex()).toBe(4);
      expect(screen.queryByRole("button")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("has no axe violations in decorative mode", async () => {
    const { container } = render(<BookShowcase items={ITEMS} decorative />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("BookShowcase — a11y", () => {
  beforeEach(() => mockMatchMedia(false));

  it("has no axe violations", async () => {
    const { container } = render(<BookShowcase items={ITEMS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
