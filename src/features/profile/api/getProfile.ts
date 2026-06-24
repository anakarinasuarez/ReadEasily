import type { ProfileData } from "../types";

/**
 * The Profile read seam — a thin, typed network boundary, mirroring
 * `getSaved()` / `getLibrary()`.
 *
 * `getProfile()` fetches `/api/profile` and returns a typed `ProfileData`; this
 * is the ONLY read seam the frontend touches. The TanStack Query hook calls it
 * via `useQuery({ queryKey: profileQueryKey, queryFn: getProfile })` and never
 * knows whether the bytes came from the MSW mock (today) or Supabase (later).
 *
 * Swap path to real backend: replace the `fetch` body with a Supabase query
 * shaped into `ProfileData` while keeping this exact signature. Callers and
 * their cache key don't change. (Preferences are NOT fetched here — they live
 * in the persisted `usePreferences` store.)
 */
export async function getProfile(): Promise<ProfileData> {
  const res = await fetch("/api/profile");
  if (!res.ok) {
    throw new Error(`getProfile failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as ProfileData;
}

/** Stable cache key for the Profile query — import so it never drifts. */
export const profileQueryKey = ["profile"] as const;
