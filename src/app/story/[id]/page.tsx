import { StoryDetailScreen } from "@/features/story/components";

/**
 * Story Detail route `/story/[id]` — the bridge between the catalog cards
 * (which now land here) and the reader. This stays a Server Component; the
 * interactive, data-bound screen is the client boundary (StoryDetailScreen
 * reads the detail via TanStack Query against the MSW-mocked
 * `/api/story/:id/detail`). The app-wide QueryClient provider lives in
 * `src/app/providers.tsx` (wrapped in the root layout), so no provider is
 * duplicated here. The route's only job is to read the `[id]` param and mount
 * the screen.
 */
export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Key by id so navigating between stories remounts the screen — a fresh mount
  // resets any local state with no reset effect.
  return <StoryDetailScreen key={id} storyId={id} />;
}
