import * as React from "react";
import { StatNumber, type StatTone } from "@/components/stat-display";

/**
 * StatTile — the Profile-header stat card. 1:1 with the Figma "Card" component
 * set (151:28): a non-interactive, elevated card holding a tone-tinted
 * rounded-SQUARE icon tile, a large Display numeral, and a label.
 *
 * Figma models the tone as a 4-value variant property (Accent / Warning / Info
 * / Success); we reproduce it exactly as the `tone` prop. The tone drives the
 * ICON TILE only (tint + glyph colour) — the numeral is always `text-primary`,
 * matching Figma.
 *
 * Non-interactive: it renders as a plain <div>, the icon is decorative
 * (aria-hidden), and the numeral + label are plain text. There is no role and
 * nothing focusable, so it is skipped in tab order (see StatTile.test.tsx).
 */

/** Tone of the icon tile. Mirrors the Figma `tone` variant. */
export type StatTileTone = StatTone;

export interface StatTileProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Icon-tile tint + glyph colour. Defaults to `accent` (brand terracotta). */
  tone?: StatTileTone;
  /** Glyph rendered inside the rounded-square tile (decorative; aria-hidden). */
  icon: React.ReactNode;
  /** The large Display numeral (e.g. a count). */
  value: string | number;
  /** The caption beneath the numeral (Label/M, muted). */
  label: string;
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Icon-tile tint + glyph colour per tone — all token-bound, no hardcoded values.
 * Glyph colours use the AA-safe semantic text tokens (the tile is decorative,
 * but we never emit raw amber anywhere — `text-warning` = --feedback-warning
 * #8a5a14, not the decorative #e0a838).
 */
const TILE_TONE: Record<StatTileTone, string> = {
  accent: "bg-accent-subtle text-accent-text",
  warning: "bg-warning-subtle text-warning",
  info: "bg-info-subtle text-info",
  success: "bg-success-subtle text-success",
};

export const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(
  function StatTile(
    { tone = "accent", icon, value, label, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          // card: elevated surface, 20px radius, warm card shadow. gap-md-plus
          // (14) / p-lg-plus (22) bind to the spacing ramp; w-285 is the Figma
          // fixed width and can be overridden via className.
          "flex w-[285px] flex-col items-start gap-md-plus rounded-card bg-surface-elevated p-lg-plus shadow-card",
          className,
        )}
        {...rest}
      >
        {/* rounded-SQUARE icon tile (warmth law: never a circle). rounded-icon
            is the canonical icon-tile radius (13px); Figma draws 12px — a 1px
            reconciliation toward the token, see the report. */}
        <span
          aria-hidden="true"
          className={cx(
            "flex size-10 shrink-0 items-center justify-center rounded-icon [&>svg]:size-5",
            TILE_TONE[tone],
          )}
        >
          {icon}
        </span>
        {/* numeral is always text-primary in Figma — tone never touches it */}
        <StatNumber value={value} className="text-primary" />
        <span className="font-ui text-label-m font-semibold text-muted">
          {label}
        </span>
      </div>
    );
  },
);

StatTile.displayName = "StatTile";
