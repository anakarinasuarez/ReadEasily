/**
 * Input validation for the practice `[word]` param — the abuse/cost guard for
 * the practice seam (`GET /api/practice/:word`).
 *
 * A practice target is a single English word or short lemma. Today the seam is
 * served by an MSW mock doing a local dictionary lookup (no cost), but it is the
 * documented plug-in point for a real per-word sentence GENERATOR (Gemini — see
 * `GEMINI_API_KEY` in `.env.example`). That makes the `[word]` param a future
 * money/compute lever: an unbounded or garbage value forwarded to a paid API is
 * a billing/DoS vector and a prompt-injection surface.
 *
 * This validator is the single contract both the current mock handler and the
 * future real route MUST apply before any lookup or generation, so an oversized
 * or non-word value is rejected at the boundary (fail closed) rather than
 * forwarded. Keep it pure so node (tests) and the browser worker agree.
 */

/**
 * Hard cap on the accepted word length. A real word/lemma is well under this;
 * 64 chars bounds anything sent over the wire or forwarded to a paid generator
 * while leaving generous room for hyphenated or accented forms.
 */
export const MAX_PRACTICE_WORD_LENGTH = 64;

/**
 * True when `word` is a plausible practice target: a string that, once trimmed,
 * is non-empty, within {@link MAX_PRACTICE_WORD_LENGTH}, and contains ONLY
 * letters (any script, plus combining accent marks), spaces, apostrophes or
 * hyphens. This rejects control characters, angle brackets / markup, digits,
 * and oversized blobs — i.e. everything that has no business being a word and
 * could carry an injection payload or inflate a generator bill.
 */
export function isValidPracticeWord(word: unknown): word is string {
  if (typeof word !== "string") return false;
  const trimmed = word.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_PRACTICE_WORD_LENGTH) {
    return false;
  }
  // Unicode letters + combining marks, plus the only punctuation real words use.
  return /^[\p{L}\p{M}'’\- ]+$/u.test(trimmed);
}

/**
 * Coerce the `nonce` query param to a safe, non-negative integer (the
 * "New sentences" re-request key). Anything non-numeric, negative, fractional
 * or absurdly large collapses to 0 so it can't drive unbounded work or a
 * pathological shuffle. Bounded to a generous ceiling.
 */
export function parsePracticeNonce(raw: string | null): number {
  const n = Number(raw ?? "0");
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), 1_000_000);
}
