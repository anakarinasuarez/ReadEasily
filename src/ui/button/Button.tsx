import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Slot } from "@radix-ui/react-slot";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Maps 1:1 to the Figma `Variant` property. */
  variant?: ButtonVariant;
  /** Size + geometry + type ramp. Maps 1:1 to the Figma `Size` property. */
  size?: ButtonSize;
  /** Icon rendered before the label. Decorative — sized to the size's icon box. */
  leftIcon?: ReactNode;
  /** Icon rendered after the label. Decorative — sized to the size's icon box. */
  rightIcon?: ReactNode;
  /**
   * Replaces the label with a spinner, keeps width stable, sets `aria-busy`
   * and blocks interaction without applying the disabled styling.
   */
  loading?: boolean;
  /**
   * Render as a Radix `Slot`, merging props onto the single child element
   * (e.g. an `<a>`) instead of a `<button>`. In `asChild` mode the consumer
   * composes their own content — `leftIcon`/`rightIcon`/`loading` are ignored.
   */
  asChild?: boolean;
  /**
   * Required when the button has no visible text (icon-only). The Figma "every
   * CTA carries an icon" law still expects an accessible name for SR users.
   */
  "aria-label"?: string;
}

/** Join class fragments, dropping falsy ones. */
function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------------------------------------------------
 * Token-bound class maps. Every color / space / radius / font resolves to a
 * CSS custom property from src/tokens/*. The only literals are the geometry
 * the design system does not tokenize (min touch-target heights + icon boxes),
 * which match the Figma node 14:56 reference exactly.
 * ------------------------------------------------------------------------- */
const sizeGeometry: Record<ButtonSize, string> = {
  sm: "min-h-[36px] px-[var(--space-md)] py-[var(--space-sm)]",
  md: "min-h-[44px] px-[var(--space-lg)] py-[var(--space-md)]",
  lg: "min-h-[56px] px-[var(--space-xl)] py-[var(--space-lg)]",
};

const contentGap: Record<ButtonSize, string> = {
  sm: "gap-[var(--space-xs)]",
  md: "gap-[var(--space-sm)]",
  lg: "gap-[var(--space-sm)]",
};

/** SM→Meta (Bold 13/18), MD→Heading/H4 (SemiBold 16/26), LG→Title/M (Bold 16/22). */
const typeRamp: Record<ButtonSize, string> = {
  sm: "[font-family:var(--text-meta-family)] [font-size:var(--text-meta-size)] [font-weight:var(--text-meta-weight)] [line-height:var(--text-meta-line-height)] [letter-spacing:var(--text-meta-tracking)]",
  md: "[font-family:var(--text-heading-h4-family)] [font-size:var(--text-heading-h4-size)] [font-weight:var(--text-heading-h4-weight)] [line-height:var(--text-heading-h4-line-height)] [letter-spacing:var(--text-heading-h4-tracking)]",
  lg: "[font-family:var(--text-title-m-family)] [font-size:var(--text-title-m-size)] [font-weight:var(--text-title-m-weight)] [line-height:var(--text-title-m-line-height)] [letter-spacing:var(--text-title-m-tracking)]",
};

const iconBox: Record<ButtonSize, string> = {
  sm: "size-[14px]",
  md: "size-[16px]",
  lg: "size-[18px]",
};

/** Default / hover / disabled per variant — Figma states are CSS states. */
const variantColors: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-[var(--bg-accent-strong)] text-[var(--text-on-accent)]",
    "hover:bg-[var(--bg-accent-hover)]",
    "disabled:bg-[var(--bg-subtle)] disabled:text-[var(--text-muted)]",
  ),
  secondary: cn(
    "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)]",
    "hover:bg-[var(--bg-subtle)] hover:border-[var(--border-strong)]",
    "disabled:text-[var(--text-muted)]",
  ),
  ghost: cn(
    "bg-transparent text-[var(--text-accent)]",
    "hover:bg-[var(--bg-accent-subtle)]",
    "disabled:text-[var(--text-muted)]",
  ),
};

/** Spinner tracks text-on-accent on primary, the terracotta accent elsewhere. */
const spinnerColor: Record<ButtonVariant, string> = {
  primary: "text-[var(--text-on-accent)]",
  secondary: "text-[var(--text-accent)]",
  ghost: "text-[var(--text-accent)]",
};

const baseClasses = cn(
  "relative inline-flex select-none items-center justify-center",
  "rounded-[var(--radius-pill)] whitespace-nowrap align-middle",
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
 * Button — the ReadEasily CTA primitive (Figma component 14:56).
 *
 * Semantic `<button type="button">`; reads only semantic tokens, so it is
 * theme-agnostic. Default/hover/disabled are CSS states; `loading` and the
 * `variant`/`size` props mirror the Figma variant model.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading = false,
      asChild = false,
      type,
      disabled,
      className,
      children,
      onClick,
      ...rest
    },
    ref,
  ) {
    if (process.env.NODE_ENV !== "production") {
      const hasText =
        children !== undefined && children !== null && children !== false && children !== "";
      if (!hasText && !rest["aria-label"]) {
        console.warn(
          "Button: an icon-only button must be given an `aria-label` so screen readers can announce it.",
        );
      }
    }

    const rootClasses = cn(
      baseClasses,
      sizeGeometry[size],
      typeRamp[size],
      variantColors[variant],
      className,
    );

    // asChild: pass through to the consumer's element. They compose their own
    // content; we only project styling + a11y props.
    if (asChild) {
      return (
        <Slot ref={ref} className={rootClasses} {...rest}>
          {children}
        </Slot>
      );
    }

    const content = (
      <span
        className={cn(
          "inline-flex items-center justify-center",
          contentGap[size],
          // opacity-0 (not `invisible`) so the label stays in the a11y tree —
          // a loading button must keep its accessible name (WCAG 4.1.2) while
          // the spinner overlay shows and width stays stable.
          loading && "opacity-0",
        )}
      >
        {leftIcon != null && (
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex shrink-0 items-center justify-center [&>svg]:size-full",
              iconBox[size],
            )}
          >
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon != null && (
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex shrink-0 items-center justify-center [&>svg]:size-full",
              iconBox[size],
            )}
          >
            {rightIcon}
          </span>
        )}
      </span>
    );

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        disabled={disabled}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
        className={cn(rootClasses, loading && "pointer-events-none")}
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
            <Spinner className={cn(iconBox[size], spinnerColor[variant])} />
          </span>
        )}
        {content}
      </button>
    );
  },
);
