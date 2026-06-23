/**
 * Content loader — turns a raw story Markdown file (+ optional Spanish sidecar)
 * into the typed `Story` the Reader consumes.
 *
 * Pipeline: parse frontmatter → split the body into whole paragraphs →
 * paginate by a deterministic word budget (grouping whole paragraphs) → pair
 * each English paragraph with its Spanish translation (by index) → attach the
 * glossary. Pure and synchronous: the MSW handler calls `loadStory(id)` and
 * serializes the result; later a real backend can return the same shape.
 */
import type { Glossary, Story, StoryPage } from "../types";
import { RAW_STORIES, type StorySidecar } from "./raw";

export { normalizeLemma } from "./lemma";

/** Target words per page. Whole paragraphs are grouped up to (around) this. */
export const WORDS_PER_PAGE = 130;

interface Frontmatter {
  id: string;
  title: string;
  level: string;
  category: string;
  wordCount: number;
}

interface ParsedMarkdown {
  meta: Frontmatter;
  /** Body paragraphs, in order, blank-line separated. */
  paragraphs: string[];
}

/** Count whitespace-separated words in a string. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

/** Parse `--- key: value ---` frontmatter + body. Throws on a malformed file. */
function parseMarkdown(raw: string): ParsedMarkdown {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw);
  if (!match) {
    throw new Error("Story markdown is missing its frontmatter block.");
  }
  const [, frontmatterBlock, body] = match;

  const fields: Record<string, string> = {};
  for (const line of frontmatterBlock.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) fields[key] = value;
  }

  const meta: Frontmatter = {
    id: fields.id ?? "",
    title: fields.title ?? "",
    level: fields.level ?? "",
    category: fields.category ?? "",
    wordCount: Number.parseInt(fields.wordCount ?? "0", 10) || 0,
  };

  const paragraphs = body
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0);

  return { meta, paragraphs };
}

/**
 * Group paragraph indices into pages under the word budget. A page always holds
 * at least one whole paragraph; adding the next paragraph starts a new page only
 * once the current page is non-empty AND would overflow the budget. A single
 * paragraph longer than the budget stands alone (never split mid-paragraph).
 */
function paginateIndices(paragraphs: string[]): number[][] {
  const pages: number[][] = [];
  let current: number[] = [];
  let currentWords = 0;

  paragraphs.forEach((paragraph, index) => {
    const words = countWords(paragraph);
    if (current.length > 0 && currentWords + words > WORDS_PER_PAGE) {
      pages.push(current);
      current = [];
      currentWords = 0;
    }
    current.push(index);
    currentWords += words;
  });

  if (current.length > 0) pages.push(current);
  // A body with no paragraphs still yields one (empty) page so the screen has
  // something to render rather than a crash.
  return pages.length > 0 ? pages : [[]];
}

/** Build the paginated pages, pairing English with Spanish by paragraph index. */
function buildPages(
  paragraphs: string[],
  sidecar: StorySidecar | undefined,
): { pages: StoryPage[]; hasTranslation: boolean } {
  // A sidecar only counts as a usable translation when it covers every English
  // paragraph 1:1 — a partial/mismatched sidecar degrades to "no translation"
  // rather than mis-aligning Spanish under the wrong English.
  const translations = sidecar?.paragraphs;
  const hasTranslation =
    Array.isArray(translations) && translations.length === paragraphs.length;

  const pages = paginateIndices(paragraphs).map((indices, pageIndex) => ({
    index: pageIndex,
    paragraphs: indices.map((i) => paragraphs[i]),
    translationParagraphs: hasTranslation
      ? indices.map((i) => translations![i])
      : [],
  }));

  return { pages, hasTranslation };
}

/**
 * Load and assemble one story by id, or `null` if no such story exists. Pure —
 * the same call in node (tests) and the browser worker returns the same object.
 * `coverSrc` is NOT set here (the content layer has no cover map); the API
 * handler attaches it from the catalog.
 */
export function loadStory(id: string): Story | null {
  const entry = RAW_STORIES[id];
  if (!entry) return null;

  const { meta, paragraphs } = parseMarkdown(entry.raw);
  const { pages, hasTranslation } = buildPages(paragraphs, entry.sidecar);
  const glossary: Glossary = entry.sidecar?.glossary ?? {};

  return {
    id: meta.id || id,
    title: meta.title,
    level: meta.level,
    category: meta.category,
    wordCount: meta.wordCount,
    pages,
    glossary,
    hasTranslation,
  };
}

/** The set of story ids the corpus can serve (handy for tests/sanity checks). */
export function listStoryIds(): string[] {
  return Object.keys(RAW_STORIES);
}
