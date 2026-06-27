import * as React from "react";
import { cx } from "@/lib/utils/cx";
import { StatNumber, type StatTone } from "@/components/stat-display";

/**
 * StatPill — the Saved-header stat pill. 1:1 with the Figma "pills" node
 * (999:1714): a small, elevated pill holding a large tone-coloured numeral
 * beside a 2-line label. No icon tile (that is StatTile's job).
 *
 * Non-interactive: a plain <div>, numeral + label are plain text, nothing
 * focusable (see StatPill.test.tsx).
 *
 * AA — the numeral colour is the load-bearing detail. The Figma "practice sets"
 * numeral is raw amber #e0a838, which FAILS AA (~1.6:1 region). Here the
 * `warning` tone maps to `text-warning` → --feedback-warning (#8a5a14), the
 * AA-safe token (~5.9:1 on the elevated surface), NOT the decorative
 * --feedback-warning-solid. Every tone resolves to an AA-safe `text-*` token;
 * the static contrast guard in src/tokens/contrast.test.ts ("warning numeral on
 * elevated") plus StatPill.test.tsx lock this in.
 */

/** Tone of the numeral. Mirrors the stat-display family vocabulary. */
export type StatPillTone = StatTone;

export interface StatPillProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** The large Display numeral. */
  value: string | number;
  /** The label beside the numeral (Label/S, secondary). Wraps to 2 lines. */
  label: React.ReactNode;
  /** Numeral colour. Defaults to `accent`. Always resolves to an AA-safe token. */
  tone?: StatPillTone;
}

/**
 * Numeral colour per tone — every value is an AA-safe semantic text token on
 * the elevated surface. `warning` is DELIBERATELY --feedback-warning (#8a5a14),
 * never the decorative raw amber --feedback-warning-solid (#e0a838).
 */
const NUMBER_TONE: Record<StatPillTone, string> = {
  accent: "text-accent-text", // --text-accent  #a0492a
  warning: "text-warning", //    --feedback-warning #8a5a14 (AA-safe, NOT raw amber)
  info: "text-info", //          --feedback-info #3d6082
  success: "text-success", //    --feedback-success #566f34
};

export const StatPill = React.forwardRef<HTMLDivElement, StatPillProps>(
  function StatPill({ value, label, tone = "accent", className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cx(
          // pill: elevated surface, 16px radius, stat shadow, px-16/py-8, gap-8.
          // w-145 is the Figma fixed width and can be overridden via className.
          "inline-flex w-[145px] items-center justify-center gap-sm rounded-md bg-surface-elevated px-lg py-sm shadow-stat",
          className,
        )}
        {...rest}
      >
        <StatNumber value={value} className={NUMBER_TONE[tone]} />
        {/* 2-line label — wraps naturally inside the pill width */}
        <span className="font-ui text-label-s font-semibold text-secondary">
          {label}
        </span>
      </div>
    );
  },
);

StatPill.displayName = "StatPill";
