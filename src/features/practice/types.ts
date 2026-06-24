/**
 * Practice data contract — the typed shape the Practice overlay consumes.
 *
 * Mirrors the Library/Search/Saved/Reader contract style: these types are the
 * single source of truth for the seam between frontend and backend. Today the
 * bytes come from an MSW mock of `GET /api/practice/:word` that loads a
 * precomputed sample file (`src/content/practice/<word>.json`); later a backend
 * (or an LLM that generates per-word sentences) returns the SAME shape. A rename
 * surfaces as a type error here and in every reader — by design.
 *
 * The overlay shows "10 sentences with this word": each sentence is the English
 * example plus its translation in three languages, so the active Reader language
 * (es | fr | pt) picks the line to display.
 */
import type { Language } from "@/features/reader/types";

/**
 * One practice sentence: the English example plus a translation per supported
 * language. The three language fields mirror the story sidecar shape so a future
 * generator can fill them the same way.
 */
export interface PracticeSentence {
  /** The English example sentence (contains the target word, possibly inflected). */
  en: string;
  /** Spanish translation. */
  es: string;
  /** French translation. */
  fr: string;
  /** Portuguese translation. */
  pt: string;
}

/** The full precomputed set for one word — the on-disk sample file shape. */
export interface PracticeSet {
  /** The base (lemma) word these sentences practise. */
  word: string;
  /** Always 10 sentences in the sample corpus (the overlay renders all of them). */
  sentences: PracticeSentence[];
}

/**
 * The payload `getPracticeSentences()` returns (and `GET /api/practice/:word`
 * serves). `found` is `false` (with `sentences: []`) for any word with no
 * precomputed sample — the overlay degrades to a friendly empty state rather
 * than crashing or rendering zero broken cards.
 */
export interface PracticeResponse {
  /** The word the set was resolved for (the matched base lemma, or the request). */
  word: string;
  /** True when a precomputed sample backed the response. */
  found: boolean;
  /** The sentences (10 when `found`, empty otherwise). */
  sentences: PracticeSentence[];
}

/** Pick the translation line for the active Reader language. */
export function translationFor(
  sentence: PracticeSentence,
  language: Language,
): string {
  return sentence[language];
}
