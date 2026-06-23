"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { WordToken } from "@/ui/word-token";

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
  /** The id of the word currently being voiced (stronger highlight). */
  speakingWordId?: string | null;
  /** Fired on tap / Enter / Space with the word's id + surface text. */
  onActivateWord: (info: { id: string; surface: string }) => void;
}

interface Token {
  /** The literal text (a word, or a run of separators). */
  text: string;
  /** True for a tappable word; false for punctuation/whitespace. */
  isWord: boolean;
  /** Global word index across the page (only set for words). */
  wordIndex: number;
  /** `${pageIndex}:${wordIndex}` (only set for words). */
  id: string;
}

/** Words = letter/number runs (keeping internal apostrophes/hyphens); anything
 *  else is a separator run. The two alternatives tile the whole string. */
const TOKEN_RE = /[\p{L}\p{N}][\p{L}\p{N}'’-]*|[^\p{L}\p{N}]+/gu;

/** Tokenize the page's paragraphs, assigning a page-global word index. */
function tokenizePage(
  paragraphs: string[],
  pageIndex: number,
): { paraTokens: Token[][]; wordCount: number } {
  let wordIndex = 0;
  const paraTokens = paragraphs.map((paragraph) => {
    const tokens: Token[] = [];
    for (const match of paragraph.matchAll(TOKEN_RE)) {
      const text = match[0];
      const isWord = /[\p{L}\p{N}]/u.test(text[0]);
      if (isWord) {
        tokens.push({
          text,
          isWord: true,
          wordIndex,
          id: `${pageIndex}:${wordIndex}`,
        });
        wordIndex += 1;
      } else {
        tokens.push({ text, isWord: false, wordIndex: -1, id: "" });
      }
    }
    return tokens;
  });
  return { paraTokens, wordCount: wordIndex };
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
                word={token.text}
                selected={token.id === selectedWordId}
                speaking={token.id === speakingWordId}
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
