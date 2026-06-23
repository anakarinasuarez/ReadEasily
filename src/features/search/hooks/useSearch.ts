import { useQuery } from "@tanstack/react-query";
import { getSearch, searchQueryKey } from "../api/getSearch";
import type { SearchData } from "../types";

/**
 * The Search feature's single data seam. Wraps the `/api/search` fetcher in a
 * TanStack Query so the screen reads server state (pending / error / data) the
 * declarative way and never owns a loading boolean. The cache key is imported
 * from the api module so it can never drift from other readers.
 *
 * Today MSW answers the request (dev + tests); swapping in Supabase is a change
 * inside `getSearch`, invisible here — see `../api/getSearch.ts`.
 */
export function useSearch() {
  return useQuery<SearchData>({
    queryKey: searchQueryKey,
    queryFn: getSearch,
  });
}
