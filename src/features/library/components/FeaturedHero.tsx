"use client";

import { useState } from "react";
import Link from "next/link";
import { BookShowcase } from "@/components/book-showcase";
import type { ActiveChangeSource } from "@/components/book-showcase";
import { Button } from "@/ui/button";
import type { FeaturedBook } from "../types";
import { HeadphonesIcon, StarIcon, VolumeIcon, WordsIcon } from "./icons";

/**
 * FeaturedHero — the centered hero atop the Library landing (Figma node
 * 1272:4575). A circular, auto-rotating cover-flow of SEVERAL distinct featured
 * stories over a copy block that always describes the CENTERED story: per-story
 * eyebrow + optional editor's-pick badge, title, teaser, a meta row (level ·
 * listen-time · word count), and the "Read & Listen" CTA into the reader.
 *
 * Motion + a11y (WCAG 2.2.2): the fan auto-rotates step-and-rest, but this host
 * owns `playing` and pauses rotation while the WHOLE hero is hovered or holds
 * focus (so reaching for the CTA pauses it). A visible Pause/Play toggle (in the
 * carousel) gives touch users an explicit control. ANY user navigation (dot /
 * arrow / side-cover) hard-stops auto and flips the toggle to "Play". The polite
 * live region announces ONLY user-initiated selections — never an auto step.
 *
 * The centred story drives all copy + the CTA href; title/teaser reserve two-line
 * min-heights so an auto-step never reflows the CTA or changes the hero height.
 */
