import { Logo } from "@/ui/logo";

/**
 * BrandLogo — the ReadEasily wordmark for the auth shell + Landing.
 *
 * A thin wrapper over the shared `<Logo>` primitive (`src/ui/logo`): the mark
 * and wordmark now live there once (previously duplicated here and in the
 * Navbar). This wrapper's only job is to expose the brand to assistive tech as a
 * single labelled image — SR users hear "ReadEasily" once, while the underlying
 * mark and wordmark are individually `aria-hidden`.
 */
export interface BrandLogoProps {
  /** Extra classes for the outer wrapper (e.g. spacing). */
  className?: string;
  /**
   * Visual scale. `"md"` (default) matches the canonical Navbar brand
   * (responsive 14→19px wordmark, 33×29→40×32 mark) and is what the auth shell
   * uses. `"lg"` is the larger marketing brand from the Landing Figma
   * (H3 wordmark, fixed 40×32 mark).
   */
  size?: "md" | "lg";
}

/** Brand mark + "ReadEasily" wordmark, exposed as one labelled image. */
export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  return (
    <span role="img" aria-label="ReadEasily">
      <Logo size={size} className={className} />
    </span>
  );
}
