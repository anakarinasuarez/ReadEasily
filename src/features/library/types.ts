/**
 * Library data contract — the typed shape the Library feature consumes.
 *
 * This is the seam between the frontend and the backend. Today the data comes
 * from an MSW mock of `/api/library`; later a Supabase-backed `getLibrary()`
 * returns the SAME shape (see `./api/getLibrary.ts`). Keeping these types the
 * single source of truth means a backend column rename surfaces as a type
 * error here and in every TanStack Query hook that reads it — by design.
 *
 * `Book` is intentionally structurally compatible with the presentational
 * `Book` consumed by `src/components/book-card/BookCard.tsx` (title, level,
 * minutes, coverSrc) and adds the fields the catalog needs to route and group.
 */

/** A CEFR proficiency band, shown verbatim in card meta rows (e.g. "A2"). */
export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/** A catalog tile — one story the reader can open. */
export interface Book {
  /** Stable slug/id; also the route param. */
  id: string;
  title: string;
  /** CEFR level shown verbatim in the meta row, e.g. "A2". */
  level: Level;
  /** Estimated read/listen time in minutes, rendered as "{minutes} min". */
  minutes: number;
  /**
   * Cover art URL — optimized painted WebP served via next/image from
   * `/covers/*.webp` today; Supabase Storage later.
   */
  coverSrc: string;
  /** Category id this book belongs to — matches a `Category.id`. */
  category: string;
  /** Card destination — `/story/${id}` (catalog cards open Story Detail first;
   *  its "Read & Listen" CTA is what continues to `/read/${id}`). */
  href: string;
}

/**
 * One story in the featured fan atop the Library landing — a Book enriched with
 * the showcase/marketing fields the hero copy block renders for it.
 *
 * The fan holds SEVERAL distinct featured stories (Figma node 1272:4611): the
 * centered one is described by the copy block, and each side cover brings itself
 * to centre on click. Because the fan mixes categories, the section label is
 * per-story (`eyebrow`), not a fixed "Featured Fable".
 */
export interface FeaturedBook extends Book {
  /**
   * Per-story section label shown above the title (e.g. "FEATURED FABLE",
   * "FEATURED TRAVEL"). Per-story because the fan mixes categories.
   */
  eyebrow: string;
  /** Human label for the level, e.g. "Elementary" for A2. */
  levelLabel: string;
  /** Approximate word count, shown in the featured stats. */
  words: number;
  /** One-line hook describing the story. */
  teaser: string;
  /**
   * Optional "Editor's pick"-style pill copy. Render the badge ONLY when this
   * is present — not every featured story is a staff pick.
   */
  badgeLabel?: string;
}

/** A filter chip. Always includes the sentinel `{ id: 'all', label: 'All' }`. */
export interface Category {
  id: string;
  label: string;
}

/** A horizontally-scrolling shelf of books with a heading. */
export interface CatalogSection {
  id: string;
  title: string;
  subtitle: string;
  /**
   * Tailwind utility for the solid left accent bar (Figma-measured, per shelf):
   * the non-category "Continue" shelf uses `bg-accent`; category shelves use
   * their own token utility (e.g. `bg-cat-fables-rail`, `bg-cat-travel`). An
   * explicit token reference, never derived from the shelf's books.
   */
  accent: string;
  books: Book[];
}

/** The full payload the Library landing renders. */
export interface LibraryData {
  /** The featured fan, in display order; the centre starts at the middle index. */
  featured: FeaturedBook[];
  user: { name: string; avatarSrc?: string };
  categories: Category[];
  /** Shelves in display order; a `continue` section sorts first when present. */
  sections: CatalogSection[];
}
