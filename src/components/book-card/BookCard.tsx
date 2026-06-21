"use client";

import { forwardRef } from "react";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { BookCover } from "./BookCover";

/**
 * BookCard — the library tile, 1:1 with the Figma "Book Card" component
 * (node 267:24, Default + Hover states). A single link to the book: a Small
 * BookCover, then the title (Title/M), then a meta row (Label/M, muted):
 * `level · minutes` e.g. "A2 · 6 min".
 *
 * Hover IS the design: a `--scrim` dims the cover and a terracotta play FAB
 * fades in at the cover's bottom-right (200ms ease-out, reduced-motion safe).
 *
 * A11y — the card is ONE link. By default the play FAB is a decorative
 * affordance that simply rides the link's navigation (single interactive
 * element, no nested-interactive trap). Supply `onPlay` to make it a real
 * nested `<button aria-label="Play {title}">` that stops propagation so it
 * fires its own action without also navigating.
 */

export interface Book {
  title: string;
  /** CEFR level shown verbatim in the meta row, e.g. "A2". */
  level: string;
  /** Estimated read time in minutes, rendered as "{minutes} min". */
  minutes: number;
  coverSrc: string;
}

export interface BookCardProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  /** The book this card links to. */
  book: Book;
  /** Destination for the card link. */
  href: string;
  /**
   * When provided, the play FAB becomes a real nested button firing this
   * handler (propagation stopped). Omit to keep the FAB a decorative affordance
   * that rides the link's own navigation.
   */
  onPlay?: () => void;
  /** Renders the skeleton placeholder (cover shimmer + title/meta bars). */
  loading?: boolean;
  /**
   * Override the cover alt. Empty by default: the card's visible title already
   * names the link, so an alt of the title would announce it twice. Set this
   * only when the cover art conveys something the title does not.
   */
  coverAlt?: string;
}

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Shared geometry for the cover frame within the card. */
const COVER_WRAP = "relative w-[168px] h-[242px]";

/** Terracotta play FAB visuals — token-bound circle + glyph. */
const PLAY_BASE = cx(
  "absolute bottom-[6px] right-[6px] inline-flex size-[52px] items-center justify-center",
  "rounded-[var(--radius-pill)] bg-[var(--bg-accent)] text-[var(--text-on-accent)] shadow-md",
  // Reveal on hover AND keyboard focus-within (parity with the scrim) so
  // keyboard users see the play affordance too.
  "opacity-0 transition-opacity duration-200 ease-out motion-reduce:transition-none",
  "group-hover:opacity-100 group-focus-within:opacity-100",
);

function PlayGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="size-[18px]"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export const BookCard = forwardRef<HTMLAnchorElement, BookCardProps>(
  function BookCard(
    { book, href, onPlay, loading = false, coverAlt, className, ...rest },
    ref,
  ) {
    if (loading) {
      return (
        <div
          aria-busy="true"
          className="flex w-[168px] flex-col gap-[10px]"
        >
          <span className="sr-only" role="status">
            Loading book
          </span>
          <div
            aria-hidden="true"
            className={cx(COVER_WRAP, "animate-pulse rounded-[var(--radius-xl)] bg-[var(--border-strong)]")}
          />
          <div
            aria-hidden="true"
            className="h-[16px] w-3/4 animate-pulse rounded-[var(--radius-sm)] bg-[var(--border-strong)]"
          />
          <div
            aria-hidden="true"
            className="h-[13px] w-1/3 animate-pulse rounded-[var(--radius-sm)] bg-[var(--border-strong)]"
          />
        </div>
      );
    }

    const { title, level, minutes, coverSrc } = book;

    return (
      <a
        ref={ref}
        href={href}
        className={cx(
          // `group` drives the hover/focus reveal of scrim + play FAB.
          "group flex w-[168px] flex-col gap-[10px] rounded-[var(--radius-xl)] no-underline outline-none",
          "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]",
          className,
        )}
        {...rest}
      >
        <div className={COVER_WRAP}>
          {/* Decorative in-card: the visible title already names the link, so
              alt is empty to avoid announcing the title twice (coverAlt opts in). */}
          <BookCover size="small" src={coverSrc} alt={coverAlt ?? ""} />

          {/* Hover scrim — decorative dim over the cover. */}
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-0 rounded-[var(--radius-xl)] bg-[var(--scrim)]",
              "opacity-0 transition-opacity duration-200 ease-out motion-reduce:transition-none",
              "group-hover:opacity-100 group-focus-within:opacity-100",
            )}
          />

          {onPlay ? (
            <button
              type="button"
              aria-label={`Play ${title}`}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                // Fire the play action without also triggering the card link.
                event.preventDefault();
                event.stopPropagation();
                onPlay();
              }}
              className={cx(
                PLAY_BASE,
                "outline-none group-hover:opacity-100 focus-visible:opacity-100",
                "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]",
              )}
            >
              <PlayGlyph />
            </button>
          ) : (
            <span
              aria-hidden="true"
              className={cx(PLAY_BASE, "pointer-events-none group-hover:opacity-100")}
            >
              <PlayGlyph />
            </span>
          )}
        </div>

        <p className="font-display font-bold text-title-m break-words text-[var(--text-primary)]">
          {title}
        </p>

        <div className="flex items-center gap-[8px] font-ui font-semibold text-label-m tracking-[var(--text-label-m-tracking)] text-[var(--text-muted)]">
          <span>{level}</span>
          <span aria-hidden="true">·</span>
          <span>{minutes} min</span>
        </div>
      </a>
    );
  },
);

BookCard.displayName = "BookCard";
