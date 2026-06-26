"use client";

import { forwardRef } from "react";
import { SavedWordCard } from "@/components/saved-word-card";
import type { SavedWord } from "../types";

/**
 * SavedGrid — the responsive list of SavedWordCards (Figma cards-row 541:641):
 * a single column on mobile (cards 358 wide), four columns on desktop (cards
 * 288 wide), row + column gap 16 (`gap-md`).
 *
 * Semantics: a real `<ul>`/`<li>` list (each `<li>` carries `data-word-id` so
 * the screen can move keyboard focus to a specific card after a removal). The
 * card itself is presentational — its word link and its audio / remove /
 * Review-Practice controls are the only focusable elements, each with a distinct
 * accessible name (handled inside SavedWordCard).
 *
 * Motion: a removed card fades + shrinks out over 300ms ease-out (`exitingId`)
 * before the screen commits the removal, then the grid reflows; the rest fade in
 * (`re-fade-in`). Honors `prefers-reduced-motion`.
 *
 * The ref forwards to the `<ul>` so the screen can query a focus target by
 * `data-word-id`.
 */

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface SavedGridProps {
  /** Words to render, in display order (newest first). */
  words: SavedWord[];
  /** Id of the card currently animating out (or null). */
  exitingId?: string | null;
  /** Fired by a card's audio button. */
  onListen: (word: SavedWord) => void;
  /** Fired by a card's Review/Practice button — opens the Practice overlay. */
  onPractice: (word: SavedWord) => void;
  /** Fired by a card's remove button; `index` positions the next focus target. */
  onRemove: (word: SavedWord, index: number) => void;
}

export const SavedGrid = forwardRef<HTMLUListElement, SavedGridProps>(
  function SavedGrid({ words, exitingId, onListen, onPractice, onRemove }, ref) {
    return (
      <ul
        ref={ref}
        aria-label="Saved words"
        className="grid w-full list-none grid-cols-1 gap-md p-0 sm:grid-cols-2 lg:grid-cols-4"
      >
        {words.map((word, index) => (
          <li
            key={word.id}
            data-word-id={word.id}
            className={cx(
              "re-fade-in transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
              exitingId === word.id && "pointer-events-none scale-[0.96] opacity-0",
            )}
          >
            <SavedWordCard
              word={word.word}
              phonetic={word.phonetic}
              translation={word.translation}
              sourceStoryTitle={word.sourceStoryTitle}
              sentencesReady={word.sentencesReady}
              wordHref={`/story/${word.sourceStoryId}`}
              onListen={() => onListen(word)}
              onPractice={() => onPractice(word)}
              onRemove={() => onRemove(word, index)}
            />
          </li>
        ))}
      </ul>
    );
  },
);
