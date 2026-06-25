"use client";

import { forwardRef } from "react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/ui/button";
import { ArrowRightIcon, BookmarkIcon, RefreshIcon } from "./icons";

/**
 * The Saved screen's non-data states. As everywhere in ReadEasily, the states
 * ARE the design: loading gets a real, laid-out skeleton (not a spinner) that
 * matches the card grid footprint so data arriving causes no reflow; error gets
 * an inline retry row; empty gets the designed EmptyState. The Navbar + header
 * chrome stay mounted around these (owned by SavedScreen).
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

/** A single skeleton card matching the SavedWordCard footprint (232 tall). */
function SkeletonCard() {
  return (
    <div className="flex h-[232px] flex-col overflow-clip rounded-card bg-[var(--bg-elevated)] shadow-card">
      <div className="flex flex-1 flex-col gap-md p-xl">
        {/* word row + two action dots */}
        <div className="flex items-center gap-sm">
          <Shimmer className="h-[34px] flex-1 rounded-md" />
          <Shimmer className="size-[34px] shrink-0 rounded-pill" />
          <Shimmer className="size-[34px] shrink-0 rounded-pill" />
        </div>
        {/* translation line */}
        <Shimmer className="h-[22px] w-3/4 rounded-md" />
        {/* badge line */}
        <Shimmer className="h-[26px] w-[140px] rounded-pill" />
      </div>
      {/* footer */}
      <div className="flex items-center justify-between gap-md bg-[var(--bg-subtle)] px-xl py-md-plus">
        <Shimmer className="h-[16px] w-[120px] rounded-sm bg-[var(--bg-canvas)]" />
        <Shimmer className="h-[16px] w-[56px] rounded-sm bg-[var(--bg-canvas)]" />
      </div>
    </div>
  );
}

/**
 * Loading skeleton — ~8 shimmer cards in the SAME grid as the loaded list (1 col
 * mobile / 4 cols desktop), so the page never reflows when data arrives. The
 * subtree fades in over 200ms (`re-fade-in`). One polite status announces the
 * load for AT.
 */
export function SavedSkeleton() {
  return (
    <div className="re-fade-in w-full">
      <span className="sr-only" role="status">
        Loading saved words
      </span>
      <ul className="grid w-full list-none grid-cols-1 gap-md p-0 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i}>
            <SkeletonCard />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Error state — the query failed. An inline retry row (alert + icon CTA) that
 * re-runs the query. The message is an `alert` so AT announces the failure; the
 * CTA carries an icon (brand law).
 */
export function SavedError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-md py-3xl text-center">
      <h2 className="font-display font-extrabold text-primary [font-size:var(--text-heading-h3-size)] [line-height:var(--text-heading-h3-line-height)]">
        We couldn’t load your words
      </h2>
      <p
        role="alert"
        className="font-reading text-secondary [font-size:var(--text-body-l-size)] [line-height:var(--text-body-l-line-height)]"
      >
        Something went wrong fetching your saved words. Please try again.
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

/**
 * Empty state — zero saved words (Figma desktop 144:181 / mobile 864:1048).
 * Wraps the shared EmptyState, capping it at the Figma 720 width and centering
 * it. Forwards a ref to the wrapper so the screen can move focus to the CTA when
 * the list becomes empty after removing the last word.
 */
export const SavedEmpty = forwardRef<HTMLDivElement>(function SavedEmpty(_, ref) {
  return (
    <div ref={ref} className="re-fade-in flex w-full justify-center">
      <EmptyState
        className="w-full max-w-[720px]"
        icon={<BookmarkIcon />}
        title="No saved words yet"
        body="You haven't saved any words yet. Tap a word while reading to keep it here for practice."
        action={{
          label: "Start reading",
          icon: <ArrowRightIcon />,
          href: "/library",
        }}
      />
    </div>
  );
});
