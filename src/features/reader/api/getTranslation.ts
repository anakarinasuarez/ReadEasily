import { normalizeLemma } from "../content/lemma";
import { DEFAULT_LANGUAGE, type Language, type TranslationResponse } from "../types";

/**
 * The single-word translation read seam — a thin, typed network boundary
 * mirroring `getPracticeSentences()`.
 *
 * `getWordTranslation(word, lang)` fetches `GET /api/translate/:word?lang=` and
 * returns a typed `TranslationResponse`. The MSW mock resolves a deterministic
 * stub in tests and passes through to the REAL route (Gemini) in the browser;
 * callers go through `useWordTranslation` and never know which. Used ONLY as the
 * Reader's glossary-miss fallback, so it's requested lazily (see the hook's
 * `enabled` gate), never for a glossary hit.
 *
 * A soft failure (HTTP 200 `{found:false}` — what the route returns on no key /
 * timeout / parse error) is THROWN, not returned: the route deliberately does
 * NOT cache a miss so the next tap retries, and only an error (never a cached
 * success) honors that. Throwing lands the query in its error state → the
 * popover offers Retry, and re-tap/Retry actually re-queries instead of reading
 * a warmly-cached dead-end. So the resolved value is always a real translation.
 */
export async function getWordTranslation(
  word: string,
  language: Language = DEFAULT_LANGUAGE,
): Promise<TranslationResponse> {
  const res = await fetch(
    `/api/translate/${encodeURIComponent(word)}?lang=${encodeURIComponent(language)}`,
  );
  if (!res.ok) {
    throw new Error(
      `getWordTranslation failed: ${res.status} ${res.statusText}`,
    );
  }
  const data = (await res.json()) as TranslationResponse;
  if (!data.found) {
    // Treat "no translation available" exactly like a transport failure: an
    // error the popover can retry, and one React Query will not cache as data.
    throw new Error(`getWordTranslation: no translation for "${word}"`);
  }
  return data;
}

/** Stable per-word+language cache key. Keyed by the LEMMA (same normalization the
 *  route caches by) so inflected surfaces that share a lemma dedupe to one query.
 *  Import so query + invalidation agree. */
export function translationQueryKey(
  word: string,
  language: Language = DEFAULT_LANGUAGE,
): readonly ["translation", string, Language] {
  return ["translation", normalizeLemma(word) || word.toLowerCase(), language] as const;
}
