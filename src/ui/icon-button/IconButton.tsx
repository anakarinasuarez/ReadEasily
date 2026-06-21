import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export type IconButtonVariant = "subtle" | "ghost" | "accent";
export type IconButtonSize = "sm" | "md";

export interface IconButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "aria-label" | "children"
  > {
  /** Visual style. `subtle` (default) for toolbar utilities, `ghost` for the
   * lightest affordance, `accent` for a solid terracotta action. */
  variant?: IconButtonVariant;
  /** Square footprint: `sm` = 32px, `md` (default) = 40px. */
  size?: IconButtonSize;
  /** The single glyph to render, centered. Required — this primitive is
   * icon-only. Rendered `aria-hidden`; the name comes from `aria-label`. */
  icon: ReactNode;
  /**
   * Replaces the icon with a spinner, keeps the footprint stable, sets
   * `aria-busy` and blocks interaction without applying the disabled styling.
   */
  loading?: boolean;
  /**
   * REQUIRED accessible name. An icon-only control has no visible text, so the
   * label is the only thing a screen reader can announce (WCAG 4.1.2).
   */
  "aria-label": string;
}

/** Join class fragments, dropping falsy ones. */
function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------------------------------------------------
 * Token-bound class maps. Every color / radius resolves to a CSS custom
 * property from src/tokens/*. The only literals are the geometry the design
 * system does not tokenize (the square footprint + icon box). Visual 40px is
 * AA-conformant for WCAG 2.5.8 (min target 24px); we do not force 44.
 * ------------------------------------------------------------------------- */
const sizeBox: Record<IconButtonSize, string> = {
  sm: "size-[32px]",
  md: "size-[40px]",
};

/** Icon box ~= footprint * 0.5 (sm 16, md 18). */
const iconBox: Record<IconButtonSize, string> = {
  sm: "size-[16px]",
  md: "size-[18px]",
};

/** Default / hover / disabled per variant — Figma states are CSS states. */
const variantColors: Record<IconButtonVariant, string> = {
  subtle: cn(
    "bg-[var(--bg-subtle)] text-[var(--text-primary)]",
    "hover:bg-[var(--bg-accent-subtle)]",
    "disabled:bg-[var(--bg-subtle)] disabled:text-[var(--text-muted)]",
  ),
  ghost: cn(
    "bg-transparent text-[var(--text-primary)]",
    "hover:bg-[var(--bg-subtle)]",
    "disabled:text-[var(--text-muted)]",
  ),
  accent: cn(
    "bg-[var(--bg-accent-strong)] text-[var(--text-on-accent)]",
    "hover:bg-[var(--bg-accent-hover)]",
    "disabled:bg-[var(--bg-subtle)] disabled:text-[var(--text-muted)]",
  ),
};

const baseClasses = cn(
  "relative inline-flex shrink-0 select-none items-center justify-center",
  "rounded-[var(--radius-pill)] align-middle",
  "transition-colors disabled:cursor-not-allowed",
  // Focus is visible ONLY for keyboard users, AA-compliant 2px ring (design law).
  "outline-none",
  "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]",
);

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * IconButton — the ReadEasily icon-only, circular action primitive.
 *
 * Used for toolbar utilities (Navbar mobile actions, Modal close) where Button's
 * label-first model does not fit. Semantic `<button type="button">`; reads only
 * semantic tokens, so it is theme-agnostic. Default/hover/disabled are CSS
 * states; `loading`, `variant` and `size` mirror a Figma variant model.
 *
 * `aria-label` is REQUIRED — an icon-only control has no visible text.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant = "subtle",
      size = "md",
      icon,
      loading = false,
      type,
      disabled,
      className,
      onClick,
      ...rest
    },
    ref,
  ) {
    if (process.env.NODE_ENV !== "production" && !rest["aria-label"]) {
      console.warn(
        "IconButton: an `aria-label` is required so screen readers can announce this icon-only button.",
      );
    }

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        disabled={disabled}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
        className={cn(
          baseClasses,
          sizeBox[size],
          variantColors[variant],
          loading && "pointer-events-none",
          className,
        )}
        onClick={(event) => {
          if (loading) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        {...rest}
      >
        {loading && (
          <span className="absolute inset-0 inline-flex items-center justify-center">
            <Spinner className={iconBox[size]} />
          </span>
        )}
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex items-center justify-center [&>svg]:size-full",
            iconBox[size],
            // opacity-0 (not `invisible`) keeps the footprint stable while the
            // spinner overlay shows; the accessible name lives on the button.
            loading && "opacity-0",
          )}
        >
          {icon}
        </span>
      </button>
    );
  },
);
