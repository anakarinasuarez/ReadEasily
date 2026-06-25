"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { Button } from "@/ui/button";
import { SegmentedControl } from "@/ui/segmented-control";
import { BookShowcase, type BookShowcaseItem } from "@/components/book-showcase";
import {
  usePreferences,
  useHydratePreferences,
  type Preferences,
} from "@/stores/preferences";
import { BrandLogo } from "./brand";
import { FeatureRow } from "./feature-row";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  HeadphonesIcon,
  TapWordIcon,
} from "./icons";
import { READING_HOME } from "../lib/routes";

/* ---------------------------------------------------------------------------
 * Static content — the marketing copy is fixed (no backend contract for the
 * Landing). The three feature rows mirror Figma nodes 171:378 / 171:387 /
 * 171:397; the showcase covers are the local catalog art also used by the
 * Library FeaturedHero (covers move to Supabase Storage later — same contract).
 * ------------------------------------------------------------------------- */

/** The three marketing feature rows (icon + title + supporting line). */
const FEATURES = [
  {
    icon: <HeadphonesIcon />,
    title: "Listen to classics",
    description: "Warm narration of timeless fables.",
  },
  {
    icon: <BookOpenIcon />,
    title: "Read along",
    description: "Words light up as you hear them.",
  },
  {
    icon: <TapWordIcon />,
    title: "Tap any word",
    description: "Instant translation, saved to review.",
  },
] as const;

/**
 * Decorative covers fanned by the Book Showcase. The Landing fan is purely
 * presentational marketing art (region hidden from AT, no selection offered),
 * so each item carries an empty `alt` — the real catalog lives behind the CTA.
 */
const SHOWCASE_ITEMS: BookShowcaseItem[] = [
  { coverSrc: "/covers/the-ant-grasshopper.webp", alt: "" },
  { coverSrc: "/covers/The-tortoise-and-the-hare.webp", alt: "" },
  { coverSrc: "/covers/the-clever-crow.webp", alt: "" },
  { coverSrc: "/covers/The-boy-who-cried-wolf.webp", alt: "" },
  { coverSrc: "/covers/A-trip-mountains.webp", alt: "" },
];

/** Translation-language options — labels match Figma, values bind the store. */
const LANGUAGE_OPTIONS: {
  value: Preferences["translationLang"];
  label: string;
}[] = [
  { value: "ES", label: "Spanish" },
  { value: "FR", label: "Français" },
  { value: "PT", label: "Português" },
];

/* Token-bound type ramps reused across the hero copy. */
const eyebrowType =
  "font-display text-[length:var(--text-meta-size)] [font-weight:var(--text-meta-weight)] leading-[var(--text-meta-line-height)] tracking-[var(--text-meta-tracking)] uppercase text-accent";
const h1Type =
  "font-display font-extrabold text-primary text-[length:var(--text-display-mobile-size)] leading-[var(--text-display-mobile-line-height)] tracking-[var(--text-display-mobile-tracking)] md:text-[length:var(--text-display-l-size)] md:leading-[var(--text-display-l-line-height)] md:tracking-[var(--text-display-l-tracking)]";
const bodyType =
  "font-reading text-secondary text-[length:var(--text-body-l-size)] leading-[var(--text-body-l-line-height)]";
const helperType =
  "font-ui text-[length:var(--text-ui-m-size)] leading-[var(--text-ui-m-line-height)] text-muted";
const trustType =
  "font-ui text-[length:var(--text-label-m-size)] [font-weight:var(--text-label-m-weight)] leading-[var(--text-label-m-line-height)] tracking-[var(--text-label-m-tracking)] text-muted";
const loginLinkType =
  "font-ui text-[length:var(--text-ui-m-size)] font-semibold leading-[var(--text-ui-m-line-height)] text-secondary underline-offset-2 hover:text-primary hover:underline rounded-[var(--radius-sm)] outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]";

/**
 * LandingScreen — the guest-friendly marketing front door (Figma desktop
 * 171:361 / mobile 821:825), mounted at `/welcome` for now (it moves to `/` in
 * the later route-swap phase).
 *
 * It is a client component because it (a) binds the translation-language
 * SegmentedControl to the persisted preferences store and (b) pushes to the
 * reading home on the CTA. The route shell (`/welcome/page.tsx`) stays a Server
 * Component; this is the single client boundary.
 *
 * Layout is ONE responsive component (no separate mobile build): a 2-column
 * grid on `md+` (text column left, Book Showcase right, ~60px gap) that
 * collapses to a single stacked column below `md`. The grid is intentionally
 * three DOM blocks — intro / showcase / actions — so the mobile source order is
 * exactly intro → showcase → actions (matching the mobile Figma) while desktop
 * pins the showcase to a row-spanning right column via explicit grid placement.
 *
 * A11y: exactly one `h1` (the hero title); the feature rows are `h3`, so a
 * visually-hidden `h2` sits above them to keep the heading order valid. The
 * language selector is the SegmentedControl radiogroup (labelled by the
 * "Translate to" text). The decorative cover fan is `aria-hidden` (the host
 * copy carries the real information), so it adds no tab stops — the tab order
 * is Log in → language options → Start reading.
 */
