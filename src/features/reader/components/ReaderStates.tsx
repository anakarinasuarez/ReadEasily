"use client";

import { Button } from "@/ui/button";
import { RefreshIcon } from "./icons";

/**
 * The Reader's non-happy states. Loading mirrors the real layout (a title bar
 * over a reading-card-shaped block) so there's no jump when the story arrives;
 * error is an inline, retryable message. Both are part of the slice, not polish.
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

/** Loading placeholder shaped like the title + reading card. */
export function ReaderSkeleton() {
  return (
    <div
      className="flex w-full flex-col items-center gap-[var(--space-3xl)]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading story…</span>
      <Shimmer className="h-[40px] w-[320px] max-w-full" />
      <div className="w-full max-w-[745px] rounded-[28px] bg-[var(--bg-elevated)] shadow-[var(--shadow-reading-card)] pt-[50px] pb-[var(--space-xl)] px-[60px]">
        <div className="flex w-full flex-col gap-[var(--space-md)]">
          <Shimmer className="h-[28px] w-full" />
          <Shimmer className="h-[28px] w-full" />
          <Shimmer className="h-[28px] w-[80%]" />
          <Shimmer className="mt-[var(--space-lg)] h-px w-full" />
          <Shimmer className="h-[20px] w-[60%]" />
          <Shimmer className="h-[20px] w-[90%]" />
        </div>
      </div>
    </div>
  );
}

export interface ReaderErrorProps {
  /** Re-run the story query. */
  onRetry: () => void;
}

/** Error state — a clear message + a retry CTA (brand law: CTA carries icon). */
export function ReaderError({ onRetry }: ReaderErrorProps) {
  return (
    <div
      role="alert"
      className="flex w-full max-w-[745px] flex-col items-center gap-[var(--space-lg)] rounded-[28px] bg-[var(--bg-elevated)] shadow-[var(--shadow-reading-card)] px-[60px] py-[var(--space-3xl)] text-center"
    >
      <h2 className="text-[color:var(--text-primary)] [font-family:var(--text-heading-h3-family)] [font-size:var(--text-heading-h3-size)] [font-weight:var(--text-heading-h3-weight)] [line-height:var(--text-heading-h3-line-height)]">
        We couldn&rsquo;t open this story
      </h2>
      <p className="text-[color:var(--text-muted)] [font-family:var(--text-ui-m-family)] [font-size:var(--text-ui-m-size)] [line-height:var(--text-ui-m-line-height)]">
        Something went wrong loading the text. Please try again.
      </p>
      <Button variant="primary" size="md" leftIcon={<RefreshIcon />} onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
