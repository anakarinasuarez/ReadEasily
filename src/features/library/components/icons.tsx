/**
 * Library-local glyphs. All decorative (`aria-hidden`, `focusable=false`),
 * drawn on a 24px grid with `currentColor` so they inherit the consumer's text
 * color and the icon-box sizing of Navbar / Button. These are screen-wiring
 * icons (nav items + the hero CTA + the editor's-pick star), not design-system
 * primitives — they live with the feature that uses them.
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

/** Bookmark — the Saved nav destination. */
export function SavedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-3.8L5.5 20V5.5a1 1 0 0 1 1-1Z" />
    </Glyph>
  );
}

/** Headphones — the "Read & Listen" CTA leading icon (every CTA carries one). */
export function HeadphonesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" />
      <path d="M4.5 13.5a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0v-2a2 2 0 0 1 2-2Z" />
      <path d="M19.5 13.5a2 2 0 0 0-2 2v2a2 2 0 0 0 4 0v-2a2 2 0 0 0-2-2Z" />
    </Glyph>
  );
}

/** Speaker with sound waves — precedes the listen-time in the hero meta row. */
export function VolumeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M5 9.5h2.5L11 6.5v11L7.5 14.5H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" />
      <path d="M14.5 9.5a3.5 3.5 0 0 1 0 5" />
      <path d="M17 7a7 7 0 0 1 0 10" />
    </Glyph>
  );
}

/** Stacked text lines — precedes the word count in the hero meta row. */
export function WordsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M5 7h14" />
      <path d="M5 12h14" />
      <path d="M5 17h9" />
    </Glyph>
  );
}

/** Filled star — the editor's-pick badge mark. */
export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M12 3.2 14.6 8.5l5.9.86-4.25 4.14 1 5.86L12 16.6l-5.27 2.77 1-5.86L3.5 9.36l5.9-.86L12 3.2Z" />
    </svg>
  );
}
