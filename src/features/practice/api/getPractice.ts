import type { PracticeResponse } from "../types";
import type { NewSavedWord } from "@/features/reader/types";
import type { SavedWord } from "@/features/saved/types";

/**
 * The Practice read seam — a thin, typed network boundary mirroring
 * `getStory()` / `getSaved()`.
 *
 * `getPracticeSentences(word, nonce)` fetches `GET /api/practice/:word` and
 * returns a typed `PracticeResponse`; the MSW mock resolves the precomputed
 * sample (via the Reader's lemma matching) today, a real backend / generator
 * returns the same shape tomorrow. Callers go through `usePractice` and never
 * know which.
 *
 * `nonce` lets "New sentences" re-request a visibly different ordering: the mock
 * deterministically shuffles by the nonce. It is part of the cache key so each
 * press is a fresh query. Real regeneration plugs in behind this same seam —
 * the nonce becomes the generation request, the response shape is unchanged.
 */
export async function getPracticeSentences(
  word: string,
  nonce = 0,
): Promise<PracticeResponse> {
  const res = await fetch(
    `/api/practice/${encodeURIComponent(word)}?nonce=${encodeURIComponent(String(nonce))}`,
  );
  if (!res.ok) {
    throw new Error(
      `getPracticeSentences failed: ${res.status} ${res.statusText}`,
    );
  }
  return (await res.json()) as PracticeResponse;
}

/** Stable per-word+nonce cache key. Import so query + invalidation agree. */
export function practiceQueryKey(
  word: string,
  nonce = 0,
): readonly ["practice", string, number] {
  return ["practice", word.toLowerCase(), nonce] as const;
}

/**
 * Mark an already-saved word as having ready practice sentences — the write seam
 * behind "Save to practice later" when the word is already in the Saved list.
 * PATCHes `/api/saved/:id` with the new `sentencesReady` count and echoes the
 * updated `SavedWord` (so the Saved screen flips "Practice" → "Review").
 */
export async function markPracticeReady(
  id: string,
  sentencesReady: number,
): Promise<SavedWord> {
  const res = await fetch(`/api/saved/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sentencesReady }),
  });
  if (!res.ok) {
    throw new Error(`markPracticeReady failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as SavedWord;
}

/**
 * Save a brand-new word WITH ready practice sentences — the write seam behind
 * "Save to practice later" when the word isn't saved yet. POSTs a `NewSavedWord`
 * (carrying `sentencesReady > 0`) to `/api/saved`; the backend assigns the id
 * and echoes the created `SavedWord`. Reuses the same endpoint as the popover's
 * Save so the two write paths can never drift.
 */
export async function savePracticeWord(word: NewSavedWord): Promise<SavedWord> {
  const res = await fetch("/api/saved", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(word),
  });
  if (!res.ok) {
    throw new Error(`savePracticeWord failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as SavedWord;
}
