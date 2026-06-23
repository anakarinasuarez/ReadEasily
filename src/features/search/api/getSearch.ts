import type { SearchData } from "../types";

/**
 * The Search data contract — a thin, typed network boundary, mirroring
 * `getLibrary()`.
 *
 * `getSearch()` fetches `/api/search` and returns a typed `SearchData`. This is
 * the ONLY seam the frontend touches: the TanStack Query hook calls it via
 * `useQuery({ queryKey: searchQueryKey, queryFn: getSearch })` and never knows
 * whether the bytes came from the MSW mock (today) or Supabase (later).
 *
 * Swap path to real backend: replace the `fetch` body with a Supabase query
 * shaped into `SearchData` while keeping this exact signature. Callers and their
 * cache keys don't change.
 */
export async function getSearch(): Promise<SearchData> {
  const res = await fetch("/api/search");
  if (!res.ok) {
    throw new Error(`getSearch failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as SearchData;
}

/** Stable cache key for the Search query — import so it never drifts. */
export const searchQueryKey = ["search"] as const;
