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
 * A word with no precomputed sample still resolves successfully with
 * `found: false` + `sentences: []` (HTTP 200), so the overlay shows its graceful
 * empty state instead of an error.
 */
export function usePractice(word: string, nonce = 0, enabled = true) {
  return useQuery<PracticeResponse>({
    queryKey: practiceQueryKey(word, nonce),
    queryFn: () => getPracticeSentences(word, nonce),
    enabled: enabled && word.trim() !== "",
  });
}
