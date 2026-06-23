import type { StoryPage } from "../types";
import { tokenizePage } from "../content/tokenize";

/**
 * Sentence model for audio playback.
 *
 * Web Speech word-level `onboundary` events are unreliable across browsers, so
 * the Reader plays and highlights ONE SENTENCE at a time. This derives the
 * sentences of a page from its paragraphs, using the SAME tokenizer the visible
 * passage uses — so each sentence carries the inclusive page-global word-index
 * range of its words, which maps directly onto the rendered `WordToken`s for the
 * karaoke highlight.
 *
 * Boundaries: a sentence ends at `.`, `!` or `?` (inside a separator run) and at
 * every paragraph break. Runs of separators with no words are dropped.
 */
export interface ReaderSentence {
  /** 0-based sentence index within the page. */
  index: number;
  /** The text handed to the TTS engine (trimmed). */
  text: string;
  /** First word's page-global index. */
  firstWordIndex: number;
  /** Last word's page-global index (inclusive). */
  lastWordIndex: number;
  /** All page-global word indices in this sentence, in order. */
  wordIndices: number[];
}

/** True when a separator run closes a sentence (contains . ! or ?). */
const SENTENCE_END_RE = /[.!?]/;

/** Build the ordered sentences of a page. */
export function buildSentences(page: StoryPage): ReaderSentence[] {
  const { paraTokens } = tokenizePage(page.paragraphs, page.index);
  const sentences: ReaderSentence[] = [];

  let words: number[] = [];
  let buffer = "";

  const flush = () => {
    const text = buffer.trim();
    if (words.length > 0 && text.length > 0) {
      sentences.push({
        index: sentences.length,
        text,
        firstWordIndex: words[0],
        lastWordIndex: words[words.length - 1],
        wordIndices: words,
      });
    }
    words = [];
    buffer = "";
  };

  for (const tokens of paraTokens) {
    for (const token of tokens) {
      buffer += token.text;
      if (token.isWord) {
        words.push(token.wordIndex);
      } else if (SENTENCE_END_RE.test(token.text)) {
        flush();
      }
    }
    // A paragraph break always closes the current sentence.
    flush();
  }

  return sentences;
}
