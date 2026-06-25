/**
 * Profile-local glyphs — the Navbar destinations, breadcrumb/header affordances,
 * the four stat-tile marks, the five settings-row marks, and the three
 * account-row marks. All decorative (`aria-hidden`, `focusable=false`), drawn on
 * a 24px grid with `currentColor` so they inherit the surrounding text colour
 * and icon-box sizing. They live with the feature that renders them so Profile
 * never reaches across feature boundaries for a one-off icon (same convention as
 * the Saved feature's icons).
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

/* --- Navbar destinations (mirror the Library/Search/Saved nav glyphs) ------ */

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

/* --- header affordances ---------------------------------------------------- */

/** Camera — the avatar "Change photo" badge. */
export function CameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M4 8.5h2.2l1.2-1.8h7.2l1.2 1.8H19a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" />
      <circle cx="11.5" cy="13" r="3" />
    </Glyph>
  );
}

/** Pencil — the inline "Edit name" affordance. */
export function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M14.5 5.5 18.5 9.5M4 20l1-4 10-10 3 3-10 10-4 1Z" />
    </Glyph>
  );
}

/** Check — confirm/save the inline name edit. */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Glyph>
  );
}

/** Cross — cancel/discard the inline name edit. */
export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Glyph>
  );
}

/** Door + arrow — Sign out (header button + account row). */
export function SignOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M9 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3" />
      <path d="M15 8l4 4-4 4M19 12H9" />
    </Glyph>
  );
}

/* --- stat-tile marks ------------------------------------------------------- */

/** Bookmark — Words saved. */
export function BookmarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-3.8L5.5 20V5.5a1 1 0 0 1 1-1Z" />
    </Glyph>
  );
}

/** Stacked cards — Practice sets. */
export function CardsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <rect x="6" y="7" width="13" height="12" rx="2" />
      <path d="M9 4h7a3 3 0 0 1 3 3v7" />
    </Glyph>
  );
}

/** Open book — In progress. */
export function BookOpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M12 6c-1.8-1.2-4-1.6-6.5-1.2A1 1 0 0 0 4.7 5.8v11.4a1 1 0 0 0 1.1 1c2.3-.4 4.4 0 6.2 1.2 1.8-1.2 3.9-1.6 6.2-1.2a1 1 0 0 0 1.1-1V5.8a1 1 0 0 0-.8-1C16 4.4 13.8 4.8 12 6Z" />
      <path d="M12 6v13" />
    </Glyph>
  );
}

/** Check circle — Finished. */
export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </Glyph>
  );
}

/* --- settings-row marks ---------------------------------------------------- */

/** Globe — Translation language. */
export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5a13 13 0 0 1 0 17 13 13 0 0 1 0-17Z" />
    </Glyph>
  );
}

/** Speaker + waves — Reading accent. */
export function VolumeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
      <path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11" />
    </Glyph>
  );
}

/** Play — Autoplay narration. */
export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </Glyph>
  );
}

/** Pointer/tap — Pronounce on tap. */
export function TapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M9 11V6a1.8 1.8 0 0 1 3.6 0v5" />
      <path d="M12.6 11V9.2a1.6 1.6 0 0 1 3.2 0V11" />
      <path d="M15.8 11v-.8a1.6 1.6 0 0 1 3.2 0V15a5 5 0 0 1-5 5h-1.4a4 4 0 0 1-3-1.4l-3.2-3.7a1.7 1.7 0 0 1 2.5-2.2L9 14V11" />
    </Glyph>
  );
}

/** Sparkles — Reduce motion. */
export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z" />
      <path d="M18 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
    </Glyph>
  );
}

/* --- account-row marks ----------------------------------------------------- */

/** Broom/reset — Reset learning data. */
export function ResetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M19.5 9A8 8 0 1 0 20 13" />
      <path d="M20 4v5h-5" />
    </Glyph>
  );
}

/** Trash — Delete account. */
export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M5 7h14M10 7V5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V7" />
      <path d="M6.5 7l.8 11.5a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L18 7" />
      <path d="M10 11v5M14 11v5" />
    </Glyph>
  );
}
