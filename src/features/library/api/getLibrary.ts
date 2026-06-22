import type { LibraryData } from "../types";

/**
 * The Library data contract — a thin, typed network boundary.
 *
 * `getLibrary()` fetches `/api/library` and returns a typed `LibraryData`.
 * This is the ONLY seam the frontend touches: TanStack Query hooks call it via
 * `useQuery({ queryKey: ['library'], queryFn: getLibrary })` and never know
 * whether the bytes came from the MSW mock (today) or Supabase (later).
 *
 * Swap path to real backend: replace the `fetch` body below with a Supabase
 * query (e.g. `supabase.from('books').select(...)` shaped into `LibraryData`)
 * while keeping this exact signature. Callers and their cache keys don't change.
 *
 * Note: relative `/api/library` resolves against the current origin in the
 * browser; if this ever runs in a server component, pass an absolute URL.
 */
export async function getLibrary(): Promise<LibraryData> {
  const res = await fetch("/api/library");
  if (!res.ok) {
    throw new Error(`getLibrary failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as LibraryData;
}

/** Stable cache key for the Library query — import so it never drifts. */
export const libraryQueryKey = ["library"] as const;
