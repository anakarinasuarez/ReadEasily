"use client";

import { useRef } from "react";
import { IconButton } from "@/ui/icon-button";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

/**
 * ReadingProgress — the reading card's footer: "Page X of N" flanked by
 * previous / next chevron buttons. The chevrons disable at the bounds (no prev
 * on the first page, no next on the last) so a reader never pages out of range.
 *
 * It is rendered as a STABLE sibling OUTSIDE the page-keyed cross-fade subtree
 * (see ReadingCard), so it is never remounted on a page turn — two things depend
 * on that:
 *   • The single persistent `aria-live="polite"` "Page X of N" region mutates
 *     its text in place, which is what actually triggers the announcement (a
 *     remounted polite region stays silent).
 *   • The chevron the reader just pressed survives the turn and keeps keyboard
 *     focus — except when that chevron becomes disabled at a bound, in which
 *     case focus moves to the other (still-enabled) chevron so it never falls to
 *     `<body>` and forces a re-Tab from the top.
 */
export interface ReadingProgressProps {
  /** 0-based current page index. */
  pageIndex: number;
  /** Total number of pages. */
  pageCount: number;
  /** Go to the previous page (the feature clamps + drives the morph). */
  onPrev: () => void;
  /** Go to the next page. */
  onNext: () => void;
}

const labelClasses =
  "select-none whitespace-nowrap text-[color:var(--text-muted)] " +
  "[font-family:var(--text-label-m-family)] [font-size:var(--text-label-m-size)] " +
  "[font-weight:var(--text-label-m-weight)] [line-height:var(--text-label-m-line-height)] " +
  "[letter-spacing:var(--text-label-m-tracking)]";

export function ReadingProgress({
  pageIndex,
  pageCount,
  onPrev,
  onNext,
}: ReadingProgressProps) {
  const atStart = pageIndex <= 0;
  const atEnd = pageIndex >= pageCount - 1;
  const human = pageIndex + 1;

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // After paging, if the chevron the reader pressed has become disabled at a
  // bound, hand focus to the other chevron so it never lands on <body>.
  function handlePrev() {
    onPrev();
    requestAnimationFrame(() => {
      if (prevRef.current?.disabled) nextRef.current?.focus();
    });
  }
  function handleNext() {
    onNext();
    requestAnimationFrame(() => {
      if (nextRef.current?.disabled) prevRef.current?.focus();
    });
  }

  return (
    <div className="flex w-full items-center justify-between">
      <IconButton
        ref={prevRef}
        size="sm"
        icon={<ChevronLeftIcon />}
        aria-label="Previous page"
        disabled={atStart}
        onClick={handlePrev}
      />
      <p className={labelClasses} aria-live="polite">
        <span className="sr-only">Currently on </span>
        Page {human} of {pageCount}
      </p>
      <IconButton
        ref={nextRef}
        size="sm"
        icon={<ChevronRightIcon />}
        aria-label="Next page"
        disabled={atEnd}
        onClick={handleNext}
      />
    </div>
  );
}
