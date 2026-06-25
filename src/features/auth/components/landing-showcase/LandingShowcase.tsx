"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * LandingShowcase — the Landing's decorative book display (Figma desktop 171:361,
 * mobile 823:944). A large active cover sits above a 5-thumbnail rail; the active
 * thumb is framed in an accent border, the rest recede at reduced opacity. The
 * active cover auto-cycles every `autoAdvanceMs` (default 3600ms), advancing the
 * big cover and which thumb is framed.
 *
 * This is the LANDING variant of the book display — NOT the circular cover-flow
 * `BookShowcase` used by the Library hero. It is purely PRESENTATIONAL marketing
 * art: the whole region is `aria-hidden` and non-interactive (no buttons, no
 * tab stops), matching `BookShowcase`'s `decorative` mode — the host copy carries
 * the real, announced information.
 *
 * Motion respects both `prefers-reduced-motion` and the consumer's `reduceMotion`
 * preference (OR'd): when either is set, the display is static (no auto-advance),
 * pinned to the initial active cover.
 *
 * Geometry is Figma-exact and literal (there is no design token for cover
 * footprints — same established pattern as BookCover / the BookShowcase fan):
 *   • active cover  302×445 (mobile) → 360×530 (md), rounded-[18px], cover shadow
 *   • active thumb  45×65   (mobile) → 54×78  (md), 2.5px accent border
 *   • idle thumb    40×58   (mobile) → 48×70  (md), opacity .70
 */

export interface LandingShowcaseItem {
  /** Cover image URL. */
  coverSrc: string;
  /**
   * Source-of-truth title for the cover. The display is `aria-hidden`, so this
   * is NOT painted as alt text (covers render `alt=""`); it documents intent and
   * keeps parity with the catalog that lives behind the CTA.
   */
  alt: string;
}

export interface LandingShowcaseProps {
  /** The covers to display, in rail order. The Landing passes 5. */
  items: LandingShowcaseItem[];
  /** Index of the cover shown first (default 0 — "The Ant and the Grasshopper"). */
  initialActive?: number;
  /** Auto-cycle interval in ms (default 3600). `<= 0` disables auto-cycle. */
  autoAdvanceMs?: number;
  /**
   * Force the static (no auto-advance) presentation — wire the consumer's
   * `reduceMotion` preference here. OR'd with the `prefers-reduced-motion` media
   * query, so either source pins the display.
   */
  reduceMotion?: boolean;
  /** Extra classes on the outer wrapper (e.g. width cap). */
  className?: string;
}

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

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function LandingShowcase({
  items,
  initialActive = 0,
  autoAdvanceMs = 3600,
  reduceMotion = false,
  className,
}: LandingShowcaseProps) {
  const count = items.length;
  const clamp = (i: number) => (count > 0 ? ((i % count) + count) % count : 0);

  const [active, setActive] = useState(() => clamp(initialActive));
  const prefersReduced = usePrefersReducedMotion();
  const isStatic = reduceMotion || prefersReduced;

  // Single re-armed timer per rest; off when static / single cover / disabled.
  useEffect(() => {
    if (isStatic || count <= 1 || autoAdvanceMs <= 0) return;
    const id = window.setTimeout(
      () => setActive((i) => (i + 1) % count),
      autoAdvanceMs,
    );
    return () => window.clearTimeout(id);
  }, [isStatic, count, autoAdvanceMs, active]);

  const activeItem = items[clamp(active)];

  return (
    <div
      aria-hidden="true"
      className={cx(
        "pointer-events-none flex select-none flex-col items-center gap-[18px]",
        className,
      )}
    >
      {/* Active cover — the hero of the display. */}
      <div
        data-testid="landing-showcase-cover"
        className="relative h-[445px] w-[302px] overflow-hidden rounded-[18px] shadow-[var(--shadow-cover-center)] md:h-[530px] md:w-[360px]"
      >
        {activeItem && (
          <Image
            key={activeItem.coverSrc}
            src={activeItem.coverSrc}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 360px, 302px"
            className="object-cover"
          />
        )}
      </div>

      {/* Thumbnail rail — the active thumb is framed; the rest recede. */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-[var(--space-sm)]">
          {items.map((item, i) => {
            const isActive = i === clamp(active);
            return (
              <div
                key={item.coverSrc}
                className={cx(
                  "relative overflow-hidden rounded-[8px]",
                  "transition-[width,height,opacity,border-color] duration-300 ease-out motion-reduce:transition-none",
                  isActive
                    ? "h-[65px] w-[45px] border-[2.5px] border-border-accent opacity-100 md:h-[78px] md:w-[54px]"
                    : "h-[58px] w-[40px] opacity-70 md:h-[70px] md:w-[48px]",
                )}
              >
                <Image
                  src={item.coverSrc}
                  alt=""
                  fill
                  sizes="54px"
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
