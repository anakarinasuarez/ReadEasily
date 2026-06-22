"use client";

import Link from "next/link";
import { BookShowcase } from "@/components/book-showcase";
import { Button } from "@/ui/button";
import type { FeaturedBook } from "../types";
import { HeadphonesIcon, StarIcon, VolumeIcon, WordsIcon } from "./icons";

/**
 * FeaturedHero — the centered hero atop the Library landing (Figma node
 * 1272:4578). A fanned, auto-cycling BookShowcase over a static copy block for
 * the one featured story: eyebrow + editor's-pick badge, title, teaser, a meta
 * row, and the "Read & Listen" CTA into the reader.
 *
 * There is a SINGLE featured story, so the showcase fan is purely decorative:
 * it animates the painted covers behind the copy but advertises no choice. We
 * render it with `decorative` so its dots are `aria-hidden` and its tiles are
 * non-interactive — no control that does nothing (the prior 7-dot "Choose a
 * featured story" group was an AA operability failure). The copy block below is
 * the sole source of truth for the featured story's title / level / meta / CTA.
 */
export function FeaturedHero({ featured }: { featured: FeaturedBook }) {
  const showcaseItems = featured.showcaseCovers.map((coverSrc) => ({
    coverSrc,
    alt: featured.title,
  }));

  return (
    <section
      aria-labelledby="featured-title"
      className="flex w-full flex-col items-center"
    >
      <BookShowcase items={showcaseItems} decorative />

      <div className="flex w-full max-w-2xl flex-col items-center gap-md text-center">
        {/* Eyebrow row: section label + editor's-pick badge. */}
        <div className="flex items-center gap-sm">
          {/* Eyebrow — Baloo 2 Bold, uppercase, AA-safe terracotta (--text-accent),
              NOT the muted brown the prior build shipped. */}
          <span className="font-display font-bold uppercase text-accent-text [font-size:var(--text-label-s-size)] [line-height:var(--text-label-s-line-height)] [letter-spacing:var(--text-label-s-tracking)]">
            Featured Fable
          </span>
          {/* Editor's-pick badge — Figma renders this green-on-white (forest
              success + star on the elevated surface), the same "recommended"
              language as the green active carousel dot. No Badge tone matches
              green-text-on-WHITE (success tone fills with success-subtle), so
              this is a small feature-local pill, fully token-bound. */}
          <span className="inline-flex items-center gap-xs rounded-pill bg-surface-elevated px-md py-sm font-ui font-semibold text-success text-label-m tracking-[var(--text-label-m-tracking)] shadow-sm">
            <span
              aria-hidden="true"
              className="inline-flex size-[14px] shrink-0 items-center justify-center [&>svg]:size-full"
            >
              <StarIcon />
            </span>
            {featured.badgeLabel}
          </span>
        </div>

        <h1
          id="featured-title"
          className="font-display font-extrabold text-primary [font-size:var(--text-display-l-size)] [line-height:var(--text-display-l-line-height)] [letter-spacing:var(--text-display-l-tracking)]"
        >
          {featured.title}
        </h1>

        <p className="font-reading text-muted [font-size:var(--text-body-l-size)] [line-height:var(--text-body-l-line-height)]">
          {featured.teaser}
        </p>

        {/* Meta row — three icon+label groups (level dot · listen-time · words),
            Baloo Bold, spaced by a gap (no inter-group bullets). The level group
            reads in `text-secondary`; the listen/words groups in `text-muted`. */}
        <div className="flex flex-wrap items-center justify-center gap-lg font-display font-bold text-label-m tracking-[var(--text-label-m-tracking)]">
          <span className="inline-flex items-center gap-xs text-secondary">
            <span
              aria-hidden="true"
              className="size-[10px] shrink-0 rounded-pill bg-info"
            />
            {featured.level} · {featured.levelLabel}
          </span>
          <span className="inline-flex items-center gap-xs text-muted">
            <span
              aria-hidden="true"
              className="inline-flex size-[18px] shrink-0 items-center justify-center [&>svg]:size-full"
            >
              <VolumeIcon />
            </span>
            {featured.minutes} min
          </span>
          <span className="inline-flex items-center gap-xs text-muted">
            <span
              aria-hidden="true"
              className="inline-flex size-[18px] shrink-0 items-center justify-center [&>svg]:size-full"
            >
              <WordsIcon />
            </span>
            {featured.words} words
          </span>
        </div>

        {/* CTA — every CTA carries an icon (brand law). asChild renders the
            anchor so it is a real link into the reader; we compose the icon +
            label ourselves since asChild bypasses leftIcon. */}
        <Button asChild variant="primary" size="lg" className="mt-sm">
          <Link href={featured.href}>
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
