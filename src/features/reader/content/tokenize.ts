/**
 * Page tokenizer — the single source of truth for how a reading page is split
 * into words vs separators, and how every word gets its page-global index.
 *
 * Both the visible passage (`ReadingParagraph`) and the audio sentence model
 * (`audio/sentences.ts`) tokenize the same way, so a word's `wordIndex` lines up
 * across the two: the audio highlight can map a spoken sentence's word-index
 * range straight onto the rendered `WordToken`s. Keeping this in ONE place is
 * what guarantees they never drift.
 */

/** One token inside a page — a tappable word, or a run of separators. */
export interface Token {
  /** The literal text (a word, or a run of separators/punctuation/space). */
  text: string;
  /** True for a tappable word; false for punctuation/whitespace. */
  isWord: boolean;
  /** Page-global word index (only meaningful when `isWord`; else -1). */
  wordIndex: number;
  /** `${pageIndex}:${wordIndex}` (only set for words; else ""). */
  id: string;
}

/** Words = letter/number runs (keeping internal apostrophes/hyphens); anything
 *  else is a separator run. The two alternatives tile the whole string. */
export const TOKEN_RE = /[\p{L}\p{N}][\p{L}\p{N}'’-]*|[^\p{L}\p{N}]+/gu;

/**
 * Tokenize the page's paragraphs, assigning a page-global word index that
 * increments across paragraph boundaries. Returns the per-paragraph token rows
 * (for rendering) plus the total word count (for the roving-tabindex bounds).
 */
export function tokenizePage(
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
