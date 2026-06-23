import { useQuery } from "@tanstack/react-query";
import { getSaved, savedQueryKey } from "../api/getSaved";
import type { SavedData } from "../types";

/**
 * The Saved feature's read seam. Wraps the `/api/saved` fetcher in a TanStack
 * Query so the screen reads server state (pending / error / data) the
 * declarative way and never owns a loading boolean. The cache key is imported
 * from the api module so it can never drift from the remove mutation that
 * mutates the same cache.
 *
 * Today MSW answers the request (dev + tests); swapping in Supabase is a change
 * inside `getSaved`, invisible here — see `../api/getSaved.ts`.
 */
export function useSaved() {
  return useQuery<SavedData>({
    queryKey: savedQueryKey,
    queryFn: getSaved,
  });
}