export function FeaturedHero({ featured }: { featured: FeaturedBook[] }) {
  // Start centred on the middle story to mirror BookShowcase's symmetric fan.
  const [active, setActive] = useState(() => Math.floor(featured.length / 2));
  // Auto-rotation play state (the visible toggle reflects this). Default on.
  const [playing, setPlaying] = useState(true);
  // Hover/focus over the whole hero section pauses rotation without stopping it.
  const [intentPaused, setIntentPaused] = useState(false);
  // Live-region text — set ONLY on user-initiated changes (never auto), so SR
  // users are not interrupted by the timer. Empty at mount (no announcement).
  const [liveText, setLiveText] = useState("");

  // Empty fan: nothing to feature. Render nothing rather than indexing into an
  // empty array (the brief's safe case; the catalog's empty state lives in the
  // rails area, not the hero).
  if (featured.length === 0) return null;

  // Clamp defensively so a shrunk array never indexes out of range.
  const current = featured[Math.min(active, featured.length - 1)];

  const items = featured.map((book) => ({
    coverSrc: book.coverSrc,
    alt: book.title,
    href: book.href,
  }));

  const handleActiveChange = (index: number, source: ActiveChangeSource) => {
    setActive(index);
    if (source === "user") {
      // Hard-stop auto on any user navigation; flip the toggle to "Play".
      setPlaying(false);
      // Announce the user's selection (only user changes reach the live region).
      const story = featured[index];
      setLiveText(`${story.title}, ${index + 1} of ${featured.length}`);
    }
  };

  // Pause/focus intent over the WHOLE hero (fan + copy + CTA), not just the fan.
  const handleSectionBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIntentPaused(false);
    }
  };

  return (
    <section
      aria-labelledby="featured-title"
      className="flex w-full flex-col items-center"
      onMouseEnter={() => setIntentPaused(true)}
      onMouseLeave={() => setIntentPaused(false)}
      onFocus={() => setIntentPaused(true)}
      onBlur={handleSectionBlur}
    >
      <BookShowcase
        items={items}
        activeIndex={active}
        onActiveChange={handleActiveChange}
        autoAdvance={playing}
        paused={intentPaused}
        playing={playing}
        onTogglePlay={() => setPlaying((p) => !p)}
        label="Featured stories"
      />

      {/* Polite announcement — updated only on user-initiated selection. */}
      <p aria-live="polite" className="sr-only">
        {liveText}
      </p>

      {/* Copy block — keyed by the centred story so it cross-fades (morph) in
          sync with each step; instant under reduced-motion (re-fade-in is
          gated on prefers-reduced-motion). */}
      <div
        key={current.id}
        className="re-fade-in flex w-full max-w-2xl flex-col items-center gap-md text-center"
      >
        {/* Eyebrow row: per-story section label + optional editor's-pick badge. */}
        <div className="flex min-h-[24px] items-center gap-sm">
          {/* Eyebrow — Baloo 2 Bold, uppercase, AA-safe terracotta (--text-accent).
              Per-story because the fan mixes categories. */}
          <span className="font-display font-bold uppercase text-accent-text [font-size:var(--text-label-s-size)] [line-height:var(--text-label-s-line-height)] [letter-spacing:var(--text-label-s-tracking)]">
            {current.eyebrow}
          </span>
          {/* Editor's-pick badge — Figma renders this green-on-white (forest
              success + star on the elevated surface), the same "recommended"
              language as the green active carousel dot. Rendered only when the
              centered story carries a badge label. */}
          {current.badgeLabel && (
            <span className="inline-flex items-center gap-xs rounded-pill bg-surface-elevated px-md py-sm font-ui font-semibold text-success text-label-m tracking-[var(--text-label-m-tracking)] shadow-sm">
              <span
                aria-hidden="true"
                className="inline-flex size-[14px] shrink-0 items-center justify-center [&>svg]:size-full"
              >
                <StarIcon />
              </span>
              {current.badgeLabel}
            </span>
          )}
        </div>

        {/* Title + teaser reserve min-heights (TWO lines each) so swapping to a
            longer, wrapping story does not reflow the CTA / change the hero
            height (preserve scroll, no layout jump). */}
        <h1
          id="featured-title"
          className="flex min-h-[calc(2*var(--text-display-l-line-height))] items-center justify-center font-display font-extrabold text-primary [font-size:var(--text-display-l-size)] [line-height:var(--text-display-l-line-height)] [letter-spacing:var(--text-display-l-tracking)]"
        >
          {current.title}
        </h1>

        <p className="flex min-h-[calc(2*var(--text-body-l-line-height))] items-center justify-center font-reading text-muted [font-size:var(--text-body-l-size)] [line-height:var(--text-body-l-line-height)]">
          {current.teaser}
        </p>

        {/* Meta row — three icon+label groups (level dot · listen-time · words),
            Baloo Bold, spaced by a gap (no inter-group bullets). The level group
            reads in `text-secondary`; the listen/words groups in `text-muted`. */}
        <div className="flex min-h-[18px] flex-wrap items-center justify-center gap-lg font-display font-bold text-label-m tracking-[var(--text-label-m-tracking)]">
          <span className="inline-flex items-center gap-xs text-secondary">
            <span
              aria-hidden="true"
              className="size-[10px] shrink-0 rounded-pill bg-info"
            />
            {current.level} · {current.levelLabel}
          </span>
          <span className="inline-flex items-center gap-xs text-muted">
            <span
              aria-hidden="true"
              className="inline-flex size-[18px] shrink-0 items-center justify-center [&>svg]:size-full"
            >
              <VolumeIcon />
            </span>
            {current.minutes} min
          </span>
          <span className="inline-flex items-center gap-xs text-muted">
            <span
              aria-hidden="true"
              className="inline-flex size-[18px] shrink-0 items-center justify-center [&>svg]:size-full"
            >
              <WordsIcon />
            </span>
            {current.words} words
          </span>
        </div>

        {/* CTA — every CTA carries an icon (brand law). asChild renders the
            anchor so it is a real link into the reader for the CENTERED story;
            we compose the icon + label ourselves since asChild bypasses
            leftIcon. */}
        <Button asChild variant="primary" size="lg" className="mt-sm">
          <Link href={current.href}>
            <span className="inline-flex items-center gap-sm">
              <span
                aria-hidden="true"
                className="inline-flex size-[18px] shrink-0 items-center justify-center [&>svg]:size-full"
              >
                <HeadphonesIcon />
              </span>
              Read &amp; Listen
            </span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
