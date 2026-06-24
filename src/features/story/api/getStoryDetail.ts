import type { StoryDetail } from "../types";

/**
 * The Story Detail data contract — a thin, typed network boundary.
 *
 * `getStoryDetail(id)` fetches `GET /api/story/:id/detail` and returns a typed
 * `StoryDetail`. This is the ONLY seam the frontend touches: a TanStack Query
 * hook calls it (see `../hooks/useStoryDetail.ts`) and never knows whether the
 * bytes came from the MSW mock (today) or Supabase (later).
 *
 * NOTE: this is a DISTINCT endpoint from `/api/story/:id` (the heavy, paginated
 * Reader payload). Story Detail needs only the lightweight catalog + key-words +
 * moral, so it has its own slim endpoint.
 *
 * Swap path to a real backend: replace the `fetch` body with a Supabase query
 * shaped into `StoryDetail` while keeping this exact signature. Callers and
 * their cache keys don't change.
 */
export async function getStoryDetail(id: string): Promise<StoryDetail> {
  const res = await fetch(`/api/story/${encodeURIComponent(id)}/detail`);
  if (!res.ok) {
    throw new Error(
      `getStoryDetail(${id}) failed: ${res.status} ${res.statusText}`,
    );
  }
  return (await res.json()) as StoryDetail;
}

/** Stable cache key for one story's detail — import so it never drifts. */
export const storyDetailQueryKey = (id: string) =>
  ["story-detail", id] as const;
