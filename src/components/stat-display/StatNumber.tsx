import * as React from "react";
import { cx } from "@/lib/utils/cx";

/**
 * stat-display family — shared internal.
 *
 * The two PUBLIC primitives of this family (StatTile, StatPill) each render a
 * large "Display/Mobile" numeral. That numeral — Baloo 2 ExtraBold, 32/40,
 * tracking -0.32px — is the one thing they share, so it is factored here so the
 * type stays in exactly one place (and, critically, the colour is never baked
 * in: each surface picks its own AA-safe tone — see StatPill's NUMBER_TONE).
 *
 * The numeral binds to the Display/Mobile ramp entry: the `text-display-mobile`
 * utility carries the 32/40 size + line-height and the tracking binds to
 * --text-display-mobile-tracking. The FONT FAMILY and WEIGHT are token-bound too
 * (`font-display` → --font-display, `font-extrabold` → 800 = Baloo ExtraBold).
 *
 * This is an internal building block — it has no public story/test of its own;
 * it is exercised through both StatTile and StatPill.
 */

/** Shared tone vocabulary for the stat-display family. Matches the Figma StatTile `tone` variant (Accent / Warning / Info / Success). */
export type StatTone = "accent" | "warning" | "info" | "success";

export interface StatNumberProps {
  /** The numeral to display. */
  value: string | number;
  /** Colour utility (token-bound) supplied by the parent surface. */
  className?: string;
}

export function StatNumber({ value, className }: StatNumberProps) {
  return (
    <span
      className={cx(
        // family numeral: Baloo ExtraBold, Display/Mobile 32/40, tracking -0.32px
        "font-display font-extrabold text-display-mobile tracking-[var(--text-display-mobile-tracking)] tabular-nums",
        className,
      )}
    >
      {value}
    </span>
  );
}
