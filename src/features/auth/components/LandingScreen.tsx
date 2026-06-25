"use client";

import { useRouter } from "next/navigation";
import { Fragment, useId } from "react";
import { Button } from "@/ui/button";
import { SegmentedControl } from "@/ui/segmented-control";
import { BgDecorations } from "@/components/bg-decorations";
import {
  usePreferences,
  useHydratePreferences,
  type Preferences,
} from "@/stores/preferences";
import { BrandLogo } from "./brand";
import { FeatureRow } from "./feature-row";
import { LandingShowcase, type LandingShowcaseItem } from "./landing-showcase";
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
 * 171:397; the showcase covers are the local catalog art (covers move to
 * Supabase Storage later — same contract).
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
 * Covers for the decorative LandingShowcase. The active cover starts on "The Ant
 * and the Grasshopper" (Figma); the rail shows the next four. The display is
 * `aria-hidden`, so the titles are source-of-truth only (rendered `alt=""`).
 */
const SHOWCASE_ITEMS: LandingShowcaseItem[] = [
  { coverSrc: "/covers/the-ant-grasshopper.webp", alt: "The Ant and the Grasshopper" },
  { coverSrc: "/covers/The-tortoise-and-the-hare.webp", alt: "The Tortoise and the Hare" },
  { coverSrc: "/covers/the-clever-crow.webp", alt: "The Clever Crow" },
  { coverSrc: "/covers/The-boy-who-cried-wolf.webp", alt: "The Boy Who Cried Wolf" },
  { coverSrc: "/covers/A-trip-mountains.webp", alt: "A Trip to the Mountains" },
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
  "font-display text-[length:var(--text-meta-size)] [font-weight:var(--text-meta-weight)] leading-[var(--text-meta-line-height)] tracking-[var(--text-meta-tracking)] uppercase text-accent-text";
// H1: display-mobile (32/40) on mobile, stepping up to display-xl (56/64) on md+.
const h1Type =
  "font-display [font-weight:var(--text-display-mobile-weight)] text-primary text-[length:var(--text-display-mobile-size)] leading-[var(--text-display-mobile-line-height)] tracking-[var(--text-display-mobile-tracking)] md:text-[length:var(--text-display-xl-size)] md:leading-[var(--text-display-xl-line-height)] md:tracking-[var(--text-display-xl-tracking)]";
// Body paragraph — Body/M (Lora 16/24), secondary ink.
const bodyType =
  "font-reading text-secondary text-[length:var(--text-body-m-size)] leading-[var(--text-body-m-line-height)]";
// "Translate to" label — Body/S-strong (Lora SemiBold 14/20), muted ink. No
// dedicated 14/20 reading token exists; dimensions borrow the ui-m token (14/20)
// with the reading family + semibold weight.
const translateLabelType =
  "font-reading font-semibold text-[length:var(--text-ui-m-size)] leading-[var(--text-ui-m-line-height)] text-muted";
// Helper line — Label/M (13/18, ls .13), muted ink.
const helperType =
  "font-ui text-[length:var(--text-label-m-size)] [font-weight:var(--text-label-m-weight)] leading-[var(--text-label-m-line-height)] tracking-[var(--text-label-m-tracking)] text-muted";
// Trust-bar fact — Label/M, muted ink.
const trustType =
  "font-ui text-[length:var(--text-label-m-size)] [font-weight:var(--text-label-m-weight)] leading-[var(--text-label-m-line-height)] tracking-[var(--text-label-m-tracking)] text-muted";

/** Trust-bar facts (· separators rendered as faint flex children). */
const TRUST_FACTS = [
  "10 fables",
  "4 levels (A1–B1)",
  "3 languages",
  "100% free",
] as const;

/**
 * LandingScreen — the guest-friendly marketing front door (Figma desktop
 * 171:361 / mobile 821:825).
 *
 * Header is the CENTERED brand mark (Figma-exact product decision) — there is no
 * "Log in" entry here; login is reached by direct URL / the future account
 * popup. Below it a two-column hero on md+ (a single 22px-rhythm text column left,
 * the decorative LandingShowcase right) collapses to one stacked column below md
 * with source order logo → eyebrow → h1 → body → showcase → features → translate
 * → helper → CTA (matching the mobile Figma). A trust bar closes the page.
 *
 * Client component because it (a) binds the translation-language SegmentedControl
 * to the persisted preferences store and (b) pushes to the reading home on the
 * CTA. The route shell stays a Server Component; this is the single client
 * boundary. `BgDecorations` paints the atmospheric backdrop behind everything.
 *
 * A11y: exactly one `h1` (the hero title, three forced lines via `block` spans);
 * the feature rows are `h3`, so a visually-hidden `h2` keeps heading order valid.
 * The language selector is the SegmentedControl radiogroup (labelled by the
 * "Translate to" text). BgDecorations + the LandingShowcase are `aria-hidden`
 * with no tab stops, so the tab order is language options → Start reading.
 */
export function LandingScreen() {
  const router = useRouter();

  // Show the user's persisted choices (post-mount; SSR-safe — see the store doc).
  useHydratePreferences();
  const translationLang = usePreferences((s) => s.translationLang);
  const reduceMotion = usePreferences((s) => s.reduceMotion);
  const setPreference = usePreferences((s) => s.setPreference);

  const languageLabelId = useId();

  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas">
      {/* Atmospheric backdrop — decorative, behind the content (aria-hidden). */}
      <BgDecorations />

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-[var(--space-lg-plus)] px-[var(--space-lg-plus)] pt-[var(--space-lg)] pb-[var(--space-xl)] md:gap-[var(--space-3xl)] md:px-[var(--space-3xl)] md:py-[var(--space-3xl)]">
        {/* Header — brand centered (Figma-exact); no Log in entry. */}
        <header className="flex justify-center">
          <BrandLogo size="lg" />
        </header>

        {/* Hero — three DOM blocks (intro / showcase / actions). Mobile stacks
            them in source order; md+ pins the showcase to a row-spanning right
            column, leaving intro + actions as one uniform 22px column on the left. */}
        <section className="grid flex-1 grid-cols-1 items-center gap-[var(--space-lg-plus)] md:grid-cols-[minmax(0,1fr)_396px] md:gap-x-[var(--space-3xl-plus)] md:gap-y-[var(--space-lg-plus)]">
          {/* Intro */}
          <div className="flex flex-col gap-[var(--space-lg-plus)] md:col-start-1 md:row-start-1">
            <p className={eyebrowType}>English through stories</p>
            <h1 className={h1Type}>
              <span className="block">Learn English,</span>{" "}
              <span className="block">
                <span className="text-accent-text">one fable</span> at a
              </span>{" "}
              <span className="block">time.</span>
            </h1>
            <p className={bodyType}>
              Beloved tales, read aloud. Follow the words on the page, tap any
              word for its meaning, and keep the ones you want to remember.
            </p>
          </div>

          {/* Decorative book display — auto-cycling, hidden from AT. */}
          <div className="flex justify-center md:col-start-2 md:row-span-2 md:row-start-1 md:self-center">
            <LandingShowcase
              items={SHOWCASE_ITEMS}
              autoAdvanceMs={3600}
              reduceMotion={reduceMotion}
              className="w-full max-w-[396px]"
            />
          </div>

          {/* Actions — features, language selector, helper, CTA (uniform 22px). */}
          <div className="flex flex-col gap-[var(--space-lg-plus)] md:col-start-1 md:row-start-2">
            {/* Features block — sr-only h2 keeps h1 → h2 → h3 order valid. */}
            <div>
              <h2 className="sr-only">What you can do with ReadEasily</h2>
              <ul className="flex list-none flex-col gap-[var(--space-md)]">
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
            </div>

            {/* Language selector — bound to the persisted preferences store. */}
            <div className="flex flex-wrap items-center gap-[var(--space-md)]">
              <span id={languageLabelId} className={translateLabelType}>
                Translate to
              </span>
              <SegmentedControl
                size="lg"
                options={LANGUAGE_OPTIONS}
                value={translationLang}
                onChange={(value) => setPreference("translationLang", value)}
                tone="info"
                aria-labelledby={languageLabelId}
              />
            </div>

            {/* Helper line — quiet muted glyph + Label/M copy. */}
            <p className={`flex items-center gap-[var(--space-xs)] ${helperType}`}>
              <span
                aria-hidden="true"
                className="inline-flex size-[15px] shrink-0 items-center justify-center text-muted [&>svg]:size-full"
              >
                <CheckIcon />
              </span>
              Pick your language while you read — switch any time.
            </p>

            {/* Primary CTA — into the reading home. Full-width on mobile. */}
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

        {/* Trust bar — left-aligned ~700px hairline above, dot-separated facts. */}
        <footer className="flex flex-col gap-[var(--space-lg-plus)]">
          <div className="w-full max-w-[700px] border-t border-default" />
          <div className="flex flex-wrap items-center gap-[var(--space-xl)]">
            {TRUST_FACTS.map((fact, i) => (
              <Fragment key={fact}>
                {i > 0 && (
                  <span aria-hidden="true" className="text-border-faint">
                    ·
                  </span>
                )}
                <span className={trustType}>{fact}</span>
              </Fragment>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}
