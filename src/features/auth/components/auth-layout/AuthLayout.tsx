import type { ReactNode } from "react";
import { IconButton } from "@/ui/icon-button";
import { BrandLogo } from "../brand";
import { ChevronLeftIcon } from "../icons";

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
 * the persistent panel never shifts between the three auth screens. Verbatim
 * from Figma node 542:649.
 * ------------------------------------------------------------------------- */
const EYEBROW = "THE SMARTER WAY TO LEARN ENGLISH";
const SUB_LINE_1 = "Stop struggling with drills and flashcards.";
const SUB_LINE_2 = "Learn English through illustrated stories that stick.";
const BULLETS = [
  "Expand your vocabulary 3x faster, in real context",
  "Train your ear with native-speaker audio narration",
  "Never forget words with smart spaced-repetition cards",
  "Build daily reading habits with streaks and progress",
];
const QUOTE_LINE_1 =
  "“To have another language is to possess a second soul.”";
const QUOTE_LINE_2 = "— Charlemagne";

/* ---------------------------------------------------------------------------
 * Type ramps (all token-bound).
 * ------------------------------------------------------------------------- */
/** Eyebrow — "Body/M-strong" (Lora SemiBold 16/24), no tracking. Mobile 12/24. */
const eyebrowType =
  "font-reading font-semibold text-on-accent text-[12px] leading-[24px] md:text-[length:var(--text-body-m-size)] md:leading-[var(--text-body-m-line-height)]";

/**
 * Headline — Baloo 2 ExtraBold (Display/XL 56/64/-1.12 desktop, Display/Mobile
 * 32/40/-0.32 mobile). Two-tone with a line break.
 */
const headlineType =
  "font-display font-extrabold text-[length:var(--text-display-mobile-size)] leading-[var(--text-display-mobile-line-height)] tracking-[var(--text-display-mobile-tracking)] md:text-[length:var(--text-display-xl-size)] md:leading-[var(--text-display-xl-line-height)] md:tracking-[var(--text-display-xl-tracking)]";

/**
 * Sub-copy — Lora Regular. MOBILE band: white (text-on-accent) 16/24 (Body/M).
 * DESKTOP: cocoa (text-primary) 20/28 (Body/L).
 */
const subType =
  "font-reading font-normal text-on-accent text-[length:var(--text-body-m-size)] leading-[var(--text-body-m-line-height)] md:text-primary md:text-[length:var(--text-body-l-size)] md:leading-[var(--text-body-l-line-height)]";

/** Bullet text — Lora Regular 16/24 (Body/M) in the off-white panel ink. */
const bulletType =
  "font-reading font-normal text-[length:var(--text-body-m-size)] leading-[var(--text-body-m-line-height)] text-[var(--text-on-panel-muted)]";

/** Footer quote — Lora SemiBold 16/24 in the 35% off-white panel ink. */
const quoteType =
  "font-reading font-semibold text-[length:var(--text-body-m-size)] leading-[var(--text-body-m-line-height)] text-[var(--text-on-panel-quote)]";

/**
 * Two-tone marketing headline (Figma 542:656). Line 1 "Read your way", line 2
 * "to fluent English." — the inks alternate primary/on-accent. A trailing space
 * after "way" keeps the accessible text reading "Read your way to fluent
 * English." across the line break.
 */
function PanelHeadline() {
  return (
    <p className={headlineType}>
      <span className="block">
        <span className="text-primary">Read your </span>
        <span className="text-on-accent">way </span>
      </span>
      <span className="block">
        <span className="text-on-accent">to fluent</span>
        <span className="text-primary"> English.</span>
      </span>
    </p>
  );
}

/**
 * Ghost "‹ Back" for the desktop panel — white/on-accent over terracotta, pinned
 * top-left over the panel so it never displaces the eyebrow (Figma F2).
 */
function PanelBack({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className={[
        "absolute left-[32px] top-[32px] z-10 hidden md:inline-flex",
        "items-center gap-[var(--space-xs)] rounded-pill px-[var(--space-lg)] py-[var(--space-md)]",
        "font-display text-[length:var(--text-heading-h4-size)] font-semibold leading-[var(--text-heading-h4-line-height)]",
        "text-on-accent transition-colors duration-200 ease-out motion-reduce:transition-none",
        "hover:bg-[color-mix(in_srgb,var(--text-on-accent)_14%,transparent)]",
        "outline-none focus-visible:[outline:2px_solid_var(--text-on-accent)] focus-visible:[outline-offset:2px]",
      ].join(" ")}
    >
      <span aria-hidden="true" className="inline-flex size-[16px] [&>svg]:size-full">
        <ChevronLeftIcon />
      </span>
      Back
    </button>
  );
}

