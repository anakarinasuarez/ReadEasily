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

function dot(n: number) {
  return screen.getByRole("button", { name: `Featured story ${n}` });
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

  it("marks the active dot with aria-current and no others", () => {
    render(<BookShowcase items={ITEMS} />);
    expect(dot(1)).toHaveAttribute("aria-current", "true");
    expect(dot(2)).not.toHaveAttribute("aria-current");
  });

  it("clicking a dot moves the active state and fires onActiveChange", () => {
    const onActiveChange = vi.fn();
    render(<BookShowcase items={ITEMS} onActiveChange={onActiveChange} />);

    fireEvent.click(dot(3));

    expect(onActiveChange).toHaveBeenCalledWith(2);
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
    expect(onActiveChange).toHaveBeenCalledWith(0);
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
    expect(dot(1)).toHaveAttribute("aria-current", "true");

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(onActiveChange).toHaveBeenCalledWith(1);
    expect(dot(2)).toHaveAttribute("aria-current", "true");
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
    expect(dot(1)).toHaveAttribute("aria-current", "true");

    // Resumes once the pointer leaves.
    fireEvent.mouseLeave(region);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(dot(2)).toHaveAttribute("aria-current", "true");
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
    expect(dot(1)).toHaveAttribute("aria-current", "true");
  });

  it("still lets the user change covers via the dots", () => {
    render(<BookShowcase items={ITEMS} autoAdvanceMs={2000} />);
    fireEvent.click(dot(4));
    expect(dot(4)).toHaveAttribute("aria-current", "true");
  });
});

describe("BookShowcase — a11y", () => {
  beforeEach(() => mockMatchMedia(false));

  it("has no axe violations", async () => {
    const { container } = render(<BookShowcase items={ITEMS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
