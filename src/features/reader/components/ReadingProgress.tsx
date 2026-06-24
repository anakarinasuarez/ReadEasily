"use client";

import { useRef } from "react";
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

// Figma 1157:3132 draws these as 22px PLAIN chevron glyphs — no button frame,
// no hover fill. They remain real buttons (accessible name + visible focus ring),
// just visually frameless. The hit area is the 22px glyph plus the focus offset.
const chevronClasses =
  "inline-flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] " +
  "text-[color:var(--text-secondary)] transition-colors " +
  "hover:text-[color:var(--text-primary)] " +
  "disabled:cursor-not-allowed disabled:text-[color:var(--text-muted)] disabled:opacity-40 disabled:hover:text-[color:var(--text-muted)] " +
  "outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]";

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
      <button
        ref={prevRef}
        type="button"
        aria-label="Previous page"
        disabled={atStart}
        onClick={handlePrev}
        className={chevronClasses}
      >
        <span aria-hidden="true" className="inline-flex size-[22px] [&>svg]:size-full">
          <ChevronLeftIcon />
        </span>
      </button>
      <p className={labelClasses} aria-live="polite">
        <span className="sr-only">Currently on </span>
        Page {human} of {pageCount}
      </p>
      <button
        ref={nextRef}
        type="button"
        aria-label="Next page"
        disabled={atEnd}
        onClick={handleNext}
        className={chevronClasses}
      >
        <span aria-hidden="true" className="inline-flex size-[22px] [&>svg]:size-full">
          <ChevronRightIcon />
        </span>
      </button>
    </div>
  );
}
