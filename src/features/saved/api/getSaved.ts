import type { SavedData } from "../types";

/**
 * The Saved data contract — a thin, typed network boundary, mirroring
 * `getSearch()` / `getLibrary()`.
 *
 * `getSaved()` fetches `/api/saved` and returns a typed `SavedData`; this is the
 * ONLY read seam the frontend touches. The TanStack Query hook calls it via
 * `useQuery({ queryKey: savedQueryKey, queryFn: getSaved })` and never knows
 * whether the bytes came from the MSW mock (today) or Supabase (later).
 *
 * Swap path to real backend: replace the `fetch` bodies with Supabase queries
 * shaped into `SavedData` / a `DELETE` while keeping these exact signatures.
 * Callers and their cache keys don't change.
 */
export async function getSaved(): Promise<SavedData> {
  const res = await fetch("/api/saved");
  if (!res.ok) {
    throw new Error(`getSaved failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as SavedData;
}

/**
 * Unsave a word — the write seam behind the card's remove button. Returns once
 * the word is gone server-side; the UI applies the change optimistically first
 * (see `useRemoveSavedWord`) and rolls back if this rejects.
 */
export async function removeSavedWord(id: string): Promise<void> {
  const res = await fetch(`/api/saved/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`removeSavedWord failed: ${res.status} ${res.statusText}`);
  }
}

/** Stable cache key for the Saved query — import so it never drifts. */
export const savedQueryKey = ["saved"] as const;
