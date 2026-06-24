"use client";

import Link from "next/link";
import { Button } from "@/ui/button";
import { ChevronLeftIcon, RefreshIcon } from "./icons";

/**
 * Story Detail's non-happy states. The skeleton mirrors the real two-column
 * layout (a cover + CTA block beside a title / meta / teaser / chips block) so
 * there's no jump when the story arrives; the error block is an inline,
 * retryable "not found" message with a way back to the Library. Both are part of
 * the slice, not optional polish.
 */

/** Token-bound shimmer block. */
function Shimmer({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block rounded-[var(--radius-md)] bg-[var(--bg-subtle)] motion-safe:animate-pulse motion-reduce:animate-none ${className ?? ""}`}
    />
  );
}

/** Loading placeholder shaped like the cover/title/meta/chips layout. */
export function StoryDetailSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-[var(--space-lg)]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading story…</span>
      {/* Breadcrumb placeholder. */}
      <Shimmer className="h-[24px] w-[120px]" />

      <div className="flex flex-col gap-[var(--space-2xl)] md:flex-row md:gap-[60px] md:items-start">
        {/* Left: cover + CTA. */}
        <div className="flex flex-col items-center gap-[20px] md:w-[339px]">
          <Shimmer className="h-[480px] w-[320px] max-w-full rounded-[var(--radius-xl)]" />
          <Shimmer className="h-[56px] w-full rounded-[var(--radius-pill)] md:w-[320px]" />
        </div>

        {/* Right: eyebrow, title, meta, teaser, chips. */}
        <div className="flex flex-1 flex-col gap-[18px]">
          <Shimmer className="h-[18px] w-[260px] max-w-full" />
          <Shimmer className="h-[56px] w-[420px] max-w-full" />
          <Shimmer className="h-[18px] w-[300px] max-w-full" />
          <div className="flex flex-col gap-[var(--space-sm)]">
            <Shimmer className="h-[20px] w-full" />
            <Shimmer className="h-[20px] w-[85%]" />
          </div>
          <Shimmer className="h-[30px] w-[220px]" />
          <div className="flex flex-wrap gap-[10px]">
            {["w-[92px]", "w-[68px]", "w-[104px]", "w-[80px]", "w-[88px]", "w-[72px]"].map(
              (w, i) => (
                <Shimmer
                  key={i}
                  className={`h-[34px] rounded-[var(--radius-pill)] ${w}`}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface StoryDetailErrorProps {
  /** Re-run the detail query. */
  onRetry: () => void;
}

/**
 * Error / not-found state — a clear message, a retry CTA (brand law: every CTA
 * carries an icon), and a breadcrumb-style way back to the Library so the reader
 * is never stranded on a dead story id.
 */
export function StoryDetailError({ onRetry }: StoryDetailErrorProps) {
  return (
    <div className="flex w-full flex-col gap-[var(--space-lg)]">
      {/* Breadcrumb-back to the Library (`‹ Library`). */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-[var(--space-md)] self-start"
      >
        <Link
          href="/"
          aria-label="Back to Library"
          className="gap-[var(--space-xs)] no-underline"
        >
          <span
            aria-hidden="true"
            className="inline-flex size-[16px] [&>svg]:size-full"
          >
            <ChevronLeftIcon />
          </span>
          Library
        </Link>
      </Button>

      <div
        role="alert"
        className="flex w-full flex-col items-center gap-[var(--space-lg)] rounded-[var(--radius-3xl)] bg-[var(--bg-elevated)] px-[var(--space-2xl)] py-[var(--space-3xl)] text-center shadow-[var(--shadow-sm)]"
      >
        <h2 className="text-[color:var(--text-primary)] [font-family:var(--text-heading-h3-family)] [font-size:var(--text-heading-h3-size)] [font-weight:var(--text-heading-h3-weight)] [line-height:var(--text-heading-h3-line-height)]">
          We couldn&rsquo;t find this story
        </h2>
        <p className="text-[color:var(--text-muted)] [font-family:var(--text-ui-m-family)] [font-size:var(--text-ui-m-size)] [line-height:var(--text-ui-m-line-height)]">
          The story may have moved, or something went wrong loading it. Please
          try again.
        </p>
        <Button
          variant="primary"
          size="md"
          leftIcon={<RefreshIcon />}
          onClick={onRetry}
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
