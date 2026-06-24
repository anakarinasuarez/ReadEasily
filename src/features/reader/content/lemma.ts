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
  /** The meaning in the loaded language, or a "pending" note on a miss. */
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
 * Common irregular surface→base forms that no suffix rule recovers. The glossary
 * is keyed by base lemma (e.g. "run", "fly", "good"), so a tap on "ran"/"flew"/
 * "better" must map back. Compact — the regular rules in `candidateLemmas`
 * handle the long tail (plurals, -ed, -ing, comparatives, doubled consonants).
 */
const IRREGULAR: Record<string, string> = {
  ran: "run", flew: "fly", saw: "see", went: "go", came: "come", took: "take",
  got: "get", made: "make", found: "find", thought: "think", said: "say",
  told: "tell", felt: "feel", kept: "keep", slept: "sleep", ate: "eat",
  drank: "drink", began: "begin", drove: "drive", rode: "ride", wrote: "write",
  gave: "give", knew: "know", grew: "grow", threw: "throw", held: "hold",
  heard: "hear", left: "leave", met: "meet", paid: "pay", sat: "sit",
  stood: "stand", won: "win", built: "build", sent: "send", spent: "spend",
  brought: "bring", bought: "buy", caught: "catch", taught: "teach",
  children: "child", men: "man", women: "woman", feet: "foot", teeth: "tooth",
  mice: "mouse", geese: "goose", better: "good", best: "good", worse: "bad",
  worst: "bad", leaves: "leaf", lives: "life", wolves: "wolf", knives: "knife",
};

/**
 * Candidate base lemmas for a normalized surface word, most-specific first.
 * English is lightly inflected, so a few suffix rules + an irregular map recover
 * the base form a base-lemma glossary is keyed by ("stones"→"stone",
 * "carried"→"carry", "running"→"run", "ran"→"run").
 */
export function candidateLemmas(key: string): string[] {
  const out: string[] = [key];
  const push = (c: string) => {
    if (c.length >= 2 && !out.includes(c)) out.push(c);
  };
  if (IRREGULAR[key]) push(IRREGULAR[key]);
  const rules: Array<[string, string[]]> = [
    ["ies", ["y"]], ["ied", ["y"]], ["ies", [""]],
    ["es", [""]], ["ed", ["", "e"]], ["ing", ["", "e"]],
    ["er", ["", "e"]], ["est", ["", "e"]], ["s", [""]], ["'s", [""]],
  ];
  for (const [suf, reps] of rules) {
    if (key.endsWith(suf) && key.length - suf.length >= 2) {
      for (const r of reps) push(key.slice(0, key.length - suf.length) + r);
    }
  }
  // Doubled final consonant: "running"→"run", "bigger"→"big", "stopped"→"stop".
  const m = /^(.*?)([bcdfghjklmnpqrstvwz])\2(ing|ed|er|est)$/.exec(key);
  if (m) push(m[1] + m[2]);
  return out;
}

/**
 * Resolve a surface word against a glossary. Always returns a usable meaning so
 * the popover never crashes. Tries the exact normalized form first, then light
 * lemmatization (suffix rules + irregulars) so inflected words still resolve
 * against a base-lemma glossary; a true miss yields the pending note.
 */
export function lookupWord(glossary: Glossary, surface: string): WordMeaning {
  const key = normalizeLemma(surface);
  for (const cand of candidateLemmas(key)) {
    const entry: GlossaryEntry | undefined = glossary[cand];
    if (entry) {
      return {
        lemma: cand,
        translation: entry.translation,
        pos: entry.pos,
        phonetic: entry.ipa,
        found: true,
      };
    }
  }
  return { lemma: key, translation: PENDING_TRANSLATION, found: false };
}
