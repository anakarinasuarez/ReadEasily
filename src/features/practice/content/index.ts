/**
 * The precomputed practice sample corpus, assembled at build time.
 *
 * The 14 sample files (`src/content/practice/<word>.json`) are imported
 * directly — JSON is supported natively by every bundler this module runs under
 * (Vitest/Vite, Next/Turbopack, the MSW browser worker), the same pattern the
 * reader uses for its translation sidecars (see `reader/content/raw.ts`).
 *
 * Lookups go through `resolvePracticeSet`, which reuses the Reader's lemma
 * matching (`normalizeLemma` + `candidateLemmas`) so a tap on an inflected
 * surface ("paths", "running") still resolves to the base-word sample
 * ("path", "run"). A word with no sample resolves to `null` — the caller (the
 * MSW handler) turns that into a graceful `found: false` response.
 *
 * TODO(practice-generation): real "generate sentences for ANY word" plugs in
 * here — when `resolvePracticeSet` misses, call the generator instead of
 * returning null. The network seam (`GET /api/practice/:word`) and the entire
 * overlay stay unchanged; only this resolver gains a fallback branch.
 */
import { candidateLemmas, normalizeLemma } from "@/features/reader/content/lemma";
import type { PracticeSet } from "../types";

import city from "@/content/practice/city.json";
import friend from "@/content/practice/friend.json";
import happy from "@/content/practice/happy.json";
import key from "@/content/practice/key.json";
import lost from "@/content/practice/lost.json";
import morning from "@/content/practice/morning.json";
import mountain from "@/content/practice/mountain.json";
import path from "@/content/practice/path.json";
import phone from "@/content/practice/phone.json";
import robot from "@/content/practice/robot.json";
import run from "@/content/practice/run.json";
import slow from "@/content/practice/slow.json";
import train from "@/content/practice/train.json";
import water from "@/content/practice/water.json";

/** Word (base lemma) → its precomputed sample set. Keys are lowercase lemmas. */
export const PRACTICE_SAMPLES: Record<string, PracticeSet> = {
  city,
  friend,
  happy,
  key,
  lost,
  morning,
  mountain,
  path,
  phone,
  robot,
  run,
  slow,
  train,
  water,
};

/** The words that have a precomputed sample (handy for tests / dev sanity). */
export function listPracticeWords(): string[] {
  return Object.keys(PRACTICE_SAMPLES);
}

/**
 * Resolve a surface/saved word to its precomputed `PracticeSet`, or `null` if
 * none exists. Tries the exact normalized form first, then light lemmatization
 * (suffix rules + irregulars via `candidateLemmas`) so inflected taps match the
 * base-word sample. Pure — same result in node (tests) and the browser worker.
 */
export function resolvePracticeSet(word: string): PracticeSet | null {
  const key = normalizeLemma(word);
  if (key === "") return null;
  for (const candidate of candidateLemmas(key)) {
    const set = PRACTICE_SAMPLES[candidate];
    if (set) return set;
  }
  return null;
}
