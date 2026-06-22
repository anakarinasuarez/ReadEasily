import { http, HttpResponse } from "msw";
import type { LibraryData } from "@/features/library/types";

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
 * Library landing catalog. Typed as `LibraryData` so the mock can never drift
 * from the contract in `src/features/library/types.ts` — a column rename there
 * breaks this file at compile time. Covers are local token-colored placeholder
 * SVGs (`/public/covers`); they swap for Supabase Storage URLs later.
 */
const libraryData: LibraryData = {
  featured: {
    id: "the-ant-and-the-grasshopper",
    title: "The Ant and the Grasshopper",
    level: "A2",
    levelLabel: "Elementary",
    minutes: 6,
    words: 312,
    coverSrc: "/covers/ant-grasshopper.svg",
    category: "fables",
    href: "/read/the-ant-and-the-grasshopper",
    teaser:
      "All summer long the grasshopper sings while the ants store grain. When winter comes, only one of them is ready.",
    badgeLabel: "Editor's pick",
    showcaseCovers: [
      "/covers/ant-grasshopper.svg",
      "/covers/tortoise-hare.svg",
      "/covers/lion-mouse.svg",
      "/covers/fox-grapes.svg",
      "/covers/crying-wolf.svg",
      "/covers/lighthouse.svg",
      "/covers/market.svg",
    ],
  },
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
      books: [
        {
          id: "the-lighthouse-keeper",
          title: "The Lighthouse Keeper",
          level: "B1",
          minutes: 8,
          coverSrc: "/covers/lighthouse.svg",
          category: "travel",
          href: "/read/the-lighthouse-keeper",
        },
        {
          id: "a-cup-of-coffee",
          title: "A Cup of Coffee",
          level: "A2",
          minutes: 5,
          coverSrc: "/covers/coffee.svg",
          category: "daily-life",
          href: "/read/a-cup-of-coffee",
        },
      ],
    },
    {
      id: "fables",
      title: "Fables",
      subtitle: "Timeless tales, gently retold",
      books: [
        {
          id: "the-tortoise-and-the-hare",
          title: "The Tortoise and the Hare",
          level: "A1",
          minutes: 4,
          coverSrc: "/covers/tortoise-hare.svg",
          category: "fables",
          href: "/read/the-tortoise-and-the-hare",
        },
        {
          id: "the-lion-and-the-mouse",
          title: "The Lion and the Mouse",
          level: "A2",
          minutes: 5,
          coverSrc: "/covers/lion-mouse.svg",
          category: "fables",
          href: "/read/the-lion-and-the-mouse",
        },
        {
          id: "the-fox-and-the-grapes",
          title: "The Fox and the Grapes",
          level: "A1",
          minutes: 3,
          coverSrc: "/covers/fox-grapes.svg",
          category: "fables",
          href: "/read/the-fox-and-the-grapes",
        },
        {
          id: "the-boy-who-cried-wolf",
          title: "The Boy Who Cried Wolf",
          level: "A2",
          minutes: 6,
          coverSrc: "/covers/crying-wolf.svg",
          category: "fables",
          href: "/read/the-boy-who-cried-wolf",
        },
      ],
    },
    {
      id: "daily-life",
      title: "Daily Life",
      subtitle: "Everyday English, one scene at a time",
      books: [
        {
          id: "morning-at-the-market",
          title: "Morning at the Market",
          level: "A2",
          minutes: 5,
          coverSrc: "/covers/market.svg",
          category: "daily-life",
          href: "/read/morning-at-the-market",
        },
        {
          id: "a-day-at-the-office",
          title: "A Day at the Office",
          level: "B1",
          minutes: 7,
          coverSrc: "/covers/office.svg",
          category: "daily-life",
          href: "/read/a-day-at-the-office",
        },
      ],
    },
    {
      id: "technology",
      title: "Technology",
      subtitle: "Words for a connected world",
      books: [
        {
          id: "my-first-robot",
          title: "My First Robot",
          level: "A2",
          minutes: 6,
          coverSrc: "/covers/robot.svg",
          category: "technology",
          href: "/read/my-first-robot",
        },
        {
          id: "the-smart-home",
          title: "The Smart Home",
          level: "B1",
          minutes: 8,
          coverSrc: "/covers/smart-home.svg",
          category: "technology",
          href: "/read/the-smart-home",
        },
      ],
    },
    {
      id: "travel",
      title: "Travel",
      subtitle: "Stories from the road",
      books: [
        {
          id: "a-train-to-the-mountains",
          title: "A Train to the Mountains",
          level: "A2",
          minutes: 6,
          coverSrc: "/covers/train-mountains.svg",
          category: "travel",
          href: "/read/a-train-to-the-mountains",
        },
        {
          id: "lost-in-the-city",
          title: "Lost in the City",
          level: "B1",
          minutes: 7,
          coverSrc: "/covers/lost-city.svg",
          category: "travel",
          href: "/read/lost-in-the-city",
        },
      ],
    },
  ],
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
];
