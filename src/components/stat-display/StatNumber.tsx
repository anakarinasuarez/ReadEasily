import * as React from "react";

/**
 * stat-display family — shared internal.
 *
 * The two PUBLIC primitives of this family (StatTile, StatPill) each render a
 * large "Display/Mobile" numeral. That numeral — Baloo 2 ExtraBold, 32/40,
 * tracking -0.32px — is the one thing they share, so it is factored here so the
 * type stays in exactly one place (and, critically, the colour is never baked
 * in: each surface picks its own AA-safe tone — see StatPill's NUMBER_TONE).
 *
 * NOTE on tokens: the generated typography ramp has no "Display/Mobile" entry
 * (it tops out at Display/L 44/52), so the SIZE / line-height / tracking are
 * Figma-exact arbitrary values. The FONT FAMILY and WEIGHT are token-bound
 * (`font-display` → --font-display, `font-extrabold` → 800 = Baloo ExtraBold).
 * If a Display/Mobile text style is added to src/tokens/typography.css later,
 * swap the three literals for that single `text-display-m` utility.
 *
 * This is an internal building block — it has no public story/test of its own;
 * it is exercised through both StatTile and StatPill.
 */

/** Shared tone vocabulary for the stat-display family. Matches the Figma StatTile `tone` variant (Accent / Warning / Info / Success). */
export type StatTone = "accent" | "warning" | "info" | "success";

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

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
        // family numeral: Baloo ExtraBold 32/40, tracking -0.32px (see note above)
        "font-display font-extrabold text-[32px] leading-[40px] tracking-[-0.32px] tabular-nums",
        className,
      )}
    >
      {value}
    </span>
  );
}
