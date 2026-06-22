import { useQuery } from "@tanstack/react-query";
import { getLibrary, libraryQueryKey } from "../api/getLibrary";
import type { LibraryData } from "../types";

/**
 * The Library feature's single data seam. Wraps the `/api/library` fetcher in a
 * TanStack Query so the screen reads server state (pending / error / data) the
 * declarative way and never owns a loading boolean. The cache key is imported
 * from the api module so it can never drift from other readers of this query.
 *
 * Today MSW answers the request (dev + tests); swapping in Supabase is a change
 * inside `getLibrary`, invisible here — see `../api/getLibrary.ts`.
 */
export function useLibrary() {
  return useQuery<LibraryData>({
    queryKey: libraryQueryKey,
    queryFn: getLibrary,
  });
}
