import { getCatalogEntry } from "@/content/catalog";
import { STORY_MARKDOWN } from "../content/corpus.generated";

/**
 * Server-readable story prose — the English body, parsed from the embedded
 * Markdown corpus (`STORY_MARKDOWN`, snapshotted from `src/content/stories/*.md`).
 *
 * This is what lets the Reader put the actual story text in its server-rendered
 * (SSG) HTML: the page passes it to `ReaderScreen` as `initialProse`, which the
 * Reader renders in its pending/SSR pass. Crawlers and no-JS visitors get the
 * full, readable story; once the client query resolves, the interactive
 * (paginated, tap-to-translate, audio) Reader takes over. The Reader's own
 * `/api/story/:id` seam (translations + glossary + pagination) is unchanged — this
 * is a progressive-enhancement base layer, not a replacement.
 */
export interface StoryProse {
  id: string;
  title: string;
  /** Body paragraphs in order (frontmatter stripped, whitespace collapsed). */
  paragraphs: string[];
}

export function getStoryProse(id: string): StoryProse | null {
  const raw = STORY_MARKDOWN[id];
  const entry = getCatalogEntry(id);
  if (!raw || !entry) return null;

  const body = raw.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return { id, title: entry.title, paragraphs };
}
