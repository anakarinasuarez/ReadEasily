"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { HTMLAttributes, KeyboardEvent } from "react";
import { BookCover } from "@/components/book-card";

/**
 * BookShowcase — the fanned, auto-cycling featured-cover carousel for the
 * Library hero, 1:1 with the Figma "Book Carousel" (node 1272:4611) + its
 * position dots (node 1272:4600).
 *
 * It is a presentation composite: it fans a set of covers (the active one
 * centered/largest/raised, neighbours receding symmetrically with rotation +
 * scale + horizontal offset + depth fade), auto-cycles which cover is centered,
 * and shows a synced row of position dots. The Library feature feeds it the
 * featured set and reads `onActiveChange` to drive the hero copy block.
 *
 * A11y: the region is a `carousel` whose accessible control is the dots — the
 * fanned cover images are decorative here (the active book's real title/level
 * live in the hero copy block), so every cover tile is `aria-hidden` to avoid
 * double-announcing. The dots are real `<button>`s with `aria-current`.
 *
 * The fan transform numbers are Figma-exact geometry (no token covers cover-fan
 * placement), annotated below like the off-scale literals in Avatar/BookCover.
 */

export interface BookShowcaseItem {
  /** Cover image URL fed to the underlying BookCover. */
  coverSrc: string;
  /**
   * Describes the cover. NOT rendered on the decorative fan tiles (they are
   * `aria-hidden`); kept on the item so the consumer's hero copy block can use
   * the same source of truth as the active index.
   */
  alt: string;
}

export interface BookShowcaseProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** The featured covers, fanned in order. */
  items: BookShowcaseItem[];
  /** Controlled active index. Omit for uncontrolled (internal state). */
  activeIndex?: number;
  /** Fires whenever the active cover changes (timer, dot click, or arrows). */
  onActiveChange?: (index: number) => void;
  /** Auto-cycle interval in ms. Default 4500. Ignored under reduced-motion. */
  autoAdvanceMs?: number;
  /** Accessible name for the carousel region. Default "Featured stories". */
  label?: string;
  className?: string;
}

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Per-ring fan geometry, relative to the active cover (ring 0). Measured from
 * Figma node 1272:4611: the center cover (218×324) sits at scale 1.30 over the
 * BookCover "small" base (168×242 → 218×314), neighbours recede by ring. Left
 * side mirrors `x`/`rotate`. These are Figma-exact literals, not tokens — there
 * is no design token for cover-fan placement.
 */
const FAN_RING = [
  { x: 0, y: 0, rotate: 0, scale: 1.3, opacity: 1, z: 40 }, // center — raised, full
  { x: 139, y: 2, rotate: 3, scale: 1.1, opacity: 0.88, z: 30 }, // L1/R1
  { x: 251, y: 13, rotate: 4, scale: 0.86, opacity: 0.68, z: 20 }, // L2/R2
  { x: 393, y: 32, rotate: 4.9, scale: 0.7, opacity: 0.46, z: 10 }, // L3/R3
] as const;

/** The fan shows the center cover plus this many neighbours per side. */
const MAX_RING = FAN_RING.length - 1;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Reads `prefers-reduced-motion: reduce`, SSR/jsdom-safe (no setState-in-effect). */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mq = window.matchMedia(REDUCED_MOTION_QUERY);
      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    },
    () => window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false,
    () => false,
  );
}

