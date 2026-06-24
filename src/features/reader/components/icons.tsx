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

/** Waveform — the decorative terracotta accent beside the reader title (Figma
 *  title row 125:159 → glyph 125:161). Purely visual; playback lives in the
 *  PlayerBar, so this is always `aria-hidden`. */
export function AudioWaveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph strokeWidth={2} {...props}>
      <path d="M4 12h0M8 8v8M12 5v14M16 8v8M20 12h0" />
    </Glyph>
  );
}

/** Sparkle / "+" — the 12px leading glyph on the tap-a-word hint (Figma 125:199).
 *  Decorative accent only. */
export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M12 3c.5 3.6 1.4 4.5 5 5-3.6.5-4.5 1.4-5 5-.5-3.6-1.4-4.5-5-5 3.6-.5 4.5-1.4 5-5Z" />
    </svg>
  );
}

/** US flag — the audio-voice (US) pill mark (Figma 1159:3382). A simplified
 *  decorative glyph (canton + stripes), not a stroke icon. Always `aria-hidden`. */
export function UsFlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="2" y="5" width="20" height="14" rx="2" fill="#fff" />
      <path
        d="M2 7.5h20M2 10h20M2 12.5h20M2 15h20M2 17.5h20"
        stroke="#c8102e"
        strokeWidth="1.4"
      />
      <rect x="2" y="5" width="9" height="7" rx="1" fill="#3c3b6e" />
      <rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="2"
        stroke="var(--border-default)"
        strokeWidth="1"
      />
    </svg>
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
