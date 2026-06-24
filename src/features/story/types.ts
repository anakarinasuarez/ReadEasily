/**
 * Story Detail data contract — the typed shape the Story Detail feature consumes.
 *
 * This is the seam between the frontend and the backend. Today the bytes come
 * from an MSW mock of `GET /api/story/:id/detail`; later a Supabase-backed
 * `getStoryDetail()` returns the SAME shape (see `./api/getStoryDetail.ts`).
 * Keeping these types the single source of truth means a backend column rename
 * surfaces as a type error here and in every reader of this query — by design.
 *
 * `StoryDetail` is the catalog-card payload (`FeaturedBook`) enriched with the
 * two Story-Detail-only blocks Figma adds (node 122:136): the "Key words you'll
 * learn" chips and the optional fable `moral`. It deliberately REUSES the
 * library `FeaturedBook` fields (eyebrow / title / level / levelLabel / minutes
 * / words / teaser / coverSrc / category / href) and the reader `GlossaryEntry`
 * shape, so the catalog, the reader glossary, and Story Detail can never drift.
 *
 * `href` carries the READER destination (`/read/${id}`) — the target of the
 * "Read & Listen" CTA. Catalog CARDS now point at `/story/${id}` (this screen);
 * the CTA here is the single hop onward into the reader.
 */
import type { FeaturedBook } from "@/features/library/types";
import type { GlossaryEntry } from "@/features/reader/types";

/**
 * One "key word you'll learn" chip. The `surface` is the exact English word
 * shown on the chip's front face (Figma shows plurals like "ants"/"seeds"); the
 * rest is the glossary sense (`pos` + `translation` + optional `ipa`) shown on
 * the flipped back face. `translation` is in the catalog's DEFAULT language
 * (Spanish) — Story Detail has no language switcher per Figma.
 */
export type StoryKeyWord = { surface: string } & GlossaryEntry;

/** The full payload the Story Detail screen renders for one story. */
export interface StoryDetail extends FeaturedBook {
  /** The vocabulary chips, in display order. Empty → hide the whole section. */
  keyWords: StoryKeyWord[];
  /**
   * The story's moral, shown in the inline callout (fables only). English, to
   * match Figma's Reading/L italic line. Absent → hide the callout.
   */
  moral?: string;
}
