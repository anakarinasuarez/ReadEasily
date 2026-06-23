/**
 * Word-key + glossary lookup helpers — deliberately corpus-free so a client
 * component can import them without pulling the whole Markdown corpus (raw.ts)
 * into the browser bundle. `loader.ts` re-uses `normalizeLemma` from here so the
 * tokenizer and the lookup can never key a word differently.
 */
import type { Glossary, GlossaryEntry } from "../types";

/**
 * Normalize a surface word to its glossary key: lowercased, with leading and
 * trailing non-letter/digit characters stripped (so "path," → "path" and
 * "\"Look" → "look"). Internal apostrophes/hyphens are kept ("don't", "well-fed").
 */
export function normalizeLemma(surface: string): string {
  return surface
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/[^\p{L}\p{N}]+$/u, "");
}

/** The resolved meaning for a tapped word (whether or not the glossary had it). */
export interface WordMeaning {
  /** The normalized key looked up. */
  lemma: string;
  /** Spanish meaning, or a "pending" note when the glossary lacks the word. */
  translation: string;
  /** Part of speech, when known. */
  pos?: string;
  /** IPA pronunciation, when known. */
  phonetic?: string;
  /** True when a real glossary entry backed the meaning. */
  found: boolean;
}

/** Shown when a word has no glossary entry (or the story has no sidecar). */
export const PENDING_TRANSLATION = "(traducción pendiente)";

/**
 * Resolve a surface word against a glossary. Always returns a usable meaning so
 * the popover never crashes: a miss yields the pending note with `found:false`.
 */
export function lookupWord(glossary: Glossary, surface: string): WordMeaning {
  const lemma = normalizeLemma(surface);
  const entry: GlossaryEntry | undefined = glossary[lemma];
  if (!entry) {
    return { lemma, translation: PENDING_TRANSLATION, found: false };
  }
  return {
    lemma,
    translation: entry.es,
    pos: entry.pos,
    phonetic: entry.ipa,
    found: true,
  };
}
