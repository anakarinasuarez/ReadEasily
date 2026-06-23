import { SearchScreen } from "@/features/search/components";

/**
 * Search route `/search` — browse stories by category. This stays a Server
 * Component; the interactive, data-bound screen is the client boundary
 * (SearchScreen reads the catalog via TanStack Query against the MSW-mocked
 * `/api/search`). The route reads the `?category=` deep-link (set by the
 * CategoryGrid's progressive-enhancement hrefs / open-in-new-tab) and seeds the
 * screen's initial view from it; SearchScreen validates the value. The app-wide
 * QueryClient provider lives in `src/app/providers.tsx` (wrapped in the root
 * layout), so no provider is duplicated here.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  const initialCategory = Array.isArray(category) ? category[0] : category;
  return <SearchScreen initialCategory={initialCategory} />;
}
