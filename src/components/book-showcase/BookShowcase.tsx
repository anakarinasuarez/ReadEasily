"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cx } from "@/lib/utils/cx";
import type { HTMLAttributes, KeyboardEvent, SVGProps } from "react";
import { BookCover } from "@/components/book-card";

/**
 * BookShowcase — the circular, auto-rotating "cover-flow" carousel for the
 * Library hero, 1:1 with the Figma "Book Carousel" (node 1272:4611) + its
 * position dots (node 1272:4600).
 *
 * It is a presentation composite that fans a set of covers around a CIRCULAR
 * loop: the active cover is centered (largest, raised, full opacity, strongest
 * warm shadow); neighbours recede symmetrically by ring (rotation + scale + x
 * offset + depth fade + lighter shadow). For up to `FAN_RING.length` covers per
 * side, EVERY cover is always on a ring slot (none vanishes at an edge); extra
 * covers (N beyond the fan width) ride at the back, faded out. It auto-rotates
 * STEP-AND-REST (each cover slides to centre, rests `autoAdvanceMs`, then steps)
 * and shows a synced dot row plus a Pause/Play toggle.
 *
 * A11y: in the default (interactive) mode the region is a `carousel` whose
 * accessible controls are the dots (roving tabindex, per-story names) + the
 * Pause/Play toggle. The fanned cover images are decorative (the active book's
 * real title/level live in the host copy block), so every tile is `aria-hidden`.
 * `onActiveChange` is tagged `"auto"` (timer) vs `"user"` (dot/arrow/cover) so
 * the host announces only user-initiated changes (never auto-advance) and can
 * hard-stop rotation on interaction (WCAG 2.2.2).
 *
 * `decorative` mode hides the whole region from AT (a single-story host); the
 * fan still auto-cycles visually and the dots become inert indicators.
 *
 * The fan transform numbers are Figma-exact geometry (no token covers cover-fan
 * placement), annotated below like the off-scale literals in Avatar/BookCover.
 */

export interface BookShowcaseItem {
  /** Cover image URL fed to the underlying BookCover. */
  coverSrc: string;
  /**
   * The story's accessible name. The fan tiles stay `aria-hidden`, so this is
   * NOT painted on them; instead it (a) names the item's position dot — the
   * accessible control — so a dot identifies its story rather than reading
   * "Featured story N", and (b) lets the consumer's hero copy block share the
   * same source of truth as the active index.
   */
  alt: string;
  /**
   * Optional reader destination. When the item is the CENTER (active) cover and
   * has an `href`, its tile renders as a real link — a redundant pointer
   * affordance over the host CTA (it stays `aria-hidden` + untabbable, so it
   * adds no duplicate tab stop; the dots/CTA are the keyboard/AT path).
   */
  href?: string;
}

/** Why the active index changed — lets the host treat auto vs user differently. */
export type ActiveChangeSource = "auto" | "user";

export interface BookShowcaseProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** The featured covers, fanned in order around the loop. */
  items: BookShowcaseItem[];
  /** Controlled active index. Omit for uncontrolled (internal state). */
  activeIndex?: number;
  /**
   * Fires whenever the active cover changes, tagged with its `source`: `"auto"`
   * (the rest timer) or `"user"` (dot / arrow / side-cover). The host announces
   * only `"user"` changes and hard-stops auto on any `"user"` change.
   */
  onActiveChange?: (index: number, source: ActiveChangeSource) => void;
  /** Rest interval in ms between auto steps. Default 4500. Off under reduced-motion. */
  autoAdvanceMs?: number;
  /**
   * Whether the fan auto-rotates. Default `true`. When `false` (or
   * `autoAdvanceMs <= 0`) no timer is started — a purely user-driven carousel.
   */
  autoAdvance?: boolean;
  /**
   * Host-controlled pause. OR'd with the component's own hover/focus pause, so
   * the host can pause for hover/focus over a WIDER region than the fan (e.g.
   * the whole hero, so reaching for the CTA pauses rotation).
   */
  paused?: boolean;
  /**
   * Play state for the Pause/Play toggle. When provided together with
   * `onTogglePlay` (and not decorative / not reduced-motion / count > 1) the
   * toggle renders to the right of the dots. The host owns this state.
   */
  playing?: boolean;
  /** Toggles play state from the visible Pause/Play control. */
  onTogglePlay?: () => void;
  /** Accessible name for the carousel region. Default "Featured stories". */
  label?: string;
  /**
   * Purely-visual mode for single-featured-story hosts: the fan still
   * auto-cycles, but the region is `aria-hidden`, tiles are non-interactive,
   * and the dots become inert indicators (no buttons, no choice advertised).
   */
  decorative?: boolean;
  className?: string;
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

/**
 * Differential warm elevation per position — the centre is THE story. Uses the
 * Figma-exact cover-elevation tokens (centre 0 22 42 / .36, side 4 10 20 / .18,
 * node 1272:4611): the raised centre gets the heavy warm lift, the receding
 * sides the light one.
 */
const CENTER_SHADOW = "var(--shadow-cover-center)";
const SIDE_SHADOW = "var(--shadow-cover-side)";

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

