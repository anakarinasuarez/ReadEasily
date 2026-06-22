"use client";

import Link from "next/link";
import { BookShowcase } from "@/components/book-showcase";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import type { FeaturedBook } from "../types";
import { HeadphonesIcon, StarIcon } from "./icons";

/**
 * FeaturedHero — the centered hero atop the Library landing (Figma node
 * 1272:4578). A fanned, auto-cycling BookShowcase over a static copy block for
 * the one featured story: eyebrow + editor's-pick Badge, title, teaser, a meta
 * row, and the "Read & Listen" CTA into the reader.
 *
 * The showcase dots are decorative here (their position does NOT swap the copy
 * — there is a single featured book), so we don't read `onActiveChange`; the
 * carousel just animates its cover fan. The copy below is the source of truth
 * for the active story, mirroring the BookShowcase a11y contract (its tiles are
 * `aria-hidden`, the real title/level live here).
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
      <BookShowcase items={showcaseItems} label="Featured stories" />

      <div className="flex w-full max-w-2xl flex-col items-center gap-md text-center">
        {/* Eyebrow row: section label + editor's-pick badge (star override). */}
        <div className="flex items-center gap-sm">
          <span className="font-ui font-semibold uppercase text-muted [font-size:var(--text-label-s-size)] [line-height:var(--text-label-s-line-height)] [letter-spacing:var(--text-label-s-tracking)]">
            Featured Fable
          </span>
          {/* Editor's-pick override: accent tone (terracotta-on-subtle, no dot)
              with the star in Badge's first-class `icon` slot. */}
          <Badge tone="accent" icon={<StarIcon />}>
            {featured.badgeLabel}
          </Badge>
        </div>

        <h1
          id="featured-title"
          className="font-display font-extrabold text-primary [font-size:var(--text-display-l-size)] [line-height:var(--text-display-l-line-height)] [letter-spacing:var(--text-display-l-tracking)]"
        >
          {featured.title}
        </h1>

        <p className="font-reading text-secondary [font-size:var(--text-body-l-size)] [line-height:var(--text-body-l-line-height)]">
          {featured.teaser}
        </p>

        {/* Meta row — level + label · minutes · words. */}
        <div className="flex flex-wrap items-center justify-center gap-sm font-ui font-semibold text-muted text-label-m tracking-[var(--text-label-m-tracking)]">
          <span>
            {featured.level} · {featured.levelLabel}
          </span>
          <span aria-hidden="true">·</span>
          <span>{featured.minutes} min</span>
          <span aria-hidden="true">·</span>
          <span>{featured.words} words</span>
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
