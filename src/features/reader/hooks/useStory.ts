import { useQuery } from "@tanstack/react-query";
import { getStory, storyQueryKey } from "../api/getStory";
import { DEFAULT_LANGUAGE, type Language, type Story } from "../types";

/**
 * The Reader's read seam. Wraps the `/api/story/:id?lang=` fetcher in TanStack
 * Query so the screen reads server state (pending / error / data) declaratively
 * and never owns a loading boolean. The cache key is per-story AND per-language,
 * so switching language refetches that language's payload (and a previously
 * loaded language stays warm in the cache for an instant switch back).
 *
 * Today MSW answers the request (dev + tests); swapping in Supabase is a change
 * inside `getStory`, invisible here.
 */
export function useStory(id: string, language: Language = DEFAULT_LANGUAGE) {
  return useQuery<Story>({
    queryKey: storyQueryKey(id, language),
    queryFn: () => getStory(id, language),
    // Keep the previous language's data on screen while the next loads, so a
    // language switch re-renders in place (no skeleton flash, scroll preserved).
    placeholderData: (prev) => prev,
  });
}
