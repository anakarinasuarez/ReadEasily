import { cx } from "@/lib/utils/cx";

/**
 * Logo — the canonical ReadEasily brand mark + wordmark.
 *
 * The single source of truth for the open-book mark (rotated ~13°) and the
 * "Read"(primary)/"Easily"(accent) wordmark. Previously byte-duplicated inside
 * `components/navbar` (`BookMark`/`NavbarLogo`) and `features/auth` (`BrandLogo`);
 * both now compose THIS primitive so the mark renders pixel-identically
 * everywhere (Navbar · auth shell · Landing).
 *
 * PURELY PRESENTATIONAL and intentionally NAMELESS to assistive tech — the mark
 * and wordmark are both `aria-hidden`, and this component adds no `role`/`aria`
 * wrapper of its own. Consumers own the accessible name:
 *   - Navbar wraps it in `<a aria-label="ReadEasily home">`.
 *   - the auth `BrandLogo` wraps it in `<span role="img" aria-label="ReadEasily">`.
 *
 * Lives in `src/ui` (a shared primitive consumed by both `components` and
 * `features`); reads only semantic tokens, never `@/features`/`@/stores`.
 */
export interface LogoProps {
  /**
   * Visual scale:
   *   - `"md"` (default) → responsive 14→19px wordmark, 33×29→40×32 mark
   *     (the Navbar + auth-shell brand).
   *   - `"lg"`           → H3-sized wordmark, fixed 40×32 mark (the Landing).
   * Purely typographic/geometric; the ~13° tilt and token fills are identical.
   */
  size?: "md" | "lg";
  /** Extra classes for the outer wrapper (e.g. spacing). */
  className?: string;
}

/** Book-mark dimensions per scale. */
const MARK_SIZE: Record<NonNullable<LogoProps["size"]>, string> = {
  md: "block h-[29px] w-[33px] md:h-[32px] md:w-[40px]",
  lg: "block h-[32px] w-[40px]",
};

/** Wordmark type per scale (`leading-none` = the optical-centering fix). */
const WORDMARK_SIZE: Record<NonNullable<LogoProps["size"]>, string> = {
  md: "text-[14px] leading-none md:text-[19px]",
  lg: "text-[length:var(--text-heading-h3-size)] leading-none",
};

/**
 * Open-book brand mark. Token-bound fills (accent for depth) with low-opacity
 * page curves. Sized via className so the Logo can scale down on mobile; the
 * ~13° tilt is applied by the wrapper, not here.
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

/** Brand mark + "ReadEasily" wordmark. Nameless to AT — consumers label it. */
export function Logo({ size = "md", className }: LogoProps) {
  return (
    <span
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
