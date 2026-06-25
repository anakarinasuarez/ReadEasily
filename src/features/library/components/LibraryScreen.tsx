"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar, useNavbarUser, type NavbarItem } from "@/components/navbar";
import { useLibrary } from "../hooks/useLibrary";
import { CategoryFilter } from "./CategoryFilter";
import { CategoryRail, RailDivider } from "./CategoryRail";
import { FeaturedHero } from "./FeaturedHero";
import {
  LibraryEmpty,
  LibraryError,
  LibrarySkeleton,
} from "./LibraryStates";
import { LibraryIcon, SavedIcon, SearchIcon } from "./icons";

/**
 * LibraryScreen — the home screen (route `/`), 1:1 with Figma `Screen /
 * Library` (1272:4570). This is the feature's one client component: it reads
 * server state via `useLibrary` and owns the only genuinely-local UI state —
 * which category chip is active (a same-screen filter, never a route change).
 *
 * The Navbar is rendered in every state (loading / error / loaded) so the page
 * frame is stable; the content area swaps between the skeleton, the error
 * block, and the real hero + filter + rails. Selecting a chip filters which
 * rails render WITHOUT navigating or scrolling to top: React state only, a
 * 200ms cross-fade on the rail area (keyed remount), and a polite live region
 * announcing the result.
 */

/** Primary nav — Search/Saved/reader routes are forward links (not built yet). */
const NAV_ITEMS: NavbarItem[] = [
  { key: "library", label: "Library", icon: <LibraryIcon />, href: "/" },
  { key: "search", label: "Search", icon: <SearchIcon />, href: "/search" },
  { key: "saved", label: "Saved", icon: <SavedIcon />, href: "/saved" },
];

/** Avatar placeholder shown only while the user payload is in flight. */
const LOADING_USER = { name: "Reader" };

export function LibraryScreen() {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useLibrary();

  // The only local UI state: the active filter chip. Defaults to the "all"
  // sentinel so the unfiltered catalog shows first.
  const [activeCategory, setActiveCategory] = useState("all");

  // Sections visible under the current filter. "all" shows every shelf intact;
  // a specific category filters by each BOOK's `category` (not the shelf id),
  // keeping only the matching books and dropping shelves left empty. This is
  // why "Travel" still surfaces the in-progress travel story that lives on the
  // "Continue listening" shelf — the shelf id ("continue") is irrelevant; the
  // book's category is what matters.
  const visibleSections = useMemo(() => {
    if (!data) return [];
    if (activeCategory === "all") return data.sections;
    return data.sections
      .map((section) => ({
        ...section,
        books: section.books.filter((book) => book.category === activeCategory),
      }))
      .filter((section) => section.books.length > 0);
  }, [data, activeCategory]);

  // Polite announcement for the filter result (same-screen change).
  const announcement = useMemo(() => {
    if (!data) return "";
    if (activeCategory === "all") return "Showing all stories";
    const label =
      data.categories.find((c) => c.id === activeCategory)?.label ??
      activeCategory;
    return `Showing ${label}`;
  }, [data, activeCategory]);

  const user = useNavbarUser(data?.user ?? LOADING_USER);

  return (
    <main className="flex min-h-full flex-1 flex-col bg-canvas">
      {/* Floating navbar — sticky so it stays in view as rails scroll. */}
      <div className="sticky top-0 z-50 mx-auto w-full max-w-7xl px-lg pt-lg">
        <Navbar
          items={NAV_ITEMS}
          activeKey="library"
          user={user}
          onAccountClick={() => router.push("/profile")}
        />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center gap-3xl px-lg py-3xl">
        {isError ? (
          <LibraryError onRetry={() => void refetch()} />
        ) : isPending ? (
          <LibrarySkeleton />
        ) : (
          <>
            <FeaturedHero featured={data.featured} />

            <div className="flex w-full flex-col items-center gap-2xl">
              <CategoryFilter
                categories={data.categories}
                value={activeCategory}
                onValueChange={setActiveCategory}
              />

              {/* Polite live region — announces the filter result to AT. */}
              <p aria-live="polite" className="sr-only">
                {announcement}
              </p>

              {/* Rail area. Keyed by the active filter so it cross-fades
                  (200ms) on change; window scroll is untouched (no route
                  change, no scroll-to-top). */}
              <div
                key={activeCategory}
                className="re-fade-in flex w-full flex-col gap-xl"
              >
                {visibleSections.length === 0 ? (
                  <LibraryEmpty onShowAll={() => setActiveCategory("all")} />
                ) : (
                  visibleSections.map((section, index) => (
                    <div key={section.id} className="flex w-full flex-col gap-xl">
                      {index > 0 && <RailDivider />}
                      <CategoryRail section={section} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
