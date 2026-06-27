"use client";

import { forwardRef } from "react";
import { cx } from "@/lib/utils/cx";
import type { HTMLAttributes } from "react";
import { IconButton } from "@/ui/icon-button";

/**
 * SavedWordCard — the Saved screen vocabulary card, 1:1 with the Figma
 * "Saved Word Card" component (badge variant 1135:2637, phonetic variant
 * 1136:3177; 288×232).
 *
 * Anatomy (top → bottom): a body (`p-xl`, `gap-md`) holding the word + the
 * audio/remove icon-buttons, an optional phonetic line, an always-present
 * translation row, and an optional "N sentences ready" badge — then a tinted
 * footer with the source-story title and a Review/Practice action.
 *
 * A11y — Figma models the whole card as one <a> wrapping the buttons. We do
 * NOT: nesting interactive elements inside a link is invalid and traps AT.
 * Instead the root is a presentational <article>; the WORD is the single
 * navigation link (only when `wordHref` is set), and Audio, Remove and
 * Review/Practice are each their own sibling control with a distinct
 * accessible name and a visible AA focus ring. The consuming feature wraps
 * cards in its own <ul>/<li> list.
 *
 * Hover — there is deliberately NO whole-card lift. The card is not itself a
 * link, so a lift would imply the whole surface is clickable (a false
 * affordance). The real affordances are the word link and the buttons, which
 * each carry their own hover/focus states.
 */
export interface SavedWordCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** The saved word, shown large in Display/Mobile. */
  word: string;
  /** Optional IPA / phonetic spelling (Lora italic). Rendered only when set. */
  phonetic?: string;
  /** Translation — senses pre-joined by the caller, e.g. "sendero, camino". */
  translation: string;
  /** Source-story title, truncated to a single line in the footer. */
  sourceStoryTitle: string;
  /** When set, the word becomes a link to its source story / reader. */
  wordHref?: string;
  /** Ready practice sentences. `>0` shows the badge and labels the action
   *  "Review"; `0` labels it "Practice". */
  sentencesReady: number;
  /** Fired by the audio icon-button. */
  onListen?: () => void;
  /** Fired by the remove (unsave) icon-button. */
  onRemove?: () => void;
  /** Fired by the Review/Practice action when rendered as a button. */
  onPractice?: () => void;
  /** When set, the Review/Practice action is a link to this destination. */
  practiceHref?: string;
  className?: string;
}

const focusRing = cx(
  "outline-none",
  "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]",
);

/* ---------------------------------------------------------------------------
 * Decorative glyphs. All inline SVG (the project has no icon dependency),
 * `currentColor`-driven and aria-hidden — their meaning comes from the
 * adjacent text or the control's accessible name.
 * ------------------------------------------------------------------------- */
function SpeakerGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 9v6h3.5L13 19V5L7.5 9H4Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 9.2a4 4 0 0 1 0 5.6M18.8 6.8a7.3 7.3 0 0 1 0 10.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 6.5h16M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5M6.5 6.5l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12M10 10.5v6M14 10.5v6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="size-full text-icon-info-decorative"
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.3 3.6 8.5S14.4 18.2 12 20.5C9.6 18.2 8.4 15.2 8.4 12S9.6 5.8 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="size-full"
    >
      <path d="M12 2.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5ZM18.5 14c.3 1.7 1.2 2.6 3 3-1.8.4-2.7 1.3-3 3-.3-1.7-1.2-2.6-3-3 1.8-.4 2.7-1.3 3-3Z" />
    </svg>
  );
}

function PlusGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="size-full"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const SavedWordCard = forwardRef<HTMLElement, SavedWordCardProps>(
  function SavedWordCard(
    {
      word,
      phonetic,
      translation,
      sourceStoryTitle,
      wordHref,
      sentencesReady,
      onListen,
      onRemove,
      onPractice,
      practiceHref,
      className,
      ...rest
    },
    ref,
  ) {
    const hasBadge = sentencesReady > 0;
    const actionLabel = hasBadge ? "Review" : "Practice";
    const badgeText = `${sentencesReady} ${
      sentencesReady === 1 ? "sentence" : "sentences"
    } ready`;

    // Word — the single navigation link when `wordHref` is set, else plain text.
    const wordClasses = cx(
      "min-w-0 flex-1 break-words font-display font-extrabold",
      "text-[32px] leading-[40px] tracking-[-0.32px] text-[var(--text-primary)]",
    );
    const wordNode = wordHref ? (
      <a href={wordHref} className={cx(wordClasses, "no-underline", focusRing)}>
        {word}
      </a>
    ) : (
      <p className={wordClasses}>{word}</p>
    );

    // Review/Practice — a real focusable control. Link when `practiceHref` is
    // set; otherwise a button (firing `onPractice` if given). Its accessible
    // name contains the visible label (WCAG 2.5.3) plus the word for per-card
    // distinctness.
    const actionContent = (
      <>
        <span aria-hidden="true" className="inline-flex size-[12px] shrink-0">
          <PlusGlyph />
        </span>
        <span className="font-display font-bold text-[length:var(--text-meta-size)] leading-[var(--text-meta-line-height)] text-[var(--text-accent)]">
          {actionLabel}
        </span>
      </>
    );
    const actionClasses = cx(
      "inline-flex shrink-0 items-center gap-[var(--space-xs)] rounded-pill no-underline",
      "transition-colors hover:opacity-80",
      focusRing,
    );
    const actionName = `${actionLabel} ${word}`;
    const actionNode = practiceHref ? (
      <a href={practiceHref} aria-label={actionName} className={actionClasses}>
        {actionContent}
      </a>
    ) : (
      // Fires `onPractice` — the host (SavedScreen) opens the Practice overlay
      // for this word. With neither `practiceHref` nor `onPractice` it degrades
      // to a focusable control that just announces its accessible name.
      <button
        type="button"
        aria-label={actionName}
        onClick={onPractice}
        className={actionClasses}
      >
        {actionContent}
      </button>
    );

    return (
      <article
        ref={ref}
        className={cx(
          // Fixed 232px height (Figma 1135:2637 / 1136:3177) so every card is the
          // SAME size regardless of optional phonetic/badge content — the body is
          // flex-1 so it absorbs the slack and the footer stays pinned to the base.
          "flex h-[232px] flex-col overflow-clip rounded-card bg-[var(--bg-elevated)] shadow-card",
          className,
        )}
        {...rest}
      >
        <div className="flex flex-1 flex-col gap-md p-xl">
          {/* Row 1 — word + actions */}
          <div className="flex items-center gap-sm">
            {wordNode}
            <IconButton
              variant="accentSubtle"
              size="card"
              icon={<SpeakerGlyph />}
              aria-label={`Listen to ${word}`}
              onClick={onListen}
            />
            <IconButton
              variant="subtle"
              size="card"
              icon={<TrashGlyph />}
              aria-label={`Remove ${word} from saved`}
              onClick={onRemove}
            />
          </div>

          {/* Optional phonetic (Reading/quote, Lora italic) */}
          {phonetic ? (
            <p className="break-words font-reading italic text-[length:var(--text-reading-quote-size)] leading-[var(--text-reading-quote-line-height)] text-[var(--text-muted)]">
              {phonetic}
            </p>
          ) : null}

          {/* Translation (always) */}
          <div className="flex items-center gap-sm">
            <span aria-hidden="true" className="inline-flex size-[16px] shrink-0">
              <GlobeGlyph />
            </span>
            <p className="break-words font-display font-bold text-title-m text-[var(--text-primary)]">
              {translation}
            </p>
          </div>

          {/* Optional "N sentences ready" badge */}
          {hasBadge ? (
            <span className="inline-flex shrink-0 items-center gap-[6px] self-start rounded-pill bg-[var(--bg-accent-subtle)] py-[6px] pl-[10px] pr-md">
              <span
                aria-hidden="true"
                className="inline-flex size-[13px] shrink-0 text-[var(--text-accent)]"
              >
                <SparkleGlyph />
              </span>
              <span className="font-ui font-semibold text-label-m tracking-[var(--text-label-m-tracking)] text-[var(--text-accent)]">
                {badgeText}
              </span>
            </span>
          ) : null}
        </div>

        {/* Footer — source title + Review/Practice */}
        <div className="flex items-center gap-md bg-[var(--bg-subtle)] px-xl py-md-plus">
          <p className="min-w-0 flex-1 truncate font-ui font-normal text-caption text-[var(--text-muted)]">
            {sourceStoryTitle}
          </p>
          {actionNode}
        </div>
      </article>
    );
  },
);

SavedWordCard.displayName = "SavedWordCard";
