/**
 * Reader data contract — the typed shape the Reader feature consumes.
 *
 * Mirrors the Library/Search/Saved contract style: these types are the single
 * source of truth for the seam between frontend and backend. Today the bytes
 * come from an MSW mock of `/api/story/:id?lang=` (which parses the Markdown in
 * `src/content/stories/*.md` and merges the requested language's
 * `*.{es,fr,pt}.json` sidecar); later a Supabase-backed `getStory()` returns the
 * SAME shape. A rename surfaces as a type error here and in every reader.
 *
 * The Reader paginates a story's body into pages of whole paragraphs, renders
 * each word as a tappable token, and on tap shows the selected language's
 * meaning pulled from the story's glossary. Stories without a sidecar for the
 * language degrade gracefully: no translation block, and the popover shows a
 * "pending translation" note.
 */

import type { Preferences } from "@/stores/preferences";
import { DEFAULT_VOICE, type VoiceAccent } from "@/lib/audio/speechController";

// The accent vocabulary lives in the feature-agnostic base layer (the TTS seam
// is `src/lib/audio`). The Reader re-exports it so its public contract is
// unchanged, and layers its store-mapping tables (below) on top.
export { DEFAULT_VOICE, type VoiceAccent };

/** The store's preference value shapes the Reader adapts to (single source of
 *  truth). Aliased so the mapping tables below read cleanly. */
type StoreAccent = Preferences["readingAccent"];
type StoreLang = Preferences["translationLang"];

/** A CEFR level label, e.g. "A1", "B1". */
export type StoryLevel = string;

/**
 * The translation languages the Reader can load a sidecar for. Each story ships
 * a `<id>.<lang>.json` per language; all three now share one shape (a generic
 * `translation` field), so adding a language is a sidecar + a list entry.
 */
export type Language = "es" | "fr" | "pt";

/** The set of supported translation languages, in display order. */
export const LANGUAGES: readonly Language[] = ["es", "fr", "pt"] as const;

/** Human label for each language, shown in the dropdown + the translation block. */
export const LANGUAGE_LABELS: Record<Language, string> = {
  es: "Español",
  fr: "Français",
  pt: "Português",
};

/** The default translation language (Spanish), matching the original behaviour. */
export const DEFAULT_LANGUAGE: Language = "es";

/** The supported voice accents, in display order. */
export const VOICE_ACCENTS: readonly VoiceAccent[] = [
  "en-US",
  "en-GB",
  "en-AU",
  "en-CA",
] as const;

/** Short code chip + full label for each voice accent (Figma voice dropdown). */
export const VOICE_LABELS: Record<VoiceAccent, { code: string; name: string }> = {
  "en-US": { code: "US", name: "US English" },
  "en-GB": { code: "UK", name: "UK English" },
  "en-AU": { code: "AU", name: "Australian English" },
  "en-CA": { code: "CA", name: "Canadian English" },
};

/**
 * Mappings between the global preferences store's short codes and the Reader's
 * internal value shapes. The store is the source of truth (US/UK/AU/CA and
 * ES/FR/PT); the Reader speaks in BCP-47 voice tags + lowercase sidecar langs,
 * so these adapters keep both directions exact (a rename is a type error here).
 */
export const STORE_ACCENT_TO_VOICE: Record<StoreAccent, VoiceAccent> = {
  US: "en-US",
  UK: "en-GB",
  AU: "en-AU",
  CA: "en-CA",
};

export const VOICE_TO_STORE_ACCENT: Record<VoiceAccent, StoreAccent> = {
  "en-US": "US",
  "en-GB": "UK",
  "en-AU": "AU",
  "en-CA": "CA",
};

export const STORE_LANG_TO_READER: Record<StoreLang, Language> = {
  ES: "es",
  FR: "fr",
  PT: "pt",
};

export const READER_LANG_TO_STORE: Record<Language, StoreLang> = {
  es: "ES",
  fr: "FR",
  pt: "PT",
};

/**
 * One glossary sense — the meaning shown in the WordPopover when a word is
 * tapped. Keyed in `Story.glossary` by the lowercased, punctuation-stripped
 * lemma of the surface word (see `normalizeLemma`).
 */
export interface GlossaryEntry {
  /** Part of speech, shown in the popover's POS pill. English, lowercase, from
   *  a fixed set (noun, verb, adjective, …) — per Figma the pill reads English.
   *  Consistency across all sidecars is guarded in loader.test.ts. */
  pos: string;
  /** The meaning in the loaded language (senses may be comma-joined). All three
   *  sidecar languages share this generic field. */
  translation: string;
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
 * loaded language's translation, one-per-English-paragraph in the same order.
 * When the story has no sidecar for the language, `translationParagraphs` is
 * empty and the translation block hides.
 */
export interface StoryPage {
  /** 0-based page index. */
  index: number;
  /** English body paragraphs for this page. */
  paragraphs: string[];
  /** Translation paragraphs (same length as `paragraphs`), or empty. */
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
  /** Lemma → sense map for the tap-a-word popover (in the loaded language). */
  glossary: Glossary;
  /** True when a sidecar for the loaded language was merged (drives the block). */
  hasTranslation: boolean;
  /** The translation language this payload was loaded for. */
  language: Language;
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
