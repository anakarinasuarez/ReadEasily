"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/section-header";
import { Navbar, type NavbarItem } from "@/components/navbar";
import { useNavbarAccount } from "@/hooks/useNavbarAccount";
import { EmptyState } from "@/components/empty-state";
import { SearchField } from "@/ui/search-field";
import { Button } from "@/ui/button";
import type { CategoryId } from "@/components/category-card";
import { useSearch } from "../hooks/useSearch";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { ActiveCategory } from "../types";
import { CategoryGrid } from "./CategoryGrid";
import { ResultsGrid } from "./ResultsGrid";
import { SearchError, SearchSkeleton } from "./SearchStates";
import {
  ChevronLeftIcon,
  LibraryIcon,
  RefreshIcon,
  SavedIcon,
  SearchIcon,
} from "./icons";

/**
 * SearchScreen — the Search route (`/search`), 1:1 with Figma "Screen / Search"
 * (132:129 / All variant 1282:4099). The screen has TWO modes:
 *
 *  • Browse (default) — pick one of the four category cards to filter the
 *    catalog, a same-screen morph (no route change). Deep-linkable via
 *    `?category=`.
 *  • Search — typing in the SearchField runs a live, debounced, case-insensitive
 *    substring search across the WHOLE catalog (title, and the category label as
 *    a bonus), ignoring the active category. Clearing the field returns to the
 *    browse view with the previously-selected category intact.
 *
 * This is the feature's one client component: it reads server state via
 * `useSearch` and owns the local UI state — the active category and the search
 * query. Loading / error / no-results are part of the slice.
 */

/** Primary nav — Search is the active destination on this screen. */
const NAV_ITEMS: NavbarItem[] = [
  { key: "library", label: "Library", icon: <LibraryIcon />, href: "/library" },
  { key: "search", label: "Search", icon: <SearchIcon />, href: "/search" },
  { key: "saved", label: "Saved", icon: <SavedIcon />, href: "/saved" },
];

/** Avatar placeholder shown only while the user payload is in flight (none on
 * this contract yet) — keeps the Navbar account affordance stable. */
const SCREEN_USER = { name: "Ana" };

/** Live-search debounce — filter on a settled query, not per-keystroke. */
const SEARCH_DEBOUNCE_MS = 280;

/**
 * The valid category ids, as a runtime list (the `satisfies` keeps it exhaustive
 * against the `CategoryId` union — adding a category to the type without adding
 * it here is a compile error). Used to validate the `?category=` deep-link.
 */
const CATEGORY_IDS = [
  "fables",
  "daily-life",
  "technology",
  "travel",
] as const satisfies readonly CategoryId[];

/** Coerce a raw `?category=` value into a valid view, defaulting to "all". */
function normalizeCategory(raw: string | undefined): ActiveCategory {
  return raw && (CATEGORY_IDS as readonly string[]).includes(raw)
    ? (raw as CategoryId)
    : "all";
}

export interface SearchScreenProps {
  /**
   * Initial active view, seeded from the route's `?category=` search param so a
   * deep-link / open-in-new-tab (the CategoryGrid escape hatch) lands on the
   * clicked category. Invalid or absent → the "All stories" view.
   */
  initialCategory?: string;
}