/**
 * Shortest signed circular distance from the active index to item `i`, folded to
 * the range (−count/2 … +count/2]. For N ≤ 2·MAX_RING+1 this keeps EVERY item on
 * a ring slot for any `active` (the fan never empties); for larger N the surplus
 * folds to the back rings.
 */
function circularOffset(i: number, active: number, count: number): number {
  let off = (((i - active) % count) + count) % count; // 0 … count-1
  if (off > count / 2) off -= count; // fold to −…+
  return off;
}

/** Two-bar pause glyph (shown while playing — the action is "Pause"). */
function PauseGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <rect x="7" y="5" width="3.5" height="14" rx="1.2" />
      <rect x="13.5" y="5" width="3.5" height="14" rx="1.2" />
    </svg>
  );
}

/** Triangle play glyph (shown while paused — the action is "Play"). */
function PlayGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

export const BookShowcase = forwardRef<HTMLElement, BookShowcaseProps>(
  function BookShowcase(
    {
      items,
      activeIndex,
      onActiveChange,
      autoAdvanceMs = 4500,
      autoAdvance = true,
      paused: pausedByHost = false,
      playing,
      onTogglePlay,
      label = "Featured stories",
      decorative = false,
      className,
      ...rest
    },
    ref,
  ) {
    const count = items.length;
    const isControlled = activeIndex !== undefined;
    // Start on the MIDDLE item so the fan opens symmetrically (covers fanning to
    // BOTH sides), instead of everything fanned to one side from index 0.
    const [internal, setInternal] = useState(() =>
      Math.max(0, Math.floor(items.length / 2)),
    );
    // Clamp so a shrunk `items` / out-of-range controlled value never NaNs.
    const rawActive = isControlled ? (activeIndex as number) : internal;
    const active = count > 0 ? ((rawActive % count) + count) % count : 0;

    const reducedMotion = usePrefersReducedMotion();
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const paused = hovered || focused || pausedByHost;

    const dotRefs = useRef<Array<HTMLButtonElement | null>>([]);

    // Seam-teleport bookkeeping. When `active` changes, compute — DURING render,
    // via React's blessed "adjust state when a prop/state changes" pattern (not
    // an effect, and not a ref read; both are disallowed by the compiler rules)
    // — which items wrapped the loop this step. Those teleport (transition
    // suppressed) at the faint far ring instead of flying across the front. The
    // flag set is recomputed fresh on every step, so it is always correct at the
    // moment a transform changes (a stale flag on an unrelated re-render is
    // harmless — there is no transform change to animate).
    const [prevActive, setPrevActive] = useState(active);
    const [wrappedFlags, setWrappedFlags] = useState<readonly boolean[]>(
      () => [],
    );
    if (active !== prevActive) {
      setWrappedFlags(
        items.map(
          (_, i) =>
            Math.abs(
              circularOffset(i, active, count) -
                circularOffset(i, prevActive, count),
            ) > MAX_RING,
        ),
      );
      setPrevActive(active);
    }

    const goTo = useCallback(
      (next: number, source: ActiveChangeSource) => {
        if (count === 0) return;
        const idx = ((next % count) + count) % count;
        if (!isControlled) setInternal(idx);
        onActiveChange?.(idx, source);
      },
      [count, isControlled, onActiveChange],
    );

    // Auto-rotate is OFF entirely when `autoAdvance` is false or the interval is
    // non-positive (no timer started, nothing to pause).
    const autoCycles = autoAdvance && autoAdvanceMs > 0;

    // Step-and-rest auto-rotation: a single timer per rest, re-armed whenever
    // `active` changes (manual or auto). Paused on hover/focus (own + host);
    // disabled under reduced-motion; never started when `autoCycles` is false.
    useEffect(() => {
      if (!autoCycles || reducedMotion || paused || count <= 1) return;
      const id = window.setTimeout(() => goTo(active + 1, "auto"), autoAdvanceMs);
      return () => window.clearTimeout(id);
    }, [autoCycles, reducedMotion, paused, count, autoAdvanceMs, active, goTo]);

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
      goTo(next, "user");
      dotRefs.current[next]?.focus();
    };

    const showToggle =
      onTogglePlay !== undefined &&
      playing !== undefined &&
      !decorative &&
      !reducedMotion &&
      count > 1;

    return (
      <section
        ref={ref}
        // Decorative hosts (single featured story) hide the whole fan from AT —
        // the host's copy block carries the real, announced information.
        aria-hidden={decorative ? true : undefined}
        aria-roledescription={decorative ? undefined : "carousel"}
        aria-label={decorative ? undefined : label}
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
            // Circular: every item lands on a ring slot for any `active`, so no
            // cover vanishes at an edge (the prior linear `i - active` bug).
            const offset = circularOffset(i, active, count);
            const dist = Math.abs(offset);
            const side = Math.sign(offset); // -1 left, +1 right, 0 center
            const ring = FAN_RING[Math.min(dist, MAX_RING)];
            const hidden = dist > MAX_RING; // only when N exceeds the fan width

            // Beyond the fan (large N): ride at the BACK, faded out — not flying
            // across the front. The circular fold keeps it on the short side.
            const x = hidden
              ? side * (FAN_RING[MAX_RING].x + (dist - MAX_RING) * 60)
              : side * ring.x;
            const y = ring.y;
            const rotate = side * ring.rotate;
            const scale = hidden ? 0.6 : ring.scale;
            const opacity = hidden ? 0 : ring.opacity;
            const z = hidden ? 0 : ring.z;

            // Seam teleport: an item that wrapped the loop this step (computed
            // above) suppresses its transition for THIS render so it re-appears
            // at the far ring instead of tweening across the front. Covers
            // multi-step manual dot jumps too.
            const wrapped = wrappedFlags[i] ?? false;

            // Interactive mode: visible SIDE covers are clickable to bring them
            // to centre. The CENTER cover, when its item has an `href`, is a real
            // link into the reader — still aria-hidden + tabIndex -1, no dup tab
            // stop. Decorative mode: tiles are inert.
            const interactive = !decorative && !hidden && dist > 0;
            const isCenterLink = !decorative && dist === 0 && Boolean(item.href);
            const tileClass = cx(
              "absolute left-1/2 top-1/2 rounded-[var(--radius-xl)] ease-out motion-reduce:transition-none",
              wrapped
                ? "transition-none"
                : "transition-[transform,opacity,box-shadow] duration-300",
              interactive || isCenterLink ? "cursor-pointer" : "pointer-events-none",
            );
            const tileStyle = {
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
              opacity,
              zIndex: z,
              // Differential elevation — centre raised hardest (see token note).
              boxShadow: dist === 0 ? CENTER_SHADOW : SIDE_SHADOW,
            };
            // Decorative tile — the real cover info lives in the host copy. The
            // centred cover is the showcase's LCP candidate, so it eager-loads
            // (priority) for a faster largest-contentful paint.
            const tile = (
              <BookCover
                size="small"
                src={item.coverSrc}
                alt=""
                priority={dist === 0}
              />
            );

            if (decorative) {
              return (
                <div key={i} aria-hidden="true" className={tileClass} style={tileStyle}>
                  {tile}
                </div>
              );
            }
            if (isCenterLink) {
              return (
                <a
                  key={i}
                  href={item.href}
                  aria-hidden="true"
                  tabIndex={-1}
                  className={cx(tileClass, "block")}
                  style={tileStyle}
                >
                  {tile}
                </a>
              );
            }
            return (
              <button
                key={i}
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                onClick={interactive ? () => goTo(i, "user") : undefined}
                className={tileClass}
                style={tileStyle}
              >
                {tile}
              </button>
            );
          })}
        </div>

        {/* Decorative mode: inert position indicators (no buttons, no choice
            advertised) — purely visual, hidden from AT. */}
        {count > 1 && decorative && (
          <div aria-hidden="true" className="flex items-center gap-sm">
            {items.map((_, i) => (
              <span
                key={i}
                className={cx(
                  "block h-[9px] rounded-[var(--radius-pill)] transition-[width,background-color] duration-200 ease-out motion-reduce:transition-none",
                  i === active
                    ? "w-[26px] bg-[var(--feedback-success)]"
                    : "w-[9px] bg-[var(--carousel-dot-idle)]",
                )}
              />
            ))}
          </div>
        )}

        {/* Interactive mode: position dots (+ optional Pause/Play toggle) are the
            accessible controls. */}
        {count > 1 && !decorative && (
          <div className="flex items-center gap-md">
            <div
              role="group"
              aria-label="Choose a featured story"
              className="flex items-center gap-sm"
            >
              {items.map((_, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={i}
                    type="button"
                    ref={(el) => {
                      dotRefs.current[i] = el;
                    }}
                    aria-label={items[i].alt}
                    aria-current={isActive ? "true" : undefined}
                    // True roving tabindex: only the active dot is in the tab
                    // order (one tab stop); ←/→/Home/End move within it.
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => goTo(i, "user")}
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
                          ? "w-[26px] bg-[var(--feedback-success)]"
                          : "w-[9px] bg-[var(--carousel-dot-idle)]",
                      )}
                    />
                  </button>
                );
              })}
            </div>

            {/* Pause/Play — the touch-operable control 2.2.2 requires (hover/
                focus pause alone fails touch). Label reflects the ACTION; hidden
                under reduced-motion (nothing to pause). Carries an icon. */}
            {showToggle && (
              <button
                type="button"
                onClick={onTogglePlay}
                aria-label={playing ? "Pause featured stories" : "Play featured stories"}
                className={cx(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-pill)] text-muted",
                  "transition-colors duration-200 ease-out hover:text-primary",
                  "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]",
                )}
              >
                <span className="inline-flex size-[16px] items-center justify-center [&>svg]:size-full">
                  {playing ? <PauseGlyph /> : <PlayGlyph />}
                </span>
              </button>
            )}
          </div>
        )}
      </section>
    );
  },
);

BookShowcase.displayName = "BookShowcase";
