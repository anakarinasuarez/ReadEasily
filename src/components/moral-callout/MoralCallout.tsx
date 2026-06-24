import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

export interface MoralCalloutProps
  extends Omit<ComponentPropsWithoutRef<"section">, "children"> {
  /**
   * The moral body text. Provide either this or `children` (children wins when
   * both are given — `moral` is the simple single-string path).
   */
  moral?: string;
  /** Rich body content, used when a plain `moral` string is not enough. */
  children?: ReactNode;
  /** The uppercase eyebrow that labels the callout. Defaults to "The Moral". */
  label?: string;
  /** Extra classes merged onto the card. */
  className?: string;
}

/** Join class fragments, dropping falsy ones. */
function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * MoralCallout — the inline "moral of the story" card on Story Detail
 * (Figma node 26:2 desktop / 844:1152 mobile).
 *
 * It LOOKS like the Modal but is a STATIC, in-flow callout: a labelled region,
 * NOT a dialog. No focus trap, no `role="dialog"`, no overlay — it is purely
 * presentational. Semantics: a `<section>` named by its eyebrow via
 * `aria-labelledby`, so assistive tech announces a "The Moral" region without
 * inventing a heading in the page's outline. Reads only semantic tokens, so it
 * is theme-agnostic.
 */
export const MoralCallout = forwardRef<HTMLElement, MoralCalloutProps>(
  function MoralCallout(
    { moral, children, label = "The Moral", className, ...rest },
    ref,
  ) {
    const labelId = useId();
    const body = children ?? moral;

    return (
      <section
        ref={ref}
        aria-labelledby={labelId}
        className={cn(
          "flex flex-col gap-[var(--space-md)]",
          "rounded-[var(--radius-3xl)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)]",
          "p-[var(--space-2xl)]",
          className,
        )}
        {...rest}
      >
        {/* Eyebrow — Label/S, uppercase, accent. The region's accessible name. */}
        <p
          id={labelId}
          className={cn(
            "uppercase text-[color:var(--text-accent)]",
            "[font-family:var(--text-label-s-family)] [font-size:var(--text-label-s-size)]",
            "[font-weight:var(--text-label-s-weight)] [line-height:var(--text-label-s-line-height)]",
            "[letter-spacing:var(--text-label-s-tracking)]",
          )}
        >
          {label}
        </p>

        {/* Body — Reading/L, Lora Italic 20/32. */}
        <p
          className={cn(
            "italic text-[color:var(--text-primary)]",
            "[font-family:var(--text-reading-l-family)] [font-size:var(--text-reading-l-size)]",
            "[font-weight:var(--text-reading-l-weight)] [line-height:var(--text-reading-l-line-height)]",
          )}
        >
          {body}
        </p>
      </section>
    );
  },
);
