import { http, HttpResponse } from "msw";
import type { LibraryData } from "@/features/library/types";
import type {
  SearchCategory,
  SearchData,
  SearchStory,
} from "@/features/search/types";
import {
  deriveSavedStats,
  type SavedData,
  type SavedWord,
} from "@/features/saved/types";
import type { ProfileData } from "@/features/profile/types";
import { loadStory } from "@/features/reader/content/loader";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  type Language,
  type NewSavedWord,
} from "@/features/reader/types";
import type { StoryDetail, StoryKeyWord } from "@/features/story/types";
import { resolvePracticeSet } from "@/features/practice/content";
import type {
  PracticeResponse,
  PracticeSentence,
} from "@/features/practice/types";

/**
 * Mock-first API surface. ReadEasily runs against these handlers everywhere —
 * unit tests (node), e2e/dev (browser worker) — until real Supabase endpoints
 * are wired. Feature/backend engineers append their handlers to this array;
 * keep it the single source of mock truth so node + browser stay in sync.
 *
 * Convention: mock under the `/api/*` prefix so real fetches and mocks share a
 * path namespace and swapping in the real backend is a base-URL change.
 */

/**
 * Real painted cover art (added to `public/covers/`), keyed by story. Every
 * `coverSrc` below references one of these optimized WebP files — there are no
 * placeholder SVGs left. File names are reproduced verbatim (mixed case is
 * intentional, it must match the bytes on disk).
 */
const COVERS = {
  antGrasshopper: "/covers/the-ant-grasshopper.webp",
  tortoiseHare: "/covers/The-tortoise-and-the-hare.webp",
  boyWhoCriedWolf: "/covers/The-boy-who-cried-wolf.webp",
  cleverCrow: "/covers/the-clever-crow.webp",
  tripMountains: "/covers/A-trip-mountains.webp",
  morningCity: "/covers/A-morning-in-the-city.webp",
  firstSmartphone: "/covers/My-first-Smartphone.webp",
  helpfulRobot: "/covers/the-helpful-robot.webp",
  lostKeys: "/covers/the-lost-keys.webp",
  lostAirport: "/covers/Airport.webp",
} as const;

/**
 * Library landing catalog. Typed as `LibraryData` so the mock can never drift
 * from the contract in `src/features/library/types.ts` — a column rename there
 * breaks this file at compile time.
 *
 * Catalog mirrors the Figma "Screen / Library" (node 1272:4570): the rail
 * grouping, order, titles, levels, durations and subtitles are read 1:1 from
 * Figma. "Lost at the Airport" (B1 travel, now with supplied art) appears in
 * both the Travel rail and the featured fan, per Figma.
 */