export const BookShowcase = forwardRef<HTMLElement, BookShowcaseProps>(
  function BookShowcase(
    {
      items,
      activeIndex,
      onActiveChange,
      autoAdvanceMs = 4500,
      label = "Featured stories",
      className,
      ...rest
    },
    ref,
  ) {
    const count = items.length;
    const isControlled = activeIndex !== undefined;
    const [internal, setInternal] = useState(0);
    // Clamp so a shrunk `items` / out-of-range controlled value never NaNs.
    const rawActive = isControlled ? (activeIndex as number) : internal;
    const active = count > 0 ? ((rawActive % count) + count) % count : 0;

    const reducedMotion = usePrefersReducedMotion();
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const paused = hovered || focused;

    const dotRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const goTo = useCallback(
      (next: number) => {
        if (count === 0) return;
        const idx = ((next % count) + count) % count;
        if (!isControlled) setInternal(idx);
        onActiveChange?.(idx);
      },
      [count, isControlled, onActiveChange],
    );

    // Auto-cycle. Kicks off on mount and — because `active` is a dependency —
    // RESETS every time the active cover changes (e.g. a dot click), matching
    // the book-showcase-autocycle memory (it must actually start, not just be
    // defined). Paused on hover/focus-within; disabled under reduced-motion.
    useEffect(() => {
      if (reducedMotion || paused || count <= 1) return;
      const id = window.setTimeout(() => goTo(active + 1), autoAdvanceMs);
      return () => window.clearTimeout(id);
    }, [reducedMotion, paused, count, autoAdvanceMs, active, goTo]);

    // Blur bubbles; only drop the pause once focus actually left the region.
    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setFocused(false);
      }
    };

    // Roving arrow-key nav across the dots: move active AND focus together.
    const onDotKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
      let next: number | null = null;
      if (e.key === "ArrowRight") next = (i + 1) % count;
      else if (e.key === "ArrowLeft") next = (i - 1 + count) % count;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = count - 1;
      if (next === null) return;
      e.preventDefault();
      goTo(next);
      dotRefs.current[next]?.focus();
    };

    return (
      <section
        ref={ref}
        aria-roledescription="carousel"
        aria-label={label}
        className={cx("flex w-full flex-col items-center gap-xl", className)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        {...rest}
      >
        {/* Fan stage — covers are absolutely centered then transformed per ring. */}
        <div className="relative h-[360px] w-full overflow-hidden">
          {items.map((item, i) => {
            const offset = i - active;
            const dist = Math.abs(offset);
            const side = Math.sign(offset); // -1 left, +1 right, 0 center
            const ring = FAN_RING[Math.min(dist, MAX_RING)];
            const hidden = dist > MAX_RING;

            // Beyond the fan: keep sliding out (so transitions read as motion),
            // fully transparent and behind everything.
            const x = hidden
              ? side * (FAN_RING[MAX_RING].x + (dist - MAX_RING) * 60)
              : side * ring.x;
            const y = ring.y;
            const rotate = side * ring.rotate;
            const scale = hidden ? 0.6 : ring.scale;
            const opacity = hidden ? 0 : ring.opacity;
            const z = hidden ? 0 : ring.z;

            return (
              <div
                key={i}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none"
                style={{
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
                  opacity,
                  zIndex: z,
                }}
              >
                {/* Decorative tile — the real cover info lives in the hero copy. */}
                <BookCover size="small" src={item.coverSrc} alt="" />
              </div>
            );
          })}
        </div>

        {/* Position dots — the accessible control. */}
        {count > 1 && (
          <div role="group" aria-label="Choose a featured story" className="flex items-center gap-sm">
            {items.map((_, i) => {
              const isActive = i === active;
              return (
                <button
                  key={i}
                  type="button"
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  aria-label={`Featured story ${i + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => goTo(i)}
                  onKeyDown={(e) => onDotKeyDown(e, i)}
                  className={cx(
                    "inline-flex h-6 items-center justify-center rounded-[var(--radius-pill)] px-1",
                    "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]",
                  )}
                >
                  {/* Visible pill: active elongates to ~26px (Figma-exact). */}
                  <span
                    className={cx(
                      "block h-[9px] rounded-[var(--radius-pill)] transition-[width,background-color] duration-200 ease-out motion-reduce:transition-none",
                      isActive
                        ? "w-[26px] bg-[var(--bg-accent-strong)]"
                        : "w-[9px] bg-[var(--border-default)]",
                    )}
                  />
                </button>
              );
            })}
          </div>
        )}
      </section>
    );
  },
);

BookShowcase.displayName = "BookShowcase";
