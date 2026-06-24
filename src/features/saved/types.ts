/**
 * Saved data contract — the typed shape the Saved feature consumes.
 *
 * Mirrors the Library/Search contract style (see
 * `src/features/library/types.ts`): these types are the single source of truth
 * for the seam between frontend and backend. Today the bytes come from an MSW
 * mock of `/api/saved`; later a Supabase-backed `getSaved()` returns the SAME
 * shape. A column rename surfaces as a type error here and in every reader — by
 * design.
 *
 * The Saved screen lists vocabulary words a reader kept while reading, newest
 * first, with two header stats. There is NO filter/sort UI in Figma, so the
 * contract is intentionally flat — words + derived stats, nothing else.
 */

/** One saved vocabulary word, 1:1 with the Figma "Saved Word Card". */
export interface SavedWord {
  /** Stable id — list key, remove target, and the `data-word-id` focus hook. */
  id: string;
  /** The saved word, shown large (Display) on the card. */
  word: string;
  /** Optional IPA / phonetic spelling (Lora italic). Rendered only when set. */
  phonetic?: string;
  /** Translation — senses comma-joined, e.g. "sendero, camino". */
  translation: string;
  /** Id of the story the word was saved from — the card links to its Story
   *  Detail (`/story/${id}`). */
  sourceStoryId: string;
  /** Source-story title shown (truncated) in the card footer. */
  sourceStoryTitle: string;
  /** Count of ready practice sentences. `>0` → badge + "Review"; `0` → "Practice". */
  sentencesReady: number;
  /** ISO timestamp the word was saved — default sort is `savedAt` desc. */
  savedAt: string;
}

/**
 * The two header stat pills. Both are DERIVED from `words` (so they can never
 * drift from the list): `wordsToReview` is the word count; `practiceSets` is how
 * many words have ready sentences (`sentencesReady > 0`).
 */
export interface SavedStats {
  /** Numeral for the "words to review" pill (accent tone) = `words.length`. */
  wordsToReview: number;
  /** Numeral for the "practice sets" pill (warning tone) = count(sentencesReady>0). */
  practiceSets: number;
}

/** The full payload the Saved screen renders. */
export interface SavedData {
  /** Saved words, newest first (`savedAt` desc). Empty → the EmptyState. */
  words: SavedWord[];
  /** Header stats, derived from `words`. */
  stats: SavedStats;
}

/**
 * Recompute the header stats from a word list. Lives in the contract module so
 * the mock (server side) and the optimistic-remove updater (client side) derive
 * the pills the exact same way — they can never disagree.
 */
export function deriveSavedStats(words: SavedWord[]): SavedStats {
  return {
    wordsToReview: words.length,
    practiceSets: words.filter((w) => w.sentencesReady > 0).length,
  };
}
