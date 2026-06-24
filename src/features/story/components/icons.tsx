/**
 * Story-Detail-local glyphs. All decorative (`aria-hidden`, `focusable=false`),
 * drawn on a 24px grid with `currentColor` so they inherit the consumer's text
 * color and the icon-box sizing of Navbar / Button. These are screen-wiring
 * icons (nav items + the CTA + the breadcrumb + meta-row marks), not
 * design-system primitives — they live with the feature that uses them, matching
 * the established `features/<f>/components/icons.tsx` precedent.
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

/** Open book — the Library nav destination + the breadcrumb-back target. */
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

/** Bookmark — the Saved nav destination. */
export function SavedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-3.8L5.5 20V5.5a1 1 0 0 1 1-1Z" />
    </Glyph>
  );
}

/** Left chevron — the breadcrumb-back affordance (`‹ Library`). */
export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Glyph>
  );
}

/** Filled play triangle — the "Read & Listen" CTA leading icon. */
export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M8 5.6c0-.9 1-1.5 1.8-1l9 6.4c.7.5.7 1.5 0 2l-9 6.4c-.8.5-1.8-.1-1.8-1V5.6Z" />
    </svg>
  );
}

/** Stopwatch — precedes the read-time in the meta row. */
export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9.5V13l2.5 1.5M9.5 3.5h5" />
    </Glyph>
  );
}

/** Stacked text lines — precedes the word count in the meta row. */
export function WordsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M5 7h14" />
      <path d="M5 12h14" />
      <path d="M5 17h9" />
    </Glyph>
  );
}

/** Circular arrow — the error-state retry CTA. */
export function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3L20 9" />
      <path d="M20 4.5V9h-4.5" />
      <path d="M19.5 12a7.5 7.5 0 0 1-12.8 5.3L4 15" />
      <path d="M4 19.5V15h4.5" />
    </Glyph>
  );
}
