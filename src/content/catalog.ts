/**
 * Story catalog — the server-readable source of truth for SEO & routing.
 *
 * The interactive screens fetch their data at runtime from the MSW-mocked
 * `/api/*` (browser-only). But server/build-time code — `generateMetadata`,
 * `generateStaticParams`, `sitemap.ts`, JSON-LD — cannot reach that mock. This
 * module gives them a pure, dependency-free catalog they CAN read on the server.
 *
 * Most fields derive from the same per-story Markdown frontmatter the Reader
 * already trusts (`STORY_MARKDOWN`, snapshotted from `src/content/stories/*.md`),
 * so `title`/`level`/`category`/`words` can never drift from the content. Only
 * the two SEO-only fields not present in frontmatter — the marketing `teaser`
 * (meta description) and the `coverSrc` (OG image) — are declared here. Adding a
 * story is: author its `.md`, `npm run stories:build`, then add a teaser + cover
 * below (a missing teaser/cover falls back safely).
 */
import { STORY_MARKDOWN } from "@/features/reader/content/corpus.generated";
import type { Level } from "@/features/library/types";

/** One catalog row — the SEO-relevant projection of a story. */
export interface CatalogEntry {
  /** Stable slug; the `[id]` route param. */
  id: string;
  title: string;
  /** CEFR band, e.g. "A2". */
  level: Level;
  /** Category id, e.g. "fables". */
  category: string;
  /** Authored word count (frontmatter), used for JSON-LD `wordCount`. */
  words: number;
  /** One-line hook — the meta description for the story's pages. */
  teaser: string;
  /** Cover art path under /public, e.g. "/covers/the-clever-crow.webp". */
  coverSrc: string;
}

/** Meta description per story (mirrors the Story-Detail teasers). */
const TEASERS: Record<string, string> = {
  "the-ant-and-the-grasshopper":
    "All summer long the grasshopper sings while the ants store grain. When winter comes, only one of them is ready.",
  "the-tortoise-and-the-hare":
    "The hare laughs at the slow tortoise — until a steady pace turns a sure win into a famous lesson.",
  "the-boy-who-cried-wolf":
    "A bored shepherd boy raises one false alarm too many — and learns what a lie really costs.",
  "the-clever-crow":
    "Thirsty and stuck, a crow finds that a few small stones can solve a very big problem.",
  "a-trip-to-the-mountains":
    "A weekend hike, a wrong turn, and a view worth every step — simple English for the road ahead.",
  "lost-at-the-airport":
    "A missed gate, a lost bag, and a kind stranger — find your way through a busy airport in clear English.",
  "my-first-smartphone":
    "Unboxing, set-up, and a few funny mistakes — the words you need for a brand-new phone.",
  "a-morning-in-the-city":
    "An alarm, a warm cup of coffee, and a city waking up — an easy English walk through an ordinary morning.",
  "the-lost-keys":
    "Late for the bus and the keys are gone — a small everyday panic, told in clear, simple English.",
  "the-helpful-robot":
    "A little white robot arrives with a gift and a question: how can I help? A warm, simple tech tale.",
};

/** Cover art per story (files under /public/covers). */
const COVERS: Record<string, string> = {
  "the-ant-and-the-grasshopper": "/covers/the-ant-grasshopper.webp",
  "the-tortoise-and-the-hare": "/covers/The-tortoise-and-the-hare.webp",
  "the-boy-who-cried-wolf": "/covers/The-boy-who-cried-wolf.webp",
  "the-clever-crow": "/covers/the-clever-crow.webp",
  "a-trip-to-the-mountains": "/covers/A-trip-mountains.webp",
  "a-morning-in-the-city": "/covers/A-morning-in-the-city.webp",
  "my-first-smartphone": "/covers/My-first-Smartphone.webp",
  "the-helpful-robot": "/covers/the-helpful-robot.webp",
  "the-lost-keys": "/covers/the-lost-keys.webp",
  "lost-at-the-airport": "/covers/Airport.webp",
};

interface Frontmatter {
  title: string;
  level: Level;
  category: string;
  wordCount: number;
}

/** Parse the `--- key: value ---` frontmatter block (same shape the Reader uses). */
function parseFrontmatter(raw: string): Frontmatter {
  const match = /^---\s*\n([\s\S]*?)\n---/.exec(raw);
  if (!match) throw new Error("Story markdown is missing its frontmatter block.");
  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    fields[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return {
    title: fields.title,
    level: fields.level as Level,
    category: fields.category,
    wordCount: Number(fields.wordCount),
  };
}

/**
 * The full catalog, derived from the content frontmatter + the SEO maps above.
 * Sorted by title for a stable, human-friendly order (sitemap, static params).
 */
export const CATALOG: CatalogEntry[] = Object.entries(STORY_MARKDOWN)
  .map(([id, raw]): CatalogEntry => {
    const fm = parseFrontmatter(raw);
    return {
      id,
      title: fm.title,
      level: fm.level,
      category: fm.category,
      words: fm.wordCount,
      teaser: TEASERS[id] ?? fm.title,
      coverSrc: COVERS[id] ?? "/covers/the-clever-crow.webp",
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

/** Every story id, for `generateStaticParams`. */
export const STORY_IDS: string[] = CATALOG.map((e) => e.id);

/** Look up one entry by id (undefined if unknown). */
export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return CATALOG.find((e) => e.id === id);
}
