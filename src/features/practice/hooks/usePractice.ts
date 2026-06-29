import { useQuery } from "@tanstack/react-query";
import { getPracticeSentences, practiceQueryKey } from "../api/getPractice";
import type { PracticeResponse } from "../types";

/**
 * The Practice feature's read seam. Wraps `GET /api/practice/:word` in a
 * TanStack Query so the overlay reads server state (pending / error / data) the
 * declarative way and never owns a loading boolean.
 *
 * `nonce` is part of the cache key: "New sentences" bumps it, which is a fresh
 * query (the mock returns a shuffled ordering) so the list visibly refreshes.
 * `enabled` gates the fetch on an actually-open overlay with a word — closing
 * the overlay (or no word) means no request.
 *
 * Every word resolves successfully (HTTP 200) with `found: true`: a precomputed
 * sample when one exists, otherwise template-generated sentences. `translation`
 * (the word's gloss in the active language) is forwarded so the template
 * fallback can render a real translation line; it doesn't affect a precomputed
 * hit. It is intentionally NOT part of the cache key — the gloss is stable per
 * word, so it never needs to drive a refetch.
 */
export function usePractice(
  word: string,
  nonce = 0,
  enabled = true,
  translation?: string,
) {
  return useQuery<PracticeResponse>({
    queryKey: practiceQueryKey(word, nonce),
    queryFn: () => getPracticeSentences(word, nonce, translation),
    enabled: enabled && word.trim() !== "",
  });
}