/**
 * AuthLayout — the split shell shared by Log-in / Sign-up / Forgot (Figma
 * 542:649 desktop, mobile band variant).
 *
 * Desktop (≥md): two columns. LEFT is the persistent marketing panel
 * (`bg-accent` #d66c44, full-bleed) with a faint book illustration behind the
 * copy, a content column pinned at left 84 / top 160 (eyebrow → two-tone
 * headline → sub → divider+bullets) and a footer attribution quote near the
 * panel bottom; a ghost "‹ Back" sits top-left over the panel. RIGHT centers the
 * BrandLogo above the 480px card and the `children` card slot.
 *
 * Mobile (<md): the panel collapses to a compact rounded band (eyebrow +
 * headline + white sub only); a stacked header carries a back chevron
 * IconButton on row 1 and the logo on row 2; the card fills the width below.
 * This is a responsive variant of one component, not a separate build.
 *
 * A11y: real landmarks — `<header>` (mobile), `<aside>` (complementary panel),
 * `<main>` (the form). The panel headline is styled copy (`<p>`s, not headings)
 * so the form card inside `children` owns the page heading. The illustration,
 * accent bar and decorative inks are `aria-hidden`. Back renders only when
 * `onBack` is supplied.
 *
 * PRODUCT/AA NOTE: the panel is LITERAL Figma — bright `--bg-accent` with
 * white/off-white SMALL copy that fails AA 4.5:1. This is an accepted exception:
 * the panel is decorative marketing (only the large headline is contrast-gated,
 * and both inks clear the 3:1 large-text bar). The form card stays AA-compliant.
 * Do NOT darken the panel or recolor the small text to "fix" contrast.
 */
export function AuthLayout({ onBack, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas md:flex-row">
      {/* MOBILE header — STACK: back chevron (row 1) + logo (row 2). md:hidden. */}
      <header className="flex flex-col items-start gap-[var(--space-sm)] px-[var(--space-lg)] pt-[var(--space-lg)] md:hidden">
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
          "relative isolate overflow-hidden bg-accent",
          // Mobile: rounded band with margin + inset padding.
          "mx-[var(--space-lg)] mt-[var(--space-lg)] rounded-[var(--radius-sm)] px-[20px] py-[var(--space-xl)]",
          // Desktop: full-bleed fixed column, flex-col so the copy sits up top
          // (Figma insets) and the quote anchors to the bottom via mt-auto —
          // robust at any viewport height (no clipped quote on short screens).
          "md:mx-0 md:mt-0 md:w-[640px] md:shrink-0 md:rounded-none md:p-0 md:flex md:flex-col",
        ].join(" ")}
      >
        {/* Full-bleed decorative illustration BEHIND the copy. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative, fixed asset, no layout/LCP benefit from next/image */}
        <img
          src="/auth/marketing-panel.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full object-cover opacity-10 md:opacity-[0.08]"
        />

        {/* 4px full-height accent bar on the far left (effectively invisible). */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 hidden h-full w-[4px] bg-accent md:block"
        />

        {/* Desktop back, pinned over the panel (does not displace the eyebrow). */}
        {onBack && <PanelBack onBack={onBack} />}

        {/* Content column — flow; desktop adds the Figma left/top insets. */}
        <div className="relative flex flex-col gap-[24px] md:w-[473px] md:pl-[84px] md:pt-[160px]">
          <p className={eyebrowType}>{EYEBROW}</p>
          <PanelHeadline />
          <p className={subType}>
            {SUB_LINE_1}
            <br />
            {SUB_LINE_2}
          </p>

          {/* Divider + bullets — desktop only (the mobile band stays compact). */}
          <div className="hidden flex-col gap-[36px] md:flex">
            <span
              aria-hidden="true"
              className="h-[2px] w-[83px] bg-surface-subtle"
            />
            <ul className="flex list-none flex-col gap-[24px] p-0">
              {BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-center gap-[12px]">
                  <span
                    aria-hidden="true"
                    className="size-[6px] shrink-0 rounded-full bg-[var(--text-on-panel-muted)]"
                  />
                  <span className={bulletType}>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer attribution quote — desktop only, anchored to the panel bottom
            (mt-auto) so it's always visible regardless of viewport height. */}
        <p className={`hidden md:block md:mt-auto md:pb-[48px] md:pl-[61px] ${quoteType}`}>
          {QUOTE_LINE_1}
          <br />
          {QUOTE_LINE_2}
        </p>
      </aside>

      {/* RIGHT column — centered logo above the 480px card slot. */}
      <main className="flex flex-1 flex-col items-center justify-center px-[var(--space-lg)] py-[var(--space-xl)] md:px-[var(--space-3xl)] md:py-[var(--space-2xl)]">
        <div className="w-full max-w-[480px]">
          <div className="mb-[var(--space-2xl)] hidden justify-center md:flex">
            <BrandLogo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
