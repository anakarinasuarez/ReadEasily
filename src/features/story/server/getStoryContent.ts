import { getCatalogEntry } from "@/content/catalog";
import type { Level } from "@/features/library/types";

/**
 * Server-readable Story-Detail STATIC content — the fields the detail page can
 * render on the server (build/request time) straight from the catalog, without
 * the browser-only MSW mock. This is what makes the Story-Detail page a real
 * Server Component: title, level, teaser, cover, moral, etc. land in the SSG
 * HTML (indexable, zero client JS). The interactive "key words" chips, which
 * need the per-story glossary, stay a client island fed by `/api/story/:id/detail`.
 *
 * Mirrors the values the MSW detail handler serves (levelLabel, eyebrow,
 * minutes, moral) so the server-rendered page matches the design 1:1.
 */

const LEVEL_LABEL: Record<Level, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper-Intermediate",
  C1: "Advanced",
  C2: "Proficient",
};

/** Story-Detail eyebrow per category (Figma "A CLASSIC FABLE · FOR ENGLISH LEARNERS"). */
const EYEBROW_BY_CATEGORY: Record<string, string> = {
  fables: "A CLASSIC FABLE  ·  FOR ENGLISH LEARNERS",
  travel: "A TRAVEL TALE  ·  FOR ENGLISH LEARNERS",
  technology: "A MODERN STORY  ·  FOR ENGLISH LEARNERS",
  "daily-life": "AN EVERYDAY STORY  ·  FOR ENGLISH LEARNERS",
};

/** Estimated read/listen minutes per story (matches the catalog/handler values). */
const MINUTES: Record<string, number> = {
  "the-ant-and-the-grasshopper": 6,
  "the-clever-crow": 4,
  "the-boy-who-cried-wolf": 5,
  "the-tortoise-and-the-hare": 5,
  "a-morning-in-the-city": 6,
  "the-lost-keys": 4,
  "my-first-smartphone": 6,
  "the-helpful-robot": 5,
  "a-trip-to-the-mountains": 6,
  "lost-at-the-airport": 7,
};

/** Fable morals — only the four fables carry one; others hide the callout. */
const MORALS: Record<string, string> = {
  "the-ant-and-the-grasshopper": "There is a time for work and a time for play.",
  "the-tortoise-and-the-hare": "Slow and steady wins the race.",
  "the-boy-who-cried-wolf": "Nobody believes a liar — even when he tells the truth.",
  "the-clever-crow": "Little by little does the trick.",
};

/** The static, server-renderable Story-Detail content (no key words). */
export interface StoryContent {
  id: string;
  title: string;
  level: Level;
  levelLabel: string;
  eyebrow: string;
  minutes: number;
  words: number;
  teaser: string;
  coverSrc: string;
  category: string;
  /** The reader destination — `/read/${id}` (the "Read & Listen" CTA). */
  readHref: string;
  /** Fable moral, or null when the story isn't a fable. */
  moral: string | null;
}

/** Build a story's static content, or null for an unknown id (the page 404s). */
export function getStoryContent(id: string): StoryContent | null {
  const entry = getCatalogEntry(id);
  if (!entry) return null;

  return {
    id: entry.id,
    title: entry.title,
    level: entry.level,
    levelLabel: LEVEL_LABEL[entry.level],
    eyebrow:
      EYEBROW_BY_CATEGORY[entry.category] ?? "A STORY  ·  FOR ENGLISH LEARNERS",
    minutes: MINUTES[entry.id] ?? Math.max(2, Math.round(entry.words / 100)),
    words: entry.words,
    teaser: entry.teaser,
    coverSrc: entry.coverSrc,
    category: entry.category,
    readHref: `/read/${entry.id}`,
    moral: MORALS[entry.id] ?? null,
  };
}
