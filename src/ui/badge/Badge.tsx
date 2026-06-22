import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * Badge — non-interactive status / categorization / vocabulary chip.
 * 1:1 with Figma "Badge" (node 17:42). Distinct from Chip: Badge is a label,
 * not a filter control. By default it renders a plain <span> and carries its
 * meaning in `children` (the status dot is decorative, never the only signal).
 *
 * Typography is unified on Label/M for every tone (project decision — the
 * Figma "Neutral uses Meta" divergence is treated as an inconsistency).
 */

export type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "selected";

export type BadgeSize = "sm" | "md";

type BadgeBaseProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Tone — maps 1:1 to the Figma `tone` variant property. */
  tone?: BadgeTone;
  /** Size — maps 1:1 to the Figma `size` variant property. */
  size?: BadgeSize;
  /** Optional leading glyph (decorative, `aria-hidden`) — e.g. the editor's-pick
   *  star. The meaning still lives in `children`, never in the icon alone. */
  icon?: ReactNode;
  /** The label. Must carry the meaning on its own (e.g. "A2 Elementary"). */
  children: ReactNode;
};

/**
 * The trailing "+" affordance (intended for `neutral` / `accent` vocab chips).
 * When `onAdd` is set it renders a real <button> and an accessible name is
 * required; when omitted the "+" is not rendered at all. This union makes it
 * impossible to ship an unlabelled action button.
 */
type AddAffordanceProps =
  | { onAdd?: undefined; addLabel?: never }
  | { onAdd: () => void; addLabel: string };

export type BadgeProps = BadgeBaseProps & AddAffordanceProps;

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** bg + text (+ border for neutral) per tone — all token-bound. */
const toneContainer: Record<BadgeTone, string> = {
  neutral: "bg-surface-elevated text-accent-text border border-border-accent",
  accent: "bg-accent-subtle text-accent-text",
  info: "bg-info-subtle text-info",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  // accent-strong (terracotta-700), not accent (600): white on 600 is only
  // 3.45:1 (fails AA); on accent-strong it's 5.13:1 (passes) — same reason the
  // interactive terracotta token exists.
  selected: "bg-accent-strong text-on-accent",
};

/** Status-dot fill per feedback tone (decorative). */
const toneDot: Partial<Record<BadgeTone, string>> = {
  info: "bg-info",
  success: "bg-success",
  // Warning dot uses the bright (AA-failing) amber on purpose: it is purely
  // decorative, while the warning TEXT uses the darkened AA-safe token.
  warning: "bg-warning-solid",
  danger: "bg-danger",
};

const sizePadding: Record<BadgeSize, string> = {
  md: "px-md py-sm",
  sm: "px-sm py-xs",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", size = "md", icon, children, onAdd, addLabel, className, ...rest },
  ref,
) {
  const dotClass = toneDot[tone];
  const isNeutral = tone === "neutral";

  // Neutral + "+" uses the off-scale pill layout from Figma (pl 14 / pr 7 /
  // py 5 / gap 6). `--space-chip-x` (14px) is a real token; 7/5/6 have no
  // token and are flagged for ramp reconciliation. Every other case uses the
  // on-scale size padding.
  const layout =
    isNeutral && onAdd
      ? "pl-[var(--space-chip-x)] pr-[7px] py-[5px] gap-[6px]"
      : cx("gap-xs", sizePadding[size]);

  return (
    <span
      ref={ref}
      className={cx(
        "inline-flex items-center justify-center align-middle rounded-pill",
        "font-ui font-semibold text-label-m tracking-[var(--text-label-m-tracking)]",
        layout,
        toneContainer[tone],
        className,
      )}
      {...rest}
    >
      {dotClass && (
        <span
          aria-hidden="true"
          className={cx(
            "shrink-0 rounded-pill",
            size === "md" ? "size-[8px]" : "size-[6px]",
            dotClass,
          )}
        />
      )}

      {icon && (
        <span
          aria-hidden="true"
          className={cx(
            "inline-flex shrink-0 items-center justify-center [&>svg]:size-full",
            size === "md" ? "size-[14px]" : "size-[12px]",
          )}
        >
          {icon}
        </span>
      )}

      <span>{children}</span>

      {onAdd && (
        <button
          type="button"
          aria-label={addLabel}
          onClick={onAdd}
          className={cx(
            "shrink-0 inline-flex items-center justify-center leading-none rounded-pill",
            "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
            isNeutral
              ? "size-[24px] bg-surface-subtle text-muted transition-colors hover:bg-accent-subtle hover:text-accent-text"
              : "size-[24px] text-[15px] text-accent-text transition-colors hover:bg-accent-subtle",
          )}
        >
          <span aria-hidden="true">+</span>
        </button>
      )}
    </span>
  );
});

Badge.displayName = "Badge";
