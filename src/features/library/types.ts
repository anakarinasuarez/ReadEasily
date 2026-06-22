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
  /** Cover art URL (local /covers/*.svg today; Supabase Storage later). */
  coverSrc: string;
  /** Category id this book belongs to — matches a `Category.id`. */
  category: string;
  /** Reader destination, always `/read/${id}`. */
  href: string;
}

/**
 * The single hero story on the Library landing — a Book enriched with the
 * showcase/marketing fields the featured panel renders.
 */
export interface FeaturedBook extends Book {
  /** Human label for the level, e.g. "Elementary" for A2. */
  levelLabel: string;
  /** Approximate word count, shown in the featured stats. */
  words: number;
  /** One-line hook describing the story. */
  teaser: string;
  /** Pill copy over the hero, e.g. "Editor's pick". */
  badgeLabel: string;
  /** Cover URLs for the auto-cycling showcase carousel (~7 covers). */
  showcaseCovers: string[];
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
  books: Book[];
}

/** The full payload the Library landing renders. */
export interface LibraryData {
  featured: FeaturedBook;
  user: { name: string; avatarSrc?: string };
  categories: Category[];
  /** Shelves in display order; a `continue` section sorts first when present. */
  sections: CatalogSection[];
}
