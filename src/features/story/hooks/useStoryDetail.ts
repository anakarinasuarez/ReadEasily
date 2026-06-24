import { useQuery } from "@tanstack/react-query";
import { getStoryDetail, storyDetailQueryKey } from "../api/getStoryDetail";
import type { StoryDetail } from "../types";

/**
 * The Story Detail feature's single data seam. Wraps the
 * `/api/story/:id/detail` fetcher in a TanStack Query so the screen reads
 * server state (pending / error / data) the declarative way and never owns a
 * loading boolean. The cache key is imported from the api module so it can never
 * drift from other readers of this query.
 *
 * Today MSW answers the request (dev + tests); swapping in Supabase is a change
 * inside `getStoryDetail`, invisible here — see `../api/getStoryDetail.ts`.
 */
export function useStoryDetail(id: string) {
  return useQuery<StoryDetail>({
    queryKey: storyDetailQueryKey(id),
    queryFn: () => getStoryDetail(id),
  });
}
