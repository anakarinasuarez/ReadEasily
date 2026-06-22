"use client";

import { BookCard } from "@/components/book-card";
import { Button } from "@/ui/button";
import { LibraryIcon, SearchIcon } from "./icons";

/**
 * The Library's non-data states. In ReadEasily the states ARE the design, so
 * loading / empty / error each get a real, laid-out treatment — not a spinner.
 * The Navbar + chip row stay mounted around these (owned by LibraryScreen); the
 * blocks here fill the content area only.
 */

/** One shimmer block — token-bound, pulses unless reduced-motion is set. */
function Shimmer({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-[var(--radius-lg)] bg-[var(--border-strong)] motion-reduce:animate-none ${className ?? ""}`}
    />
  );
}

/**
 * Loading skeleton: a hero placeholder (showcase + copy bars) over two rails of
 * BookCard skeletons, matching the loaded layout so the page doesn't reflow when
 * data arrives. One polite status announces the load for AT.
 */
export function LibrarySkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-3xl">
      <span className="sr-only" role="status">
        Loading your library
      </span>

      {/* Hero placeholder — footprints mirror the loaded FeaturedHero so data
          arriving causes no reflow: the 360px fan stage, the display-L title,
          the body-L teaser, the lg CTA. */}
      <div className="flex w-full flex-col items-center gap-xl">
        <Shimmer className="h-[360px] w-full max-w-3xl rounded-[var(--radius-2xl)]" />
        <div className="flex w-full max-w-2xl flex-col items-center gap-md">
          <Shimmer className="h-[var(--text-label-s-line-height)] w-[180px]" />
          <Shimmer className="h-[var(--text-display-l-line-height)] w-[420px] max-w-full" />
          <Shimmer className="h-[var(--text-body-l-line-height)] w-full max-w-xl" />
          <Shimmer className="h-[56px] w-[200px] rounded-pill" />
        </div>
      </div>

      {/* Two rail placeholders — the marker bar matches the real ~50px header
          height + radius-sm, the card row matches the BookCard footprint. */}
      {[0, 1].map((rail) => (
        <div key={rail} className="flex w-full flex-col gap-md">
          <div className="flex items-stretch gap-md">
            <Shimmer className="h-[50px] w-[5px] rounded-sm" />
            <Shimmer className="h-[24px] w-[160px] self-center" />
          </div>
          <div className="flex gap-xl overflow-hidden">
            {[0, 1, 2, 3].map((card) => (
              <BookCard
                key={card}
                loading
                book={{ title: "", level: "", minutes: 0, coverSrc: "" }}
                href="#"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state — shown when the active filter yields no rails. Offers a one-tap
 * reset back to "All". The CTA carries an icon (brand law).
 */
export function LibraryEmpty({ onShowAll }: { onShowAll: () => void }) {
  return (
    <div
      role="status"
      className="flex w-full max-w-md flex-col items-center gap-md py-3xl text-center"
    >
      <span
        aria-hidden="true"
        className="inline-flex size-[56px] items-center justify-center rounded-[var(--radius-xl)] bg-accent-subtle text-accent-text [&>svg]:size-[28px]"
      >
        <SearchIcon />
      </span>
      <h2 className="font-display font-extrabold text-primary [font-size:var(--text-heading-h3-size)] [line-height:var(--text-heading-h3-line-height)]">
        No stories here yet
      </h2>
      <p className="font-reading text-secondary [font-size:var(--text-body-l-size)] [line-height:var(--text-body-l-line-height)]">
        There’s nothing in this category right now. Browse the whole library
        instead.
      </p>
      <Button
        variant="primary"
        size="lg"
        className="mt-sm"
        leftIcon={<LibraryIcon />}
        onClick={onShowAll}
      >
        Show all
      </Button>
    </div>
  );
}

/**
 * Error state — the query failed. Offers a retry that re-runs the query. The
 * message is an `alert` so AT announces the failure.
 */
export function LibraryError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-md py-3xl text-center">
      <h2 className="font-display font-extrabold text-primary [font-size:var(--text-heading-h3-size)] [line-height:var(--text-heading-h3-line-height)]">
        We couldn’t load your library
      </h2>
      <p role="alert" className="font-reading text-secondary [font-size:var(--text-body-l-size)] [line-height:var(--text-body-l-line-height)]">
        Something went wrong fetching your stories. Please try again.
      </p>
      <Button
        variant="primary"
        size="lg"
        className="mt-sm"
        leftIcon={<LibraryIcon />}
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}
