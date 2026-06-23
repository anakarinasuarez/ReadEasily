import { useQuery } from "@tanstack/react-query";
import { getStory, storyQueryKey } from "../api/getStory";
import type { Story } from "../types";

/**
 * The Reader's read seam. Wraps the `/api/story/:id` fetcher in TanStack Query
 * so the screen reads server state (pending / error / data) declaratively and
 * never owns a loading boolean. The cache key is per-story so navigating between
 * stories doesn't show stale text.
 *
 * Today MSW answers the request (dev + tests); swapping in Supabase is a change
 * inside `getStory`, invisible here.
 */
export function useStory(id: string) {
  return useQuery<Story>({
    queryKey: storyQueryKey(id),
    queryFn: () => getStory(id),
  });
}
