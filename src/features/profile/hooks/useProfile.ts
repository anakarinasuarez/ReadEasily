import { useQuery } from "@tanstack/react-query";
import { getProfile, profileQueryKey } from "../api/getProfile";
import type { ProfileData } from "../types";

/**
 * The Profile feature's read seam. Wraps the `/api/profile` fetcher in a
 * TanStack Query so the screen reads server state (pending / error / data) the
 * declarative way and never owns a loading boolean. The cache key is imported
 * from the api module so it can never drift.
 *
 * Today MSW answers the request (dev + tests); swapping in Supabase is a change
 * inside `getProfile`, invisible here — see `../api/getProfile.ts`.
 */
export function useProfile() {
  return useQuery<ProfileData>({
    queryKey: profileQueryKey,
    queryFn: getProfile,
  });
}
