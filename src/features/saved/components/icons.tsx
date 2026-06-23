/**
 * Saved-local screen-wiring glyphs — the Navbar destination icons for this
 * feature's frame plus the breadcrumb / retry / empty marks. Decorative
 * (`aria-hidden`, `focusable=false`), drawn on a 24px grid with `currentColor`
 * so they inherit the surrounding text colour and icon-box sizing. They mirror
 * the Library/Search nav glyphs by design (the same three destinations) but live
 * with the feature that renders them, so Saved never reaches across feature
 * boundaries for a one-off icon.
 */
import type { SVGProps } from "react";

function Glyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  );
}

/** Open book — the Library nav destination. */
export function LibraryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M12 6c-1.8-1.2-4-1.6-6.5-1.2A1 1 0 0 0 4.7 5.8v11.4a1 1 0 0 0 1.1 1c2.3-.4 4.4 0 6.2 1.2 1.8-1.2 3.9-1.6 6.2-1.2a1 1 0 0 0 1.1-1V5.8a1 1 0 0 0-.8-1C16 4.4 13.8 4.8 12 6Z" />
      <path d="M12 6v13" />
    </Glyph>
  );
}

/** Magnifier — the Search nav destination. */
export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </Glyph>
  );
}

/** Bookmark — the Saved nav destination (this screen). */
export function SavedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-3.8L5.5 20V5.5a1 1 0 0 1 1-1Z" />
    </Glyph>
  );
}

/** Left chevron — the breadcrumb-back affordance (`‹ destination`). */
export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="m14.5 6-6 6 6 6" />
    </Glyph>
  );
}

/** Circular-arrow refresh — the error-state retry affordance. */
export function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M20 11a8 8 0 1 0-.6 4" />
      <path d="M20 5v6h-6" />
    </Glyph>
  );
}

/** Right arrow — the empty-state CTA mark (brand law: every CTA carries an icon). */
export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Glyph>
  );
}

/** Bookmark (filled-style outline) — the empty-state tile glyph. */
export function BookmarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-3.8L5.5 20V5.5a1 1 0 0 1 1-1Z" />
    </Glyph>
  );
}
