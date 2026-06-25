"use client";

import { BookCard } from "@/components/book-card";
import { Button } from "@/ui/button";
import { RefreshIcon } from "./icons";

/**
 * The Search screen's non-data states. As everywhere in ReadEasily, the states
 * ARE the design: loading and error get a real, laid-out treatment, not a
 * spinner. The Navbar + back + H1 + SearchField stay mounted around these
 * (owned by SearchScreen); the blocks here fill the category + results area
 * only, so the page frame never reflows when data arrives.
 *
 * The no-results state for live text search lives in SearchScreen (it renders
 * the shared EmptyState when a query matches nothing). The blocks here are only
 * the pending/error chrome for the initial data fetch — category browse itself
 * always has stories per the contract.
 */

/** One shimmer block — token-bound, pulses unless reduced-motion is set. */
function Shimmer({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] motion-reduce:animate-none ${className ?? ""}`}
    />
  );
}

/**
 * Loading skeleton: a category-card row over a section-header bar + a results
 * grid of BookCard skeletons, matching the loaded layout (4 cols desktop / 2
 * cols mobile) so data arriving causes no reflow. One polite status announces
 * the load for AT.
 */
export function SearchSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2xl">
      <span className="sr-only" role="status">
        Loading stories
      </span>

      {/* Category-card row placeholder — 4 cards 202×160 (desktop) / 2×2 172×160
          (mobile), matching CategoryGrid's tracks. */}
      <div className="grid [grid-template-columns:repeat(2,minmax(0,172px))] gap-md-plus md:[grid-template-columns:repeat(4,minmax(0,202px))] md:gap-lg">
        {[0, 1, 2, 3].map((card) => (
          <Shimmer key={card} className="h-40 w-full rounded-[var(--radius-card)]" />
        ))}
      </div>

      {/* Section-header bar — 5px marker + title, matching SectionHeader. */}
      <div className="flex items-stretch gap-md">
        <Shimmer className="h-[36px] w-[5px] rounded-sm" />
        <Shimmer className="h-[28px] w-[160px] self-center" />
      </div>

      {/* Results grid placeholder — same 4/2-col footprint as ResultsGrid. */}
      <div className="grid [grid-template-columns:repeat(2,168px)] gap-x-lg-plus gap-y-xl justify-items-center md:[grid-template-columns:repeat(4,168px)]">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((card) => (
          <BookCard
            key={card}
            loading
            book={{ title: "", level: "", minutes: 0, coverSrc: "" }}
            href="#"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Error state — the query failed. Offers a retry that re-runs the query. The
 * message is an `alert` so AT announces the failure; the CTA carries an icon
 * (brand law).
 */
export function SearchError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-md py-3xl text-center">
      <h2 className="font-display font-extrabold text-primary [font-size:var(--text-heading-h3-size)] [line-height:var(--text-heading-h3-line-height)]">
        We couldn’t load the stories
      </h2>
      <p
        role="alert"
        className="font-reading text-secondary [font-size:var(--text-body-l-size)] [line-height:var(--text-body-l-line-height)]"
      >
        Something went wrong fetching the catalog. Please try again.
      </p>
      <Button
        variant="primary"
        size="lg"
        className="mt-sm"
        leftIcon={<RefreshIcon />}
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}