const libraryData: LibraryData = {
  // The featured fan — 7 distinct stories, centre = "The Ant and the
  // Grasshopper" (Figma centre). The fan mixes categories, so each story gets
  // its own eyebrow; only the centre is an editor's pick. BookShowcase opens on
  // the middle index (3), so featured[3] is the centred story.
  featured: [
    {
      id: "the-tortoise-and-the-hare",
      title: "The Tortoise and the Hare",
      level: "A1",
      levelLabel: "Beginner",
      minutes: 5,
      words: 240,
      coverSrc: COVERS.tortoiseHare,
      category: "fables",
      href: "/read/the-tortoise-and-the-hare",
      eyebrow: "Featured Fable",
      teaser:
        "The hare laughs at the slow tortoise — until a steady pace turns a sure win into a famous lesson.",
    },
    {
      id: "a-trip-to-the-mountains",
      title: "A Trip to the Mountains",
      level: "B1",
      levelLabel: "Intermediate",
      minutes: 6,
      words: 540,
      coverSrc: COVERS.tripMountains,
      category: "travel",
      href: "/read/a-trip-to-the-mountains",
      eyebrow: "Featured Journey",
      teaser:
        "A weekend hike, a wrong turn, and a view worth every step — simple English for the road ahead.",
    },
    {
      id: "lost-at-the-airport",
      title: "Lost at the Airport",
      level: "B1",
      levelLabel: "Intermediate",
      minutes: 7,
      words: 560,
      coverSrc: COVERS.lostAirport,
      category: "travel",
      href: "/read/lost-at-the-airport",
      eyebrow: "Featured Journey",
      teaser:
        "A missed gate, a lost bag, and a kind stranger — find your way through a busy airport in clear English.",
    },
    {
      id: "the-ant-and-the-grasshopper",
      title: "The Ant and the Grasshopper",
      level: "A2",
      levelLabel: "Elementary",
      minutes: 6,
      words: 312,
      coverSrc: COVERS.antGrasshopper,
      category: "fables",
      href: "/read/the-ant-and-the-grasshopper",
      eyebrow: "Featured Fable",
      badgeLabel: "Editor's pick",
      teaser:
        "All summer long the grasshopper sings while the ants store grain. When winter comes, only one of them is ready.",
    },
    {
      id: "the-clever-crow",
      title: "The Clever Crow",
      level: "A1",
      levelLabel: "Beginner",
      minutes: 4,
      words: 210,
      coverSrc: COVERS.cleverCrow,
      category: "fables",
      href: "/read/the-clever-crow",
      eyebrow: "Featured Fable",
      teaser:
        "Thirsty and stuck, a crow finds that a few small stones can solve a very big problem.",
    },
    {
      id: "the-boy-who-cried-wolf",
      title: "The Boy Who Cried Wolf",
      level: "A2",
      levelLabel: "Elementary",
      minutes: 5,
      words: 300,
      coverSrc: COVERS.boyWhoCriedWolf,
      category: "fables",
      href: "/read/the-boy-who-cried-wolf",
      eyebrow: "Featured Fable",
      teaser:
        "A bored shepherd boy raises one false alarm too many — and learns what a lie really costs.",
    },
    {
      id: "my-first-smartphone",
      title: "My First Smartphone",
      level: "B1",
      levelLabel: "Intermediate",
      minutes: 6,
      words: 520,
      coverSrc: COVERS.firstSmartphone,
      category: "technology",
      href: "/read/my-first-smartphone",
      eyebrow: "Featured Technology",
      teaser:
        "Unboxing, set-up, and a few funny mistakes — the words you need for a brand-new phone.",
    },
  ],
  user: { name: "Ana" },
  categories: [
    { id: "all", label: "All" },
    { id: "fables", label: "Fables" },
    { id: "daily-life", label: "Daily Life" },
    { id: "technology", label: "Technology" },
    { id: "travel", label: "Travel" },
  ],
  sections: [
    {
      id: "continue",
      title: "Continue listening",
      subtitle: "Pick up where you left off",
      accent: "bg-accent",
      books: [
        {
          id: "the-ant-and-the-grasshopper",
          title: "The Ant and the Grasshopper",
          level: "A2",
          minutes: 6,
          coverSrc: COVERS.antGrasshopper,
          category: "fables",
          href: "/read/the-ant-and-the-grasshopper",
        },
        {
          id: "the-boy-who-cried-wolf",
          title: "The Boy Who Cried Wolf",
          level: "A2",
          minutes: 5,
          coverSrc: COVERS.boyWhoCriedWolf,
          category: "fables",
          href: "/read/the-boy-who-cried-wolf",
        },
      ],
    },
    {
      id: "fables",
      title: "Fables",
      subtitle: "Timeless tales, gently retold",
      accent: "bg-cat-fables-rail",
      books: [
        {
          id: "the-ant-and-the-grasshopper",
          title: "The Ant and the Grasshopper",
          level: "A2",
          minutes: 6,
          coverSrc: COVERS.antGrasshopper,
          category: "fables",
          href: "/read/the-ant-and-the-grasshopper",
        },
        {
          id: "the-clever-crow",
          title: "The Clever Crow",
          level: "A1",
          minutes: 4,
          coverSrc: COVERS.cleverCrow,
          category: "fables",
          href: "/read/the-clever-crow",
        },
        {
          id: "the-boy-who-cried-wolf",
          title: "The Boy Who Cried Wolf",
          level: "A2",
          minutes: 5,
          coverSrc: COVERS.boyWhoCriedWolf,
          category: "fables",
          href: "/read/the-boy-who-cried-wolf",
        },
        {
          id: "the-tortoise-and-the-hare",
          title: "The Tortoise and the Hare",
          level: "A1",
          minutes: 5,
          coverSrc: COVERS.tortoiseHare,
          category: "fables",
          href: "/read/the-tortoise-and-the-hare",
        },
      ],
    },
    {
      id: "daily-life",
      title: "Daily Life",
      subtitle: "Everyday situations in simple English",
      accent: "bg-cat-daily",
      books: [
        {
          id: "a-morning-in-the-city",
          title: "A Morning in the City",
          level: "A2",
          minutes: 6,
          coverSrc: COVERS.morningCity,
          category: "daily-life",
          href: "/read/a-morning-in-the-city",
        },
        {
          id: "the-lost-keys",
          title: "The Lost Keys",
          level: "A2",
          minutes: 4,
          coverSrc: COVERS.lostKeys,
          category: "daily-life",
          href: "/read/the-lost-keys",
        },
      ],
    },
    {
      id: "technology",
      title: "Technology",
      subtitle: "Modern life, modern words",
      accent: "bg-cat-tech",
      books: [
        {
          id: "my-first-smartphone",
          title: "My First Smartphone",
          level: "B1",
          minutes: 6,
          coverSrc: COVERS.firstSmartphone,
          category: "technology",
          href: "/read/my-first-smartphone",
        },
        {
          id: "the-helpful-robot",
          title: "The Helpful Robot",
          level: "A2",
          minutes: 5,
          coverSrc: COVERS.helpfulRobot,
          category: "technology",
          href: "/read/the-helpful-robot",
        },
      ],
    },
    {
      id: "travel",
      title: "Travel",
      subtitle: "Stories from the road",
      accent: "bg-cat-travel",
      books: [
        {
          id: "a-trip-to-the-mountains",
          title: "A Trip to the Mountains",
          level: "B1",
          minutes: 6,
          coverSrc: COVERS.tripMountains,
          category: "travel",
          href: "/read/a-trip-to-the-mountains",
        },
        {
          id: "lost-at-the-airport",
          title: "Lost at the Airport",
          level: "B1",
          minutes: 7,
          coverSrc: COVERS.lostAirport,
          category: "travel",
          href: "/read/lost-at-the-airport",
        },
      ],
    },
  ],
};

