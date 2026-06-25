import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

/**
 * SectionHeader — a titled section divider (Figma node 1261:3706).
 * A 5px accent marker bar + a Heading/H2 label. Used to head a content section
 * (e.g. Search results groups) and reusable on future screens.
 *
 * NOTE: the Library feature has a similar inline marker inside CategoryRail.
 * This is the standalone, shared version; Library is intentionally left
 * untouched and can adopt this later.
 *
 * A11y: renders a REAL heading element (default `<h2>`, overridable via `as`)
 * so it participates in the document outline. The marker bar is decorative
 * (`aria-hidden`) — only the text carries meaning.
 */

export type SectionHeaderHeading = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface SectionHeaderProps
  extends Omit<HTMLAttributes<HTMLHeadingElement>, "title"> {
  /** The section title text. */
  title: ReactNode;
  /** Heading level. Defaults to `h2` to match the Figma Heading/H2 style. */
  as?: SectionHeaderHeading;
}

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const SectionHeader = forwardRef<HTMLHeadingElement, SectionHeaderProps>(
  function SectionHeader({ title, as: Heading = "h2", className, ...rest }, ref) {
    return (
      <Heading
        ref={ref}
        className={cn("flex items-center gap-md", className)}
        {...rest}
      >
        {/* 5px accent marker — full text height, decorative. rounded-pill clamps
            to ~2.5px on the 5px axis, matching the Figma 3px corner. */}
        <span
          aria-hidden="true"
          className="w-[5px] self-stretch shrink-0 rounded-pill bg-accent"
        />
        {/* Heading/H2: Baloo Bold 28/36, tracking -0.14px (Figma-correct, a
            px-vs-% misread corrected from -0.5px). Size + line-height bind via
            `text-heading-h2`; tracking + family/weight/color are token-bound. */}
        <span className="font-display font-bold text-primary text-heading-h2 tracking-[var(--text-heading-h2-tracking)]">
          {title}
        </span>
      </Heading>
    );
  },
);

SectionHeader.displayName = "SectionHeader";
