import { http, HttpResponse } from "msw";
import type { LibraryData } from "@/features/library/types";
import type {
  SearchCategory,
  SearchData,
  SearchStory,
} from "@/features/search/types";

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

export const handlers = [
  // Health/echo — the canary that proves mocking is live in any environment.
  http.get("/api/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),

  // Reference demo endpoint, consumed by the Query+MSW proof component/test.
  // Safe to delete once real feature handlers land.
  http.get("/api/demo/greeting", () => {
    return HttpResponse.json({ message: "Hello from MSW" });
  }),

  // Library landing — the catalog `getLibrary()` consumes.
  http.get("/api/library", () => {
    return HttpResponse.json(libraryData);
  }),

  // Search browse-by-category — the payload `getSearch()` consumes.
  http.get("/api/search", () => {
    return HttpResponse.json(searchData);
  }),
];
