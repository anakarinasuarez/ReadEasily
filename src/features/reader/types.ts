/**
 * Reader data contract — the typed shape the Reader feature consumes.
 *
 * Mirrors the Library/Search/Saved contract style: these types are the single
 * source of truth for the seam between frontend and backend. Today the bytes
 * come from an MSW mock of `/api/story/:id` (which parses the Markdown in
 * `src/content/stories/*.md` and merges a per-story `*.es.json` sidecar); later
 * a Supabase-backed `getStory()` returns the SAME shape. A rename surfaces as a
 * type error here and in every reader — by design.
 *
 * The Reader paginates a story's body into pages of whole paragraphs, renders
 * each word as a tappable token, and on tap shows a Spanish meaning pulled from
 * the story's glossary. Stories without a sidecar degrade gracefully: no
 * translation block, and the popover shows a "pending translation" note.
 */

/** A CEFR level label, e.g. "A1", "B1". */
export type StoryLevel = string;

/**
 * One glossary sense — the meaning shown in the WordPopover when a word is
 * tapped. Keyed in `Story.glossary` by the lowercased, punctuation-stripped
 * lemma of the surface word (see `normalizeLemma`).
 */
export interface GlossaryEntry {
  /** Part of speech, shown in the popover's POS pill (Spanish, e.g. "verbo"). */
  pos: string;
  /** The Spanish meaning (senses may be comma-joined). */
  es: string;
  /** Optional IPA pronunciation, e.g. "/kroʊ/". */
  ipa?: string;
}

/** The whole story's glossary: lemma → sense. */
export type Glossary = Record<string, GlossaryEntry>;

/**
 * One word inside the passage. The Reader builds these as it tokenizes; the
 * popover lookup uses `lemma` against `Story.glossary`. Kept in the contract so
 * a future backend that ships pre-tokenized passages can return the same shape.
 */
export interface StoryWord {
  /** The exact surface text shown in the passage (with original casing). */
  surface: string;
  /** Lowercased, punctuation-stripped key used to look up the glossary. */
  lemma: string;
  /** Part of speech, when known from the glossary. */
  pos?: string;
  /** Spanish meaning, when known from the glossary. */
  translation?: string;
  /** IPA pronunciation, when known. */
  phonetic?: string;
}

/**
 * One reading page — a deterministic group of whole paragraphs under a word
 * budget. `paragraphs` is the English body; `translationParagraphs` is the
 * Spanish, one-per-English-paragraph in the same order. When the story has no
 * sidecar, `translationParagraphs` is empty and the translation block hides.
 */
export interface StoryPage {
  /** 0-based page index. */
  index: number;
  /** English body paragraphs for this page. */
  paragraphs: string[];
  /** Spanish translation paragraphs (same length as `paragraphs`), or empty. */
  translationParagraphs: string[];
}

/** The full payload the Reader screen renders for one story. */
export interface Story {
  /** Stable id — the route param and cache key. */
  id: string;
  /** Display title (Display/L heading). */
  title: string;
  /** CEFR level, surfaced in the PlayerBar level chip. */
  level: StoryLevel;
  /** Catalog category (fables/travel/…). */
  category: string;
  /** Total body word count (from frontmatter). */
  wordCount: number;
  /** Painted cover art, used as the faint backdrop. Optional. */
  coverSrc?: string;
  /** Paginated body. `pages.length` drives "Page X of N". */
  pages: StoryPage[];
  /** Lemma → sense map for the tap-a-word popover. */
  glossary: Glossary;
  /** True when a Spanish sidecar was merged (drives the translation block). */
  hasTranslation: boolean;
}

/**
 * The POST /api/saved body — a SavedWord without its server-assigned id. The
 * Reader sends this when a word is saved; the backend (mock today) assigns the
 * id and echoes the created `SavedWord` back. Imported by the save hook and the
 * MSW handler so the write seam can never drift.
 */
export interface NewSavedWord {
  word: string;
  phonetic?: string;
  translation: string;
  sourceStoryId: string;
  sourceStoryTitle: string;
  sentencesReady: number;
  savedAt: string;
}
