import type { ReactNode } from "react";
import { IconButton } from "@/ui/icon-button";
import { BrandLogo } from "../brand";
import { ChevronLeftIcon, CheckIcon } from "../icons";

export interface AuthLayoutProps {
  /**
   * Back affordance handler. When omitted, NO back control renders (e.g. the
   * top-level entry screen). Routing is the caller's job — this only fires the
   * callback (breadcrumb-back is wired at the screen layer).
   */
  onBack?: () => void;
  /** The auth card (form) slot, rendered in the right column. */
  children: ReactNode;
}

/* ---------------------------------------------------------------------------
 * Fixed marketing copy — shared verbatim across Log-in / Sign-up / Forgot so
 * the persistent panel never shifts between the three auth screens.
 * ------------------------------------------------------------------------- */
const EYEBROW = "THE SMARTER WAY TO LEARN ENGLISH";
const HEADLINE = "Read your way to fluent English.";
const SUB =
  "Stop struggling with drills and flashcards. Learn English through illustrated stories that stick.";
const BULLETS = [
  "Listen to every story in a clear native voice",
  "Tap any word for an instant translation",
  "Save words and practice them later",
  "Read at your own pace, one story at a time",
];
const ATTRIBUTION = "Illustrated short stories · real, everyday English.";

/** Eyebrow ramp — Meta (Baloo 2 Bold 13/18), uppercase + tracked. */
const eyebrowType =
  "font-display text-[length:var(--text-meta-size)] font-bold uppercase leading-[var(--text-meta-line-height)] tracking-[0.12em]";

/**
 * Decorative baked book illustration — low-opacity, `aria-hidden`. A simple
 * token-bound mark (open pages) that adds warmth to the panel without competing
 * with the copy. Kept inline (not a one-off primitive) since it is purely panel
 * ornament.
 */
function PanelDecoration() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 200 200"
      className="pointer-events-none absolute -right-6 bottom-0 h-[260px] w-[260px] text-on-accent opacity-[0.08]"
      fill="none"
    >
      <path
        d="M100 50c-14-9-31-12-50-9a6 6 0 0 0-5 6v88a6 6 0 0 0 7 6c17-3 33 0 48 9 15-9 31-12 48-9a6 6 0 0 0 7-6V47a6 6 0 0 0-5-6c-19-3-36 0-50 9Z"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path d="M100 50v100" stroke="currentColor" strokeWidth="4" />
      <path
        d="M58 74c12-2 24-1 33 4M58 94c12-2 24-1 33 4M142 74c-12-2-24-1-33 4M142 94c-12-2-24-1-33 4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Ghost text "‹ Back" for the desktop panel — white/on-accent over terracotta. */
function PanelBack({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className={[
        "inline-flex items-center gap-[var(--space-xs)] rounded-pill",
        "px-[var(--space-md)] py-[var(--space-sm)]",
        "font-display text-[length:var(--text-title-m-size)] font-bold leading-[var(--text-title-m-line-height)]",
        "text-on-accent transition-colors duration-200 ease-out motion-reduce:transition-none",
        "hover:bg-[color-mix(in_srgb,var(--text-on-accent)_14%,transparent)]",
        "outline-none focus-visible:[outline:2px_solid_var(--text-on-accent)] focus-visible:[outline-offset:2px]",
      ].join(" ")}
    >
      <span aria-hidden="true" className="inline-flex size-[18px] [&>svg]:size-full">
        <ChevronLeftIcon />
      </span>
      Back
    </button>
  );
}

/**
 * AuthLayout — the split shell shared by Log-in / Sign-up / Forgot (Figma
 * 79:139 desktop, 829:839 mobile).
 *
 * Desktop (≥md): two columns. LEFT is the persistent marketing panel (~640px,
 * `bg-accent-panel`, all copy in solid `text-on-accent`) with a 4px accent bar,
 * a low-opacity decorative book, the eyebrow/headline/sub, four bullets and a
 * footer attribution; a ghost "‹ Back" sits top-left over the panel. RIGHT holds
 * the BrandLogo top-left and the `children` card slot.
 *
 * Mobile (<md): the SAME panel collapses to a compact rounded band (eyebrow +
 * headline + sub only); a header row carries a back chevron IconButton + the
 * logo; the card fills the width below. This is a responsive variant of one
 * component, not a separate build.
 *
 * A11y: a real landmark structure — `<header>` (mobile), `<aside>`
 * (complementary panel), `<main>` (the form). The panel's headline is styled
 * copy (a `<p>`, not a heading) so the form card inside `children` owns the page
 * heading and there is no duplicate-/competing-heading. The decorative book and
 * accent bar are `aria-hidden`. Back renders only when `onBack` is supplied.
 *
 * Tokens (incl. the two new ones): panel `bg-accent-panel` + `text-on-accent`;
 * card radius `--radius-xl`; spacing scale throughout.
 */