export function SearchScreen({ initialCategory }: SearchScreenProps) {
  // Navbar account wiring (identity + overrides, gated saved count, sign-out).
  const navbar = useNavbarAccount(SCREEN_USER);
  const { data, isPending, isError, refetch } = useSearch();

  // Local UI state #1: the active browse view. Seeded from the validated
  // `?category=` deep-link, otherwise the "all" sentinel. Selecting a card sets
  // its id; re-selecting the active card toggles back to "all". This state is
  // PRESERVED while a text search is active so clearing the search restores it.
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>(() =>
    normalizeCategory(initialCategory),
  );

  // Local UI state #2: the live SearchField value. A non-empty (debounced,
  // trimmed) query OVERRIDES the browse view and searches the whole catalog.
  const [searchValue, setSearchValue] = useState("");
  const query = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS).trim();
  const isSearching = query.length > 0;

  // While searching, no category card is "current" (the browse selection is
  // suspended, not lost). When clearing, this reverts to `activeCategory`.
  const displayedActive: ActiveCategory = isSearching ? "all" : activeCategory;

  function handleSelect(id: CategoryId) {
    // Selecting a category is a browse action — it supersedes any text search.
    setSearchValue("");
    // Toggle off the DISPLAYED current (so a click during search selects, not
    // toggles): re-selecting the active card returns to "All stories".
    setActiveCategory(displayedActive === id ? "all" : id);
  }

  function clearSearch() {
    setSearchValue("");
  }

  // Stories under the active view. A text query searches the WHOLE catalog
  // (title + category label, case-insensitive); otherwise the browse filter
  // applies ("all" → everything; a category → its stories).
  const visibleStories = useMemo(() => {
    if (!data) return [];
    if (isSearching) {
      const needle = query.toLowerCase();
      return data.stories.filter((story) => {
        if (story.title.toLowerCase().includes(needle)) return true;
        const label = data.categories
          .find((c) => c.id === story.category)
          ?.label.toLowerCase();
        return label?.includes(needle) ?? false;
      });
    }
    if (activeCategory === "all") return data.stories;
    return data.stories.filter((story) => story.category === activeCategory);
  }, [data, isSearching, query, activeCategory]);

  // The browse view's category title, or "All stories".
  const browseLabel = useMemo(() => {
    if (activeCategory === "all") return "All stories";
    return (
      data?.categories.find((c) => c.id === activeCategory)?.label ??
      "All stories"
    );
  }, [data, activeCategory]);

  // The section title: the search context while searching, else the browse label.
  const sectionTitle = isSearching ? `Results for "${query}"` : browseLabel;

  const noResults = isSearching && visibleStories.length === 0;

  // Polite announcement for async result changes (search + browse).
  const announcement = useMemo(() => {
    if (isSearching) {
      const n = visibleStories.length;
      return n === 0
        ? `No stories found for "${query}"`
        : `${n} ${n === 1 ? "result" : "results"} for "${query}"`;
    }
    return activeCategory === "all"
      ? "Showing all stories"
      : `Showing ${browseLabel}`;
  }, [isSearching, visibleStories.length, query, activeCategory, browseLabel]);

  const headingId = useId();

  // Re-key the results subtree per view so it cross-fades (morph) on a change.
  const viewKey = isSearching ? `q:${query}` : `c:${activeCategory}`;

  return (
    <main className="flex min-h-full flex-1 flex-col bg-canvas">
      {/* Sticky navbar — matches the Library screen (consistent across screens).
          The back affordance is NOT in this row; it scrolls with the content. */}
      <div className="sticky top-0 z-50 mx-auto w-full max-w-7xl px-lg pt-lg">
        <Navbar items={NAV_ITEMS} activeKey="search" {...navbar} />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-start gap-2xl px-lg py-2xl">
        {/* Breadcrumb-back — its own in-flow row above the content (not pinned,
            not on the navbar row). `‹ Library` names the destination. */}
        <Button asChild variant="ghost" size="sm" className="-ml-[var(--space-md)]">
          <Link
            href="/library"
            aria-label="Back to Library"
            className="gap-[var(--space-xs)] no-underline"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-[16px] [&>svg]:size-full"
            >
              <ChevronLeftIcon />
            </span>
            Library
          </Link>
        </Button>

        {/* H1 — Display/L (Baloo ExtraBold). Static chrome, always mounted. */}
        <h1 className="font-display font-extrabold text-primary [font-size:var(--text-display-l-size)] [line-height:var(--text-display-l-line-height)] [letter-spacing:var(--text-display-l-tracking)]">
          Find a story
        </h1>

        {/* SearchField — ~500 wide, left-aligned. Controlled; drives live search.
            Clearing (its ✕ or emptying) returns to the browse view. */}
        <div className="w-full max-w-[500px]">
          <SearchField
            value={searchValue}
            onValueChange={setSearchValue}
            aria-label="Search stories"
          />
        </div>

        {isError ? (
          <SearchError onRetry={() => void refetch()} />
        ) : isPending ? (
          <SearchSkeleton />
        ) : (
          <>
            <CategoryGrid
              categories={data.categories}
              active={displayedActive}
              onSelect={handleSelect}
            />

            {/* Polite live region — announces search/browse result changes. */}
            <p role="status" aria-live="polite" className="sr-only">
              {announcement}
            </p>

            {/* Results morph on a view change: keyed by the active view so the
                subtree cross-fades (re-fade-in); window scroll is untouched. */}
            <div key={viewKey} className="re-fade-in flex w-full flex-col gap-xl">
              {noResults ? (
                <EmptyState
                  className="w-full"
                  icon={<SearchIcon />}
                  title="No stories found"
                  body="Try a different word, or browse a category."
                  action={{
                    label: "Browse all stories",
                    icon: <RefreshIcon />,
                    onClick: clearSearch,
                  }}
                />
              ) : (
                <>
                  <SectionHeader id={headingId} title={sectionTitle} />
                  <ResultsGrid stories={visibleStories} labelledBy={headingId} />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
