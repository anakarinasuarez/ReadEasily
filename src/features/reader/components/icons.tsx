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

/** UK (Union Jack) flag chip for the en-GB voice option. Decorative. */
export function UkFlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="2" y="5" width="20" height="14" rx="2" fill="#012169" />
      <path d="M2 5l20 14M22 5L2 19" stroke="#fff" strokeWidth="2.2" />
      <path d="M2 5l20 14M22 5L2 19" stroke="#c8102e" strokeWidth="1.1" />
      <path d="M12 5v14M2 12h20" stroke="#fff" strokeWidth="3.4" />
      <path d="M12 5v14M2 12h20" stroke="#c8102e" strokeWidth="1.8" />
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

/** Australian flag chip for the en-AU voice option. A simplified decorative
 *  glyph (blue field, Union canton, Commonwealth + Southern-Cross stars). */
export function AuFlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="2" y="5" width="20" height="14" rx="2" fill="#012169" />
      <path d="M2 5l9 6M11 5L2 11" stroke="#fff" strokeWidth="1.6" />
      <path d="M6.5 5v6M2 8h9" stroke="#fff" strokeWidth="2.2" />
      <path d="M6.5 5v6M2 8h9" stroke="#c8102e" strokeWidth="1.1" />
      <circle cx="6.5" cy="16" r="1.1" fill="#fff" />
      <circle cx="16" cy="9" r="0.9" fill="#fff" />
      <circle cx="18.5" cy="13" r="0.9" fill="#fff" />
      <circle cx="15" cy="15" r="0.9" fill="#fff" />
      <circle cx="18" cy="16.5" r="0.9" fill="#fff" />
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

/** Canadian flag chip for the en-CA voice option. A simplified decorative glyph
 *  (red bands + a central maple-leaf mark). */
export function CaFlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="2" y="5" width="20" height="14" rx="2" fill="#fff" />
      <rect x="2" y="5" width="5" height="14" fill="#d52b1e" />
      <rect x="17" y="5" width="5" height="14" fill="#d52b1e" />
      <path
        d="M12 8l.7 1.6 1.7-.5-.7 1.6 1.3.6-1.3.9.3 1.6-1.6-.7-1.6.7.3-1.6-1.3-.9 1.3-.6-.7-1.6 1.7.5L12 8z"
        fill="#d52b1e"
      />
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

/** Check mark — the selected row in the language / voice dropdown (Figma
 *  1154:3342). 16px, inherits `currentColor` (the row's feedback-info ink). */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph strokeWidth={2.2} {...props}>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </Glyph>
  );
}

/** Skip-to-start (⏮) — the "Read again" button glyph on the end-of-story card
 *  (Figma node 1058:1838). A left bar + a left-pointing solid triangle: restart
 *  the story from the top. Decorative; the button carries the label. */
export function RewindIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="5" y="5.5" width="2.4" height="13" rx="1" />
      <path d="M19 6.2v11.6a1 1 0 0 1-1.53.85l-8.5-5.8a1 1 0 0 1 0-1.7l8.5-5.8A1 1 0 0 1 19 6.2Z" />
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
