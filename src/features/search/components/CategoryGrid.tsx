"use client";

import type { MouseEvent } from "react";
import { CategoryCard, type CategoryId } from "@/components/category-card";
import type { ActiveCategory, SearchCategory } from "../types";

/**
 * CategoryGrid — the browse-by-category picker: the four CategoryCards in a
 * single row of 4 (desktop, 202×160, gap 16) collapsing to a 2×2 grid (mobile,
 * 172×160, gap 14). Figma "Screen / Search" node 132:164.
 *
 * A11y: a named region (`aria-label`) wrapping a real list, each card a link
 * carrying `aria-current="page"` when it is the active view. Selecting a card is
 * a SAME-SCREEN state change, not a route change, so each card intercepts its
 * own click (`preventDefault`) and reports the id upward; the href stays a real,
 * meaningful URL (`/search?category=…`) for progressive enhancement and
 * middle-click/open-in-new-tab.
 */

export interface CategoryGridProps {
  /** The four browse categories, in display order, with derived counts. */
  categories: SearchCategory[];
  /** The active view — a category id, or `"all"` for the unfiltered view. */
  active: ActiveCategory;
  /** Called with the clicked category id (parent owns toggle-to-all logic). */
  onSelect: (id: CategoryId) => void;
}

export function CategoryGrid({ categories, active, onSelect }: CategoryGridProps) {
  return (
    <section aria-label="Browse by category" className="w-full">
      <ul
        className="grid list-none p-0 m-0 [grid-template-columns:repeat(2,minmax(0,172px))] gap-md-plus md:[grid-template-columns:repeat(4,minmax(0,202px))] md:gap-lg"
      >
        {categories.map((category) => (
          <li key={category.id} className="flex">
            <CategoryCard
              category={category.id}
              label={category.label}
              storyCount={category.storyCount}
              selected={active === category.id}
              href={`/search?category=${category.id}`}
              onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                // Same-screen morph, not navigation: keep scroll, swap state.
                // (Let modified clicks — new tab / new window — fall through.)
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                ) {
                  return;
                }
                event.preventDefault();
                onSelect(category.id);
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
