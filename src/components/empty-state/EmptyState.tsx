import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { Button } from "@/ui/button";

/**
 * EmptyState — a centered, reusable "nothing here yet" card (Figma node 144:213).
 * Shared across the Saved screen (empty word list) and Search (no results), so
 * it is configuration-light and slot-friendly: pass the glyph, copy, and a single
 * primary action.
 *
 * Anatomy (top → bottom, gap = --space-xl / 24px):
 *   • rounded-SQUARE icon tile (bg-accent-subtle, rounded-card/20, 96px) — the
 *     warmth law: feature glyphs sit in rounded squares, never circles.
 *   • title  — Baloo (display) Bold ~26, text-primary
 *   • body   — Lora Italic 18 (Reading/quote style), text-muted (ink/500, AA)
 *   • CTA    — reuses the Button primitive, primary, ALWAYS carrying an icon
 *
 * A11y: the card is a labelled region (`<section aria-labelledby>`), so screen
 * readers announce it by its title. The icon tile is decorative (aria-hidden);
 * the title carries the meaning. The CTA is a real <button> or <a> with the
 * primitive's AA-visible focus ring. No nested-interactive trap — the only
 * focusable element is the action.
 */

/** A single primary call-to-action. `href` → renders an <a>; else a <button>. */
export interface EmptyStateAction {
  /** Visible CTA label. */
  label: string;
  /**
   * Trailing icon. Defaults to a right-arrow ("Start reading" →) because the
   * brand law requires every CTA to carry an icon.
   */
  icon?: ReactNode;
  /** Click handler for the button form (ignored when `href` is set). */
  onClick?: () => void;
  /** When provided, the CTA renders as a link to this destination. */
  href?: string;
}

export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Glyph rendered inside the rounded-square tile. Decorative. */
  icon: ReactNode;
  /** Headline — the region's accessible name. */
  title: ReactNode;
  /** Supporting sentence (Lora Italic, muted). Optional. */
  body?: ReactNode;
  /** Optional single primary action. */
  action?: EmptyStateAction;
}

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Default trailing CTA icon — a right arrow (decorative, sized by Button). */
function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export const EmptyState = forwardRef<HTMLElement, EmptyStateProps>(
  function EmptyState({ icon, title, body, action, className, ...rest }, ref) {
    const titleId = useId();

    const actionIcon = action?.icon ?? <ArrowRightIcon />;

    return (
      <section
        ref={ref}
        aria-labelledby={titleId}
        className={cn(
          // Gradient surface = canvas → subtle (token stops; no gradient token
          // exists, so we bind the two warm surface tokens per the spec).
          "flex flex-col items-center justify-center gap-xl",
          "bg-[linear-gradient(to_bottom,var(--bg-canvas),var(--bg-subtle))]",
          "rounded-2xl p-3xl-plus text-center shadow-empty",
          className,
        )}
        {...rest}
      >
        {/* Rounded-SQUARE icon tile (never a circle). 96px, 44px glyph. */}
        <span
          aria-hidden="true"
          className={cn(
            "flex size-24 shrink-0 items-center justify-center",
            "rounded-card bg-accent-subtle text-accent-text",
            "[&>svg]:size-11",
          )}
        >
          {icon}
        </span>

        <p
          id={titleId}
          className={cn(
            // Baloo (display) Bold, Display/M (26 / lh 1.1). Size + line-height
            // bind via `text-display-m`; family/weight/color are token-bound.
            "font-display font-bold text-primary",
            "text-display-m",
          )}
        >
          {title}
        </p>

        {body != null && (
          <p
            className={cn(
              // Reading/quote text style: Lora Italic 18/28, muted (AA ink/500).
              "max-w-prose italic text-muted",
              "[font-family:var(--text-reading-quote-family)]",
              "[font-size:var(--text-reading-quote-size)]",
              "[line-height:var(--text-reading-quote-line-height)]",
            )}
          >
            {body}
          </p>
        )}

        {action != null &&
          (action.href != null ? (
            <Button
              asChild
              variant="primary"
              size="lg"
              className="gap-[var(--space-sm)]"
            >
              <a href={action.href}>
                <span>{action.label}</span>
                <span
                  aria-hidden="true"
                  className="inline-flex size-[18px] shrink-0 items-center justify-center [&>svg]:size-full"
                >
                  {actionIcon}
                </span>
              </a>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              rightIcon={actionIcon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
      </section>
    );
  },
);

EmptyState.displayName = "EmptyState";