/**
 * Search browse catalog. The Search screen BROWSES BY CATEGORY (per the Figma
 * prototype) — it never does live text search — so this payload carries the four
 * browse categories plus the flat catalog of stories, each tagged with its
 * `category`. The screen filters client-side ("All" shows them all; selecting a
 * card filters by `category`).
 *
 * Typed as `SearchData` so the mock can never drift from
 * `src/features/search/types.ts`. Stories + covers are the SAME catalog the
 * Library uses (reusing `COVERS` above) — every `coverSrc` resolves to a real
 * `/covers/*.webp`. Order mirrors the Figma "Screen / Search" grids.
 */
const searchStories: SearchStory[] = [
  // Fables (4) — Figma idle defaults to this category selected.
  {
    id: "the-ant-and-the-grasshopper",
    title: "The Ant and the Grasshopper",
    level: "A2",
    minutes: 6,
    coverSrc: COVERS.antGrasshopper,
    category: "fables",
    href: "/read/the-ant-and-the-grasshopper",
  },
  {
    id: "the-clever-crow",
    title: "The Clever Crow",
    level: "A1",
    minutes: 4,
    coverSrc: COVERS.cleverCrow,
    category: "fables",
    href: "/read/the-clever-crow",
  },
  {
    id: "the-boy-who-cried-wolf",
    title: "The Boy Who Cried Wolf",
    level: "A2",
    minutes: 5,
    coverSrc: COVERS.boyWhoCriedWolf,
    category: "fables",
    href: "/read/the-boy-who-cried-wolf",
  },
  {
    id: "the-tortoise-and-the-hare",
    title: "The Tortoise and the Hare",
    level: "A1",
    minutes: 5,
    coverSrc: COVERS.tortoiseHare,
    category: "fables",
    href: "/read/the-tortoise-and-the-hare",
  },
  // Daily Life (2)
  {
    id: "a-morning-in-the-city",
    title: "A Morning in the City",
    level: "A2",
    minutes: 6,
    coverSrc: COVERS.morningCity,
    category: "daily-life",
    href: "/read/a-morning-in-the-city",
  },
  {
    id: "the-lost-keys",
    title: "The Lost Keys",
    level: "A2",
    minutes: 4,
    coverSrc: COVERS.lostKeys,
    category: "daily-life",
    href: "/read/the-lost-keys",
  },
  // Technology (2)
  {
    id: "my-first-smartphone",
    title: "My First Smartphone",
    level: "B1",
    minutes: 6,
    coverSrc: COVERS.firstSmartphone,
    category: "technology",
    href: "/read/my-first-smartphone",
  },
  {
    id: "the-helpful-robot",
    title: "The Helpful Robot",
    level: "A2",
    minutes: 5,
    coverSrc: COVERS.helpfulRobot,
    category: "technology",
    href: "/read/the-helpful-robot",
  },
  // Travel (2)
  {
    id: "a-trip-to-the-mountains",
    title: "A Trip to the Mountains",
    level: "B1",
    minutes: 6,
    coverSrc: COVERS.tripMountains,
    category: "travel",
    href: "/read/a-trip-to-the-mountains",
  },
  {
    id: "lost-at-the-airport",
    title: "Lost at the Airport",
    level: "B1",
    minutes: 7,
    coverSrc: COVERS.lostAirport,
    category: "travel",
    href: "/read/lost-at-the-airport",
  },
];

/**
 * The four browse categories, in Figma display order. `storyCount` is DERIVED
 * from `searchStories` so it can never drift from the stories it counts (the
 * backend will compute it the same way).
 */
