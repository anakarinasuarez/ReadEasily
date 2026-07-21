import { useQuery } from "@tanstack/react-query";
import { getWordTranslation, translationQueryKey } from "../api/getTranslation";
import { DEFAULT_LANGUAGE, type Language, type TranslationResponse } from "../types";

/**
 * The Reader's single-word translation FALLBACK seam. Wraps
 * `GET /api/translate/:word?lang=` in a TanStack Query so the popover reads
 * server state (pending / error / data) declaratively and never owns a loading
 * boolean.
 *
 * It is the SECOND tier of the tap-a-word cascade: the caller resolves the
 * glossary first and only enables this query on a MISS (and never when
 * translation is off). `enabled` therefore encodes the whole cascade contract —
 * a glossary hit is `enabled: false`, so Gemini is never called for a curated
 * word.
 *
 * `networkMode: "always"` is deliberate and load-bearing: without it a query
 * that TanStack thinks is offline is left `paused`, and the popover would hang
 * on its loading skeleton forever (the same footgun that stalled Profile). The
 * fetch is the source of truth for connectivity here, not the browser's online
 * flag.
 *
 * Only a REAL translation is ever cached: `getWordTranslation` throws on a soft
 * `found:false` (see there), so a no-key/timeout/parse failure lands in the
 * error state (Retry, no cached data) rather than being retained warmly for an
 * hour. A resolved, real translation IS stable per word+lang, so the long
 * `staleTime`/`gcTime` keep a re-tap of the same word instant.
 */
export function useWordTranslation(
  word: string,
  language: Language = DEFAULT_LANGUAGE,
  enabled = true,
) {
  return useQuery<TranslationResponse>({
    queryKey: translationQueryKey(word, language),
    queryFn: () => getWordTranslation(word, language),
    enabled: enabled && word.trim() !== "",
    // Never leave the query paused-offline (would hang the skeleton).
    networkMode: "always",
    // A word's meaning doesn't change; keep it fresh for the session and warm
    // in the cache so re-tapping the same word is instant.
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