export function LandingScreen() {
  const router = useRouter();

  // Show the user's persisted language choice (post-mount; SSR-safe — see the
  // preferences store doc). Read + write go through the same store.
  useHydratePreferences();
  const translationLang = usePreferences((s) => s.translationLang);
  const setPreference = usePreferences((s) => s.setPreference);

  const languageLabelId = useId();

  return (
    <main className="min-h-screen bg-canvas">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[var(--space-3xl)] px-[var(--space-xl)] py-[var(--space-2xl)] md:px-[var(--space-3xl)] md:py-[var(--space-3xl)]">
        {/* Header — brand left, the auth entry point (Log in) right. */}
        <header className="flex items-center justify-between gap-[var(--space-lg)]">
          <BrandLogo />
          <Link href="/login" className={loginLinkType}>
            Log in
          </Link>
        </header>

        {/* Hero — three blocks: intro / showcase / actions. The grid pins the
            showcase to a row-spanning right column on md+; below md the blocks
            stack in source order (intro → showcase → actions). */}
        <section className="grid flex-1 grid-cols-1 items-start gap-[var(--space-2xl)] md:grid-cols-[minmax(0,1fr)_396px] md:gap-x-[var(--space-3xl-plus)]">
          {/* Intro */}
          <div className="flex flex-col gap-[var(--space-lg)] md:col-start-1 md:row-start-1">
            <p className={eyebrowType}>English through stories</p>
            <h1 className={h1Type}>
              Learn English, <span className="text-accent">one fable</span> at a
              time.
            </h1>
            <p className={bodyType}>
              Beloved tales, read aloud. Follow the words on the page, tap any
              word for its meaning, and keep the ones you want to remember.
            </p>
          </div>

          {/* Book Showcase — decorative marketing fan, auto-cycling ~3600ms. */}
          <div className="flex justify-center md:col-start-2 md:row-span-2 md:self-center">
            <BookShowcase
              decorative
              items={SHOWCASE_ITEMS}
              autoAdvanceMs={3600}
              className="w-full max-w-[396px]"
            />
          </div>

          {/* Actions — features, language selector, helper, CTA. */}
          <div className="flex flex-col gap-[var(--space-xl)] md:col-start-1 md:row-start-2">
            {/* Visually-hidden section heading keeps h1 → h2 → h3 order valid. */}
            <h2 className="sr-only">What you can do with ReadEasily</h2>
            <ul className="flex list-none flex-col gap-[var(--space-lg)]">
              {FEATURES.map((feature) => (
                <li key={feature.title}>
                  <FeatureRow
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                </li>
              ))}
            </ul>

            {/* Language selector — bound to the persisted preferences store. */}
            <div className="flex flex-col gap-[var(--space-sm)]">
              <div className="flex flex-wrap items-center gap-[var(--space-md)]">
                <span
                  id={languageLabelId}
                  className="font-ui text-[length:var(--text-ui-m-size)] font-semibold leading-[var(--text-ui-m-line-height)] text-primary"
                >
                  Translate to
                </span>
                <SegmentedControl
                  options={LANGUAGE_OPTIONS}
                  value={translationLang}
                  onChange={(value) => setPreference("translationLang", value)}
                  tone="info"
                  aria-labelledby={languageLabelId}
                />
              </div>
              <p className={`flex items-center gap-[var(--space-xs)] ${helperType}`}>
                <span
                  aria-hidden="true"
                  className="inline-flex size-[16px] shrink-0 items-center justify-center text-[var(--feedback-success)] [&>svg]:size-full"
                >
                  <CheckIcon />
                </span>
                Pick your language while you read — switch any time.
              </p>
            </div>

            {/* Primary CTA — into the reading home. Full-width on mobile, sized
                to content (self-start) on desktop. */}
            <Button
              type="button"
              size="lg"
              rightIcon={<ArrowRightIcon />}
              onClick={() => router.push(READING_HOME)}
              className="w-full md:w-auto md:self-start"
            >
              Start reading
            </Button>
          </div>
        </section>

        {/* Trust bar — hairline divider above, dot-separated facts. */}
        <div className="border-t border-default pt-[var(--space-lg)]">
          <p className={trustType}>
            10 fables <span aria-hidden="true">·</span> 4 levels (A1–B1){" "}
            <span aria-hidden="true">·</span> 3 languages{" "}
            <span aria-hidden="true">·</span> 100% free
          </p>
        </div>
      </div>
    </main>
  );
}
