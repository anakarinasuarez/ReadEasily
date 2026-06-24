/**
 * Practice-local glyphs — the speaker, globe, refresh, bookmark, check and close
 * marks the overlay wires up. Decorative (`aria-hidden`, `focusable=false`),
 * drawn on a 24px grid with `currentColor` so they inherit the surrounding text
 * colour + icon-box sizing. They live with the feature that renders them; the
 * accessible name always comes from the control's `aria-label`/text, never here.
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

/** Speaker — pronounce the word / voice a sentence. */
export function SpeakerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
    </Glyph>
  );
}

/** Globe — the translation-language toggle. */
export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
    </Glyph>
  );
}

/** Circular-arrow refresh — "New sentences". */
export function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M20 11a8 8 0 1 0-.6 4" />
      <path d="M20 5v6h-6" />
    </Glyph>
  );
}

/** Outline bookmark — the "Save to practice later" mark. */
export function BookmarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph strokeWidth={2} {...props}>
      <path d="M6 4h12v16l-6-4-6 4V4Z" />
    </Glyph>
  );
}

/** Check — the "Saved to practice" confirmed mark. */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph strokeWidth={2.2} {...props}>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </Glyph>
  );
}

/** Close — the header dismiss mark. */
export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph strokeWidth={2} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Glyph>
  );
}
