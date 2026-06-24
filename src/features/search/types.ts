/**
 * Search data contract — the typed shape the Search feature consumes.
 *
 * This mirrors the Library contract style (see
 * `src/features/library/types.ts`): the types here are the single source of
 * truth for the seam between frontend and backend. Today the bytes come from an
 * MSW mock of `/api/search`; later a Supabase-backed `getSearch()` returns the
 * SAME shape. A backend column rename surfaces as a type error here and in every
 * reader — by design.
 *
 * The Search screen browses BY CATEGORY and also supports live text search over
 * the whole catalog, so the contract carries the category set plus every story
 * (grouped by `category`). All filtering — category and text — is client-side.
 */

import type { CategoryId } from "@/components/category-card";

/** A CEFR proficiency band, shown verbatim in card meta rows (e.g. "A2"). */
export type SearchLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/**
 * One story tile in the results grid. Structurally compatible with the
 * presentational `Book` consumed by `BookCard` (title, level, minutes,
 * coverSrc) and adds the fields needed to route and group.
 */
export interface SearchStory {
  /** Stable slug/id; also the route param. */
  id: string;
  title: string;
  /** CEFR level shown verbatim in the meta row, e.g. "A2". */
  level: SearchLevel;
  /** Estimated read/listen time in minutes, rendered as "{minutes} min". */
  minutes: number;
  /** Cover art URL — optimized painted WebP from `/covers/*.webp`. */
  coverSrc: string;
  /** Category id this story belongs to — matches a `SearchCategory.id`. */
  category: CategoryId;
  /** Card destination — `/story/${id}` (cards open Story Detail first; its
   *  "Read & Listen" CTA is what continues to `/read/${id}`). */
  href: string;
}

/**
 * A browse category — one of the four CategoryCards. `storyCount` is the number
 * of stories in the category (derived from the catalog by the backend/mock, so
 * it can never drift from the `stories` it counts).
 */
export interface SearchCategory {
  /** Category data id — drives the card glyph + per-category colour set. */
  id: CategoryId;
  /** Visible label, e.g. "Daily Life". */
  label: string;
  /** Number of stories in the category, e.g. 4 → "4 stories". */
  storyCount: number;
}

/** The full payload the Search screen renders. */
export interface SearchData {
  /** The four browse categories, in display order (Fables → Travel). */
  categories: SearchCategory[];
  /**
   * Every story in the catalog, in display order. The "All stories" view shows
   * them as-is; selecting a category filters by each story's `category`.
   */
  stories: SearchStory[];
}

/**
 * The active browse selection: a specific category, or the `"all"` sentinel for
 * the "All stories" view (no card selected). Kept out of `SearchData` because it
 * is local UI state, not server state.
 */
export type ActiveCategory = CategoryId | "all";
