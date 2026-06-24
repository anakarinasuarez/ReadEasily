"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { WordToken } from "@/ui/word-token";
import { tokenizePage } from "../content/tokenize";

/**
 * ReadingParagraph (a.k.a. SelectableText) — the page's English passage rendered
 * as tappable words.
 *
 * It takes the page's English paragraphs, tokenizes each into ordered tokens
 * (word vs separator/punctuation/space), renders a `WordToken` for every word
 * and a plain span for every separator, inside `text-reading-xl` paragraphs
 * (`--text-secondary`). It renders MULTIPLE `<p>` elements (one per source
 * paragraph) so a screen reader still reads each paragraph as continuous prose —
 * but it owns a SINGLE roving-tabindex group spanning every word on the page, so
 * the whole reading area is one Tab stop with arrow-key word navigation.
 *
 * Word identity is `${pageIndex}:${tokenIndex}` (tokenIndex counts words across
 * the whole page), surfaced as `data-word-id` so the feature can restore focus
 * to the originating word after the popover closes.
 *
 * A11y model (the make-or-break part):
 *  • `role="group"` + an explanatory `aria-label`.
 *  • Roving tabindex: exactly one WordToken has `tabIndex=0` (the active word),
 *    the rest `-1` — Tab enters/leaves the passage once, it never tab-traps the
 *    reader across dozens of words.
 *  • ←/→ and ↑/↓ move focus between words; Home/End jump to first/last.
 *  • Enter/Space activate a word (handled by WordToken) → the feature opens the
 *    popover. Activating also moves the roving tab stop to that word.
 *  • Each word is a real inline `<button>`, so the passage's accessible text is
 *    the concatenation of the word + separator runs — the sentence is preserved
 *    in the a11y tree (verified by test), it just reads word-by-word as buttons.
 */
export interface ReadingParagraphProps {
  /** The page's English body paragraphs, in order. */
  paragraphs: string[];
  /** 0-based page index — the first half of every word id. */
  pageIndex: number;
  /** The id of the word whose popover is open (terracotta underline + tint). */
  selectedWordId?: string | null;
  /** The id of a single word currently being voiced (stronger highlight). */
  speakingWordId?: string | null;
  /**
   * Inclusive page-global word-index range of the sentence currently being
   * voiced by TTS (audio karaoke highlight). Every word whose `wordIndex` falls
   * in `[start, end]` renders in the `speaking` state. `null` clears it (paused
   * / stopped). This is the audio model's granularity — a sentence at a time —
   * since Web Speech word boundaries are unreliable cross-browser.
   */
  speakingWordRange?: { start: number; end: number } | null;
  /** Fired on tap / Enter / Space with the word's id + surface text. */
  onActivateWord: (info: { id: string; surface: string }) => void;
}

const paragraphClasses =
  "w-full text-left text-[color:var(--text-secondary)] " +
  "[font-family:var(--text-reading-xl-family)] [font-size:var(--text-reading-xl-size)] " +
  "[font-weight:var(--text-reading-xl-weight)] [line-height:var(--text-reading-xl-line-height)] " +
  "[letter-spacing:var(--text-reading-xl-tracking)]";

export function ReadingParagraph({
  paragraphs,
  pageIndex,
  selectedWordId = null,
  speakingWordId = null,
  speakingWordRange = null,
  onActivateWord,
}: ReadingParagraphProps) {
  const { paraTokens, wordCount } = useMemo(
    () => tokenizePage(paragraphs, pageIndex),
    [paragraphs, pageIndex],
  );

  // The roving tab stop — index into the page's words. One word is tabbable; the
  // rest are reachable only via the arrow keys. The parent (ReadingCard) keys
  // this component by page, so a page change remounts it and resets the tab stop
  // to the first word automatically — no reset effect needed.
  const [activeIndex, setActiveIndex] = useState(0);
  // Refs to each word button, by word index, so the arrow keys can move focus.
  const wordRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusWord = useCallback(
    (index: number) => {
      if (wordCount === 0) return;
      const clamped = Math.min(Math.max(index, 0), wordCount - 1);
      setActiveIndex(clamped);
      wordRefs.current[clamped]?.focus();
    },
    [wordCount],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          focusWord(activeIndex + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          focusWord(activeIndex - 1);
          break;
        case "Home":
          event.preventDefault();
          focusWord(0);
          break;
        case "End":
          event.preventDefault();
          focusWord(wordCount - 1);
          break;
        default:
          break;
      }
    },
    [activeIndex, focusWord, wordCount],
  );

  return (
    <div
      role="group"
      aria-label="Story text — tap a word for its meaning"
      onKeyDown={handleKeyDown}
      className="flex w-full flex-col gap-[var(--space-lg)]"
    >
      {paraTokens.map((tokens, paraIndex) => (
        <p key={paraIndex} className={paragraphClasses}>
          {tokens.map((token, tokenIndex) =>
            token.isWord ? (
              <WordToken
                key={token.id}
                ref={(el) => {
                  wordRefs.current[token.wordIndex] = el;
                }}
                data-word-id={token.id}
                // Page-global word index — the auto-scroll-follow hook locates
                // the active sentence's first word by this attribute.
                data-word-index={token.wordIndex}
                word={token.text}
                selected={token.id === selectedWordId}
                speaking={
                  token.id === speakingWordId ||
                  (speakingWordRange != null &&
                    token.wordIndex >= speakingWordRange.start &&
                    token.wordIndex <= speakingWordRange.end)
                }
                tabIndex={token.wordIndex === activeIndex ? 0 : -1}
                onActivate={() => {
                  setActiveIndex(token.wordIndex);
                  onActivateWord({ id: token.id, surface: token.text });
                }}
              />
            ) : (
              // Separators (spaces + punctuation) are inert text, hidden from the
              // tab order; they keep the sentence reading naturally between words.
              <span key={`sep-${paraIndex}-${tokenIndex}`}>{token.text}</span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}