const searchCategoryMeta: Array<Pick<SearchCategory, "id" | "label">> = [
  { id: "fables", label: "Fables" },
  { id: "daily-life", label: "Daily Life" },
  { id: "technology", label: "Technology" },
  { id: "travel", label: "Travel" },
];

const searchData: SearchData = {
  categories: searchCategoryMeta.map(({ id, label }) => ({
    id,
    label,
    storyCount: searchStories.filter((story) => story.category === id).length,
  })),
  stories: searchStories,
};

/**
 * User-confirmed flow: catalog CARDS (Library rails + Search results) now route
 * to STORY DETAIL first (`/story/${id}`); Story Detail's "Read & Listen" CTA is
 * the single hop onward into the reader. The Library FEATURED HERO keeps its
 * direct `/read` CTA (its CTA is the read action, not a card), so only the
 * section + search card hrefs are repointed here — featured hrefs stay `/read`.
 */
for (const section of libraryData.sections) {
  for (const book of section.books) {
    book.href = `/story/${book.id}`;
  }
}
for (const story of searchStories) {
  story.href = `/story/${story.id}`;
}

/* ---------------------------------------------------------------------------
 * Story Detail catalog — the lightweight payload `getStoryDetail(id)` consumes
 * (Figma "Screen / Story Detail" 122:136). Built from the shared catalog rows
 * (reusing `searchStories` for id/title/level/minutes/cover/category) enriched
 * with the Story-Detail-only blocks: a per-story `eyebrow`/`levelLabel`/`teaser`,
 * the `words`/`moral` and a curated `keyWords` list whose senses are pulled from
 * the SAME story glossary the Reader uses (so the chip meanings can never drift
 * from the in-story translations). `keyWords` resolve in the catalog's default
 * language (Spanish); Story Detail has no language switcher per Figma.
 * ------------------------------------------------------------------------- */

/** Story-Detail eyebrow per category (Figma centre reads "A CLASSIC FABLE  ·  …"). */
const DETAIL_EYEBROWS: Record<string, string> = {
  fables: "A CLASSIC FABLE  ·  FOR ENGLISH LEARNERS",
  travel: "A TRAVEL TALE  ·  FOR ENGLISH LEARNERS",
  technology: "A MODERN STORY  ·  FOR ENGLISH LEARNERS",
  "daily-life": "AN EVERYDAY STORY  ·  FOR ENGLISH LEARNERS",
};

/** Human label for each CEFR level (matches the Library featured labels). */
const DETAIL_LEVEL_LABELS: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper-Intermediate",
  C1: "Advanced",
  C2: "Proficient",
};

