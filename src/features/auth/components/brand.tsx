/**
 * BrandLogo — the ReadEasily wordmark for the auth shell.
 *
 * The canonical brand mark currently lives PRIVATE inside `components/navbar`
 * (`BookMark` + `NavbarLogo`); it is not exported as a shared primitive. Rather
 * than reach into another composite or edit a shared file, this re-states the
 * exact same token-bound open-book paths so the auth screens stay visually 1:1
 * with the Navbar logo. See the report's "missing primitive" flag: a shared
 * `<Logo>`/`<Brand>` primitive should be extracted from Navbar and consumed in
 * both places.
 *
 * Non-interactive here (auth routing isn't wired yet): exposed to assistive tech
 * as a single labelled image so SR users hear "ReadEasily" once, while the mark
 * and wordmark are individually `aria-hidden`.
 */

/** Join class fragments, dropping falsy ones. */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Open-book brand mark — token-bound fills (accent for depth) with low-opacity
 * page curves. Identical geometry to the Navbar `BookMark`. The ~13° tilt is
 * applied by the wrapper, not here.
 */
function BookMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M3 5.5C7.8 4 12.4 4.3 17 6.6c1.1.5 1.8 1.6 1.8 2.8V28c0 .9-1 1.5-1.9 1.1-4.3-2.1-8.6-2.4-13.1-1.1C2.9 28.3 2 27.6 2 26.6V7.4C2 6.5 2.2 5.8 3 5.5Z"
        fill="var(--bg-accent)"
      />
      <path
        d="M37 5.5C32.2 4 27.6 4.3 23 6.6c-1.1.5-1.8 1.6-1.8 2.8V28c0 .9 1 1.5 1.9 1.1 4.3-2.1 8.6-2.4 13.1-1.1.9.3 1.8-.4 1.8-1.4V7.4C38 6.5 37.8 5.8 37 5.5Z"
        fill="var(--bg-accent-strong)"
      />
      <path
        d="M6.5 10.5c2.9 0 5.7.6 8.3 1.8M6.5 15c2.9 0 5.7.6 8.3 1.8M33.5 10.5c-2.9 0-5.7.6-8.3 1.8M33.5 15c-2.9 0-5.7.6-8.3 1.8"
        stroke="var(--text-on-accent)"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export interface BrandLogoProps {
  /** Extra classes for the outer wrapper (e.g. spacing). */
  className?: string;
  /**
   * Visual scale. `"md"` (default) matches the canonical Navbar brand
   * (responsive 14→19px wordmark, 33×29→40×32 mark) and is what the auth shell
   * uses. `"lg"` is the larger marketing brand from the Landing Figma
   * (22/30 wordmark, fixed 40×32 mark).
   */
  size?: "md" | "lg";
}

/** Book-mark dimensions per scale. */
const MARK_SIZE: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  md: "block h-[29px] w-[33px] md:h-[32px] md:w-[40px]",
  lg: "block h-[32px] w-[40px]",
};

/** Wordmark type per scale. */
const WORDMARK_SIZE: Record<NonNullable<BrandLogoProps["size"]>, string> = {
  md: "text-[14px] leading-[1.4] md:text-[19px]",
  lg: "text-[length:var(--text-heading-h3-size)] leading-[var(--text-heading-h3-line-height)]",
};

/** Brand mark + "ReadEasily" wordmark. */
export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  return (
    <span
      role="img"
      aria-label="ReadEasily"
      className={cx("inline-flex shrink-0 items-center gap-[7px]", className)}
    >
      <span aria-hidden="true" className="inline-flex rotate-[13deg]">
        <BookMark className={MARK_SIZE[size]} />
      </span>
      <span
        aria-hidden="true"
        className={cx(
          "font-display font-extrabold whitespace-nowrap",
          WORDMARK_SIZE[size],
        )}
      >
        <span className="text-primary">Read</span>
        <span className="text-accent-text">Easily</span>
      </span>
    </span>
  );
}
