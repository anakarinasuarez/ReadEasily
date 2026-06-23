/**
 * Reader-local screen-wiring glyphs — breadcrumb chevron, page chevrons, the
 * language-toggle globe + caret. Decorative (`aria-hidden`, `focusable=false`),
 * drawn on a 24px grid with `currentColor` so they inherit the surrounding text
 * colour and icon-box sizing. They live with the feature that renders them.
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

/** Left chevron — breadcrumb-back + previous-page. */
export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="m14.5 6-6 6 6 6" />
    </Glyph>
  );
}

/** Right chevron — next-page. */
export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="m9.5 6 6 6-6 6" />
    </Glyph>
  );
}

/** Down caret — the language pill's "expandable" affordance. */
export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="m6 9.5 6 6 6-6" />
    </Glyph>
  );
}

/** Globe — the ESPAÑOL translation label + the ES language pill. */
export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
    </Glyph>
  );
}

/** Speaker — the audio-voice (US) pill mark. */
export function SpeakerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
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