export function AuthLayout({ onBack, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas md:flex-row">
      {/* MOBILE header row — back chevron + logo (hidden from md up). */}
      <header className="flex items-center gap-[var(--space-sm)] px-[var(--space-lg)] pt-[var(--space-lg)] md:hidden">
        {onBack && (
          <IconButton
            variant="ghost"
            aria-label="Back"
            icon={<ChevronLeftIcon />}
            onClick={onBack}
          />
        )}
        <BrandLogo />
      </header>

      {/* LEFT marketing panel — persistent on desktop, compact band on mobile. */}
      <aside
        aria-label="Why ReadEasily"
        className={[
          "relative isolate overflow-hidden bg-accent-panel text-on-accent",
          // Mobile: rounded band with margin; desktop: full-bleed fixed column.
          "mx-[var(--space-lg)] mt-[var(--space-lg)] rounded-[var(--radius-xl)] px-[var(--space-xl)] py-[var(--space-xl)]",
          "md:mx-0 md:mt-0 md:w-[640px] md:shrink-0 md:rounded-none",
          "md:flex md:flex-col md:px-[var(--space-3xl-plus)] md:py-[var(--space-3xl)]",
        ].join(" ")}
      >
        {/* 4px accent bar (decorative). */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 hidden h-full w-[4px] bg-accent-strong md:block"
        />
        <PanelDecoration />

        {/* Desktop back, over the panel. */}
        {onBack && (
          <div className="mb-[var(--space-2xl)] hidden md:block">
            <PanelBack onBack={onBack} />
          </div>
        )}

        <div className="relative md:my-auto md:max-w-[420px]">
          <p className={eyebrowType}>{EYEBROW}</p>
          <p className="mt-[var(--space-md)] font-display text-[length:var(--text-display-mobile-size)] font-extrabold leading-[var(--text-display-mobile-line-height)] tracking-[var(--text-display-mobile-tracking)] md:text-[length:var(--text-display-l-size)] md:leading-[var(--text-display-l-line-height)] md:tracking-[var(--text-display-l-tracking)]">
            {HEADLINE}
          </p>
          <p className="mt-[var(--space-md)] font-ui text-[length:var(--text-ui-l-size)] leading-[var(--text-ui-l-line-height)] text-on-accent">
            {SUB}
          </p>

          {/* Bullets + attribution — desktop only (the mobile band stays compact). */}
          <ul className="mt-[var(--space-2xl)] hidden list-none flex-col gap-[var(--space-md)] p-0 md:flex">
            {BULLETS.map((bullet) => (
              <li key={bullet} className="flex items-start gap-[var(--space-sm)]">
                <span
                  aria-hidden="true"
                  className="mt-[2px] inline-flex size-[20px] shrink-0 items-center justify-center [&>svg]:size-full"
                >
                  <CheckIcon />
                </span>
                <span className="font-ui text-[length:var(--text-ui-l-size)] leading-[var(--text-ui-l-line-height)]">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-[var(--space-2xl)] hidden font-ui text-[length:var(--text-ui-m-size)] leading-[var(--text-ui-m-line-height)] text-on-accent md:block">
          {ATTRIBUTION}
        </p>
      </aside>

      {/* RIGHT column — logo (desktop) + the card slot. */}
      <main className="flex flex-1 flex-col px-[var(--space-lg)] py-[var(--space-xl)] md:px-[var(--space-3xl)] md:py-[var(--space-2xl)]">
        <div className="mb-[var(--space-2xl)] hidden md:block">
          <BrandLogo />
        </div>
        <div className="flex w-full flex-1 items-center justify-center">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