/** One-line hook per story (Figma centre teaser for the Ant; written for the rest). */
const DETAIL_TEASERS: Record<string, string> = {
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

/**
 * The fable morals — shown in the inline callout, in English to match Figma's
 * Reading/L italic line. Only the four fables carry one; non-fables omit it so
 * the callout hides.
 */
const DETAIL_MORALS: Record<string, string> = {
  "the-ant-and-the-grasshopper":
    "There is a time for work and a time for play.",
  "the-tortoise-and-the-hare": "Slow and steady wins the race.",
  "the-boy-who-cried-wolf":
    "Nobody believes a liar — even when he tells the truth.",
  "the-clever-crow": "Little by little does the trick.",
};

/**
 * Curated key words per story as `{ surface, lemma }` pairs: `surface` is the
 * exact English shown on the chip (Figma shows plurals like "ants"/"seeds"),
 * `lemma` is the glossary key the sense is looked up under. The Ant set is read
 * 1:1 from Figma 122:208; the rest are ~8 meaningful content words per story.
 */
const DETAIL_KEY_WORDS: Record<string, Array<{ surface: string; lemma: string }>> = {
  "the-ant-and-the-grasshopper": [
    { surface: "grasshopper", lemma: "grasshopper" },
    { surface: "field", lemma: "field" },
    { surface: "summer", lemma: "summer" },
    { surface: "winter", lemma: "winter" },
    { surface: "ants", lemma: "ant" },
    { surface: "ant", lemma: "ant" },
    { surface: "grain", lemma: "grain" },
    { surface: "seeds", lemma: "seed" },
  ],
  "the-tortoise-and-the-hare": [
    { surface: "tortoise", lemma: "tortoise" },
    { surface: "hare", lemma: "hare" },
    { surface: "race", lemma: "race" },
    { surface: "slow", lemma: "slow" },
    { surface: "steady", lemma: "steady" },
    { surface: "rest", lemma: "rest" },
    { surface: "win", lemma: "win" },
    { surface: "finish", lemma: "finish" },
  ],
  "the-boy-who-cried-wolf": [
    { surface: "wolf", lemma: "wolf" },
    { surface: "sheep", lemma: "sheep" },
    { surface: "village", lemma: "village" },
    { surface: "shepherd", lemma: "boy" },
    { surface: "shout", lemma: "shout" },
    { surface: "trick", lemma: "trick" },
    { surface: "villagers", lemma: "villager" },
    { surface: "angry", lemma: "angry" },
  ],
  "the-clever-crow": [
    { surface: "crow", lemma: "crow" },
    { surface: "thirsty", lemma: "thirsty" },
    { surface: "water", lemma: "water" },
    { surface: "jug", lemma: "jug" },
    { surface: "beak", lemma: "beak" },
    { surface: "stones", lemma: "stone" },
    { surface: "reach", lemma: "reach" },
    { surface: "drink", lemma: "drink" },
  ],
  "a-trip-to-the-mountains": [
    { surface: "mountains", lemma: "mountain" },
    { surface: "trip", lemma: "trip" },
    { surface: "journey", lemma: "journey" },
    { surface: "pine", lemma: "pine" },
    { surface: "trees", lemma: "tree" },
    { surface: "mist", lemma: "mist" },
    { surface: "climb", lemma: "climb" },
    { surface: "sky", lemma: "sky" },
  ],
  "lost-at-the-airport": [
    { surface: "airport", lemma: "airport" },
    { surface: "suitcase", lemma: "suitcase" },
    { surface: "flight", lemma: "flight" },
    { surface: "gate", lemma: "gate" },
    { surface: "departure", lemma: "departure" },
    { surface: "sign", lemma: "sign" },
    { surface: "language", lemma: "language" },
    { surface: "screen", lemma: "screen" },
  ],
  "my-first-smartphone": [
    { surface: "smartphone", lemma: "smartphone" },
    { surface: "phone", lemma: "phone" },
    { surface: "screen", lemma: "screen" },
    { surface: "glow", lemma: "glow" },
    { surface: "parents", lemma: "parent" },
    { surface: "promise", lemma: "promise" },
    { surface: "world", lemma: "world" },
    { surface: "box", lemma: "box" },
  ],
  "the-helpful-robot": [
    { surface: "robot", lemma: "robot" },
    { surface: "gift", lemma: "gift" },
    { surface: "kitchen", lemma: "kitchen" },
    { surface: "tea", lemma: "tea" },
    { surface: "daughter", lemma: "daughter" },
    { surface: "help", lemma: "help" },
    { surface: "house", lemma: "house" },
    { surface: "cup", lemma: "cup" },
  ],
  "the-lost-keys": [
    { surface: "keys", lemma: "key" },
    { surface: "coat", lemma: "coat" },
    { surface: "pocket", lemma: "pocket" },
    { surface: "coffee", lemma: "coffee" },
    { surface: "newspaper", lemma: "newspaper" },
    { surface: "bus", lemma: "bus" },
    { surface: "sofa", lemma: "sofa" },
    { surface: "jacket", lemma: "jacket" },
  ],
  "a-morning-in-the-city": [
    { surface: "alarm", lemma: "alarm" },
    { surface: "city", lemma: "city" },
    { surface: "streets", lemma: "street" },
    { surface: "coffee", lemma: "coffee" },
    { surface: "toast", lemma: "toast" },
    { surface: "kitchen", lemma: "kitchen" },
    { surface: "breakfast", lemma: "breakfast" },
    { surface: "jacket", lemma: "jacket" },
  ],
};

/**
 * Build one story's `StoryDetail`, resolving each curated key word's sense from
 * the story glossary (default language). Returns `null` for an unknown id (the
 * handler answers 404), mirroring the Reader's graceful not-found.
 */
function buildStoryDetail(id: string): StoryDetail | null {
  const base = searchStories.find((s) => s.id === id);
  if (!base) return null;
  const story = loadStory(id, DEFAULT_LANGUAGE);
  if (!story) return null;

  const keyWords: StoryKeyWord[] = (DETAIL_KEY_WORDS[id] ?? []).flatMap(
    ({ surface, lemma }) => {
      const entry = story.glossary[lemma];
      if (!entry) return [];
      return [
        {
          surface,
          pos: entry.pos,
          translation: entry.translation,
          ...(entry.ipa != null ? { ipa: entry.ipa } : {}),
        },
      ];
    },
  );

  return {
    id: base.id,
    title: base.title,
    level: base.level,
    levelLabel: DETAIL_LEVEL_LABELS[base.level] ?? base.level,
    minutes: base.minutes,
    words: story.wordCount,
    coverSrc: base.coverSrc,
    category: base.category,
    // The CTA destination — the reader, NOT this screen's own `/story` route.
    href: `/read/${base.id}`,
    eyebrow:
      DETAIL_EYEBROWS[base.category] ?? "A STORY  ·  FOR ENGLISH LEARNERS",
    teaser: DETAIL_TEASERS[id] ?? "",
    keyWords,
    moral: DETAIL_MORALS[id],
  };
}

/**
 * Saved-words collection — the payload `getSaved()` consumes. Read 1:1 from the
 * Figma "Screen / Saved" (137:154): eight words a reader kept while reading "The
 * Ant and the Grasshopper", newest first. Two carry ready practice sentences
 * (the badge + "Review"); the rest read "Practice". Three carry a phonetic line.
 *
 * `sourceStoryId` points at the real catalog story, so the card's word link
 * resolves to `/read/the-ant-and-the-grasshopper` (origin-aware navigation). The
 * displayed title uses the Figma "&" wordmark. Stats are DERIVED via
 * `deriveSavedStats` so they can never drift from the words.
 *
 * This list is MUTABLE so the DELETE handler (unsave) actually removes a word —
 * a later GET reflects it, which keeps dev/e2e honest. It is reset between test
 * files by `resetSavedWords()` (called from tests/setup.ts).
 */
const ANT_STORY = {
  id: "the-ant-and-the-grasshopper",
  title: "The Ant & the Grasshopper",
} as const;

const savedWordsSeed: SavedWord[] = [
  {
    id: "path",
    word: "Path",
    translation: "sendero, camino",
    sourceStoryId: ANT_STORY.id,
    sourceStoryTitle: ANT_STORY.title,
    sentencesReady: 10,
    savedAt: "2026-06-22T10:08:00.000Z",
  },
  {
    id: "taught",
    word: "Taught",
    translation: "enseñó",
    sourceStoryId: ANT_STORY.id,
    sourceStoryTitle: ANT_STORY.title,
    sentencesReady: 10,
    savedAt: "2026-06-22T10:07:00.000Z",
  },
  {
    id: "gentle",
    word: "Gentle",
    translation: "amable",
    sourceStoryId: ANT_STORY.id,
    sourceStoryTitle: ANT_STORY.title,
    sentencesReady: 0,
    savedAt: "2026-06-22T10:06:00.000Z",
  },
  {
    id: "warm",
    word: "Warm",
    translation: "cálido",
    sourceStoryId: ANT_STORY.id,
    sourceStoryTitle: ANT_STORY.title,
    sentencesReady: 0,
    savedAt: "2026-06-22T10:05:00.000Z",
  },
  {
    id: "shivering",
    word: "Shivering",
    translation: "tiritando",
    sourceStoryId: ANT_STORY.id,
    sourceStoryTitle: ANT_STORY.title,
    sentencesReady: 0,
    savedAt: "2026-06-22T10:04:00.000Z",
  },
  {
    id: "grew",
    word: "Grew",
    phonetic: "/kreˈsjo/",
    translation: "creció",
    sourceStoryId: ANT_STORY.id,
    sourceStoryTitle: ANT_STORY.title,
    sentencesReady: 0,
    savedAt: "2026-06-22T10:03:00.000Z",
  },
  {
    id: "covered",
    word: "Covered",
    phonetic: "/kuˈβjerto/",
    translation: "cubierto",
    sourceStoryId: ANT_STORY.id,
    sourceStoryTitle: ANT_STORY.title,
    sentencesReady: 0,
    savedAt: "2026-06-22T10:02:00.000Z",
  },
  {
    id: "bright",
    word: "Bright",
    phonetic: "/brɪt/",
    translation: "brillante",
    sourceStoryId: ANT_STORY.id,
    sourceStoryTitle: ANT_STORY.title,
    sentencesReady: 0,
    savedAt: "2026-06-22T10:01:00.000Z",
  },
];

/* ---------------------------------------------------------------------------
 * Saved-words persistence.
 *
 * The live list is in-memory, but in a REAL browser (dev / Playwright e2e) it is
 * also mirrored to localStorage: read on init, written on every mutation
 * (DELETE / POST / PATCH). This is the BUG-3 fix — without it a full page reload
 * re-ran this module and re-seeded the list, so a removed card reappeared.
 *
 * Under the UNIT runner (node / jsdom) persistence is OFF: `activeStorage()`
 * returns null when `NODE_ENV === "test"`, so handlers stay purely in-memory and
 * `resetSavedWords()` (called from tests/setup.ts `afterEach`) restores the seed
 * — nothing leaks between tests. The `__setSavedStorageForTest` seam lets the
 * dedicated persistence test opt a single storage in (and back out) to exercise
 * the reload-survives-delete path without affecting any other test.
 * ------------------------------------------------------------------------- */

/** localStorage key for the persisted saved-words list. */
const SAVED_STORAGE_KEY = "readeasily-saved-mock";

/** Test override for the persistence storage. `undefined` = use the default
 *  (browser-only) gate; an explicit value (incl. `null`) forces it. */
let savedStorageOverride: Storage | null | undefined;

/**
 * Test seam: force the storage the saved mock persists to (e.g. a fresh
 * localStorage) so the reload-survives-delete behavior can be exercised under the
 * runner. Pass `undefined` to restore the default browser-only gate.
 */
export function __setSavedStorageForTest(
  storage: Storage | null | undefined,
): void {
  savedStorageOverride = storage;
}

/** The Storage the handlers persist to: the override when set, else the real
 *  browser localStorage in dev/e2e, else null (unit runner → in-memory only). */
function activeStorage(): Storage | null {
  if (savedStorageOverride !== undefined) return savedStorageOverride;
  if (process.env.NODE_ENV === "test") return null;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Read the persisted list from a storage, or null if absent/unreadable. */
function readPersistedSaved(storage: Storage | null): SavedWord[] | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(SAVED_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedWord[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Mirror the current list to the active storage (best-effort). */
function persistSaved(): void {
  const storage = activeStorage();
  if (!storage) return;
  try {
    storage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedWords));
  } catch {
    /* ignore quota / serialization errors — the in-memory list is authoritative */
  }
}

/** Live, mutable working copy the handlers read/mutate. Seeded from the persisted
 *  list when one exists (browser reload), else from the module seed. */
let savedWords: SavedWord[] =
  readPersistedSaved(activeStorage()) ?? [...savedWordsSeed];

/**
 * Restore the list as a fresh module load would — from the persisted storage if
 * one is active (a "reload" in the persistence test / browser), else the seed.
 * Called between test files so removals don't leak; with persistence off (the
 * default under the runner) this always restores the seed.
 */
export function resetSavedWords(): void {
  savedWords = readPersistedSaved(activeStorage()) ?? [...savedWordsSeed];
}

/** Shape the current words into the `SavedData` contract (stats derived). */
function currentSavedData(): SavedData {
  return { words: savedWords, stats: deriveSavedStats(savedWords) };
}

/**
 * Shape the current state into the `ProfileData` contract (Profile screen). The
 * name/avatar come from the existing library `user` (single source of identity);
 * `email` + `joinedAt` are MOCKED here (no auth backend yet). The stats reuse
 * `deriveSavedStats` over the SAME live `savedWords` list as the Saved screen,
 * so the Profile tiles can never drift from Saved. `inProgress`/`finished` are
 * placeholders (0) — there is no reading-progress model yet.
 */
function currentProfileData(): ProfileData {
  const saved = deriveSavedStats(savedWords);
  const name = libraryData.user.name;
  return {
    user: {
      name,
      email: `${name.toLowerCase()}@readeasily.app`,
      joinedAt: "2026-06-01T00:00:00.000Z",
    },
    stats: {
      wordsSaved: saved.wordsToReview,
      practiceSets: saved.practiceSets,
      inProgress: 0,
      finished: 0,
    },
  };
}

/**
 * A tiny seeded PRNG (mulberry32) + Fisher-Yates shuffle. The Practice overlay's
 * "New sentences" bumps a `?nonce=`, and the overlay expects a VISIBLY different
 * ordering each press; keying the shuffle on the nonce makes the reorder
 * deterministic (same nonce → same order) so it is stable in tests yet changes
 * between presses. A real generator plugs in behind the same seam later.
 */
function seededShuffle(
  sentences: PracticeSentence[],
  seed: number,
): PracticeSentence[] {
  let state = (seed || 1) >>> 0;
  const rand = () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...sentences];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const handlers = [
  // Health/echo — the canary that proves mocking is live in any environment.
  http.get("/api/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),

  // Library landing — the catalog `getLibrary()` consumes.
  http.get("/api/library", () => {
    return HttpResponse.json(libraryData);
  }),

  // Search browse-by-category — the payload `getSearch()` consumes.
  http.get("/api/search", () => {
    return HttpResponse.json(searchData);
  }),

  // Saved words — the collection `getSaved()` consumes (stats derived).
  http.get("/api/saved", () => {
    return HttpResponse.json(currentSavedData());
  }),

  // Profile — the user identity + derived learning stats `getProfile()`
  // consumes. Preferences are NOT here (they live in the persisted client
  // store). Stats reuse the live saved-words list, so a removed word lowers the
  // Profile "Words saved" tile too.
  http.get("/api/profile", () => {
    return HttpResponse.json(currentProfileData());
  }),

  // Unsave a word — the write seam behind the card's remove button. Removes the
  // word from the live list so a later GET reflects it; 204 No Content on
  // success, 404 when the id is unknown.
  http.delete("/api/saved/:id", ({ params }) => {
    const { id } = params as { id: string };
    const before = savedWords.length;
    savedWords = savedWords.filter((w) => w.id !== id);
    if (savedWords.length === before) {
      return new HttpResponse(null, { status: 404 });
    }
    persistSaved();
    return new HttpResponse(null, { status: 204 });
  }),

  // Mark practice sentences ready on an already-saved word — the write seam
  // behind "Save to practice later" when the word is already saved. Sets
  // `sentencesReady` from the JSON body and echoes the updated `SavedWord` so the
  // Saved screen flips "Practice" → "Review". 404 for an unknown id.
  http.patch("/api/saved/:id", async ({ params, request }) => {
    const { id } = params as { id: string };
    const body = (await request.json()) as { sentencesReady?: number };
    const index = savedWords.findIndex((w) => w.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    const updated: SavedWord = {
      ...savedWords[index],
      sentencesReady: body.sentencesReady ?? savedWords[index].sentencesReady,
    };
    savedWords = savedWords.map((w, i) => (i === index ? updated : w));
    persistSaved();
    return HttpResponse.json(updated, { status: 200 });
  }),

  // Practice sentences for a word — the payload `getPracticeSentences()`
  // consumes. Resolves the precomputed sample via the Reader's lemma matching
  // (so "paths"/"running" hit "path"/"run"); on a hit returns `found:true` with
  // 10 sentences, deterministically reordered by `?nonce=` so "New sentences"
  // visibly refreshes. A word with no sample resolves to `found:false` + `[]`
  // (HTTP 200, NOT 404) so the overlay shows its graceful empty state.
  http.get("/api/practice/:word", ({ params, request }) => {
    const { word } = params as { word: string };
    const decoded = decodeURIComponent(word);
    const nonce = Number(
      new URL(request.url).searchParams.get("nonce") ?? "0",
    );
    const set = resolvePracticeSet(decoded);
    if (!set) {
      const miss: PracticeResponse = {
        word: decoded,
        found: false,
        sentences: [],
      };
      return HttpResponse.json(miss);
    }
    const sentences =
      nonce > 0 ? seededShuffle(set.sentences, nonce) : set.sentences;
    const hit: PracticeResponse = { word: set.word, found: true, sentences };
    return HttpResponse.json(hit);
  }),

  // Save a word — the write seam behind the Reader popover's Save button.
  // Assigns a deterministic id (slug of the word), prepends to the live list
  // (newest first), and echoes the created `SavedWord`. Saving a word that's
  // already present is idempotent: it returns the existing row (200) and does
  // not duplicate it. 201 Created for a brand-new word.
  http.post("/api/saved", async ({ request }) => {
    const body = (await request.json()) as NewSavedWord;
    const id = body.word.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const existing = savedWords.find(
      (w) => w.word.toLowerCase() === body.word.toLowerCase(),
    );
    if (existing) {
      return HttpResponse.json(existing, { status: 200 });
    }

    const created: SavedWord = {
      id,
      word: body.word,
      phonetic: body.phonetic,
      translation: body.translation,
      sourceStoryId: body.sourceStoryId,
      sourceStoryTitle: body.sourceStoryTitle,
      sentencesReady: body.sentencesReady,
      savedAt: body.savedAt,
    };
    savedWords = [created, ...savedWords];
    persistSaved();
    return HttpResponse.json(created, { status: 201 });
  }),

  // One story — the payload `getStory(id, lang)` consumes. Parses the Markdown +
  // merges the requested language's translation sidecar (via the content loader,
  // the same code the app would call), then attaches the catalog cover. The
  // `?lang=` query selects es|fr|pt (default es; an unknown value falls back to
  // the default). A story with no sidecar for the language degrades to
  // no-translation inside the loader. 404 for an unknown id.
  http.get("/api/story/:id", ({ params, request }) => {
    const { id } = params as { id: string };
    const raw = new URL(request.url).searchParams.get("lang");
    const language: Language = LANGUAGES.includes(raw as Language)
      ? (raw as Language)
      : DEFAULT_LANGUAGE;
    const story = loadStory(id, language);
    if (!story) {
      return new HttpResponse(null, { status: 404 });
    }
    const coverSrc = searchStories.find((s) => s.id === id)?.coverSrc;
    return HttpResponse.json({ ...story, coverSrc });
  }),

  // One story's DETAIL — the lightweight payload `getStoryDetail(id)` consumes
  // (Story Detail screen). DISTINCT from `/api/story/:id` above (the heavy
  // paginated Reader payload): this returns only the catalog fields + the
  // key-words + moral. 404 for an unknown id, so the screen shows its
  // not-found state.
  http.get("/api/story/:id/detail", ({ params }) => {
    const { id } = params as { id: string };
    const detail = buildStoryDetail(id);
    if (!detail) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(detail);
  }),
];
