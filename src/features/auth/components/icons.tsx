/**
 * Auth-local glyphs. All decorative (`aria-hidden`, `focusable=false`), drawn on
 * a 24px grid with `currentColor` so they inherit the consumer's text color and
 * the icon-box sizing of Button / IconButton / FeatureRow. These are feature
 * wiring icons (back chevron, marketing bullets, the Landing feature tiles), not
 * design-system primitives — they live with the auth feature that uses them.
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

/** Chevron-left — the breadcrumb-back affordance. */
export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M15 18 9 12l6-6" />
    </Glyph>
  );
}

/** Arrow-right — the forward affordance on every auth CTA (Figma "every CTA carries an icon"). */
export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Glyph>
  );
}

/** Small check — the marketing-panel bullet marker. */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Glyph>
  );
}

/** Headphones — "Listen to classics". */
export function HeadphonesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <path d="M4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2v-2Z" />
      <path d="M20 14a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2Z" />
    </Glyph>
  );
}

/** Open book — "Read along". */
export function BookOpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M12 6c-1.8-1.2-4-1.6-6.5-1.2A1 1 0 0 0 4.7 5.8v11.4a1 1 0 0 0 1.1 1c2.3-.4 4.4 0 6.2 1.2 1.8-1.2 3.9-1.6 6.2-1.2a1 1 0 0 0 1.1-1V5.8a1 1 0 0 0-.8-1C16 4.4 13.8 4.8 12 6Z" />
      <path d="M12 6v13" />
    </Glyph>
  );
}

/** Tap / pointer — "Tap any word". */
export function TapWordIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M9 11V6a2 2 0 1 1 4 0v5" />
      <path d="M13 11V8.5a1.8 1.8 0 0 1 3.5 0V12" />
      <path d="M16.5 11.5a1.7 1.7 0 0 1 3.3 0V15a5 5 0 0 1-5 5h-1.4a4 4 0 0 1-3-1.4l-3.2-3.7a1.7 1.7 0 0 1 2.5-2.3L9 14" />
    </Glyph>
  );
}
