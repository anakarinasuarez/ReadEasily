import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { savedQueryKey } from "@/features/saved/api/getSaved";
import { deriveSavedStats, type SavedData } from "@/features/saved/types";
import { getStoryContent } from "../server/getStoryContent";
import { storyDetailQueryKey } from "../api/getStoryDetail";
import type { StoryDetail } from "../types";
import { StoryDetailContent } from "./StoryDetailContent";
import { StoryDetailError, StoryDetailSkeleton } from "./StoryDetailStates";

/**
 * StoryDetailContent — the Story Detail screen (Figma "Screen / Story Detail"
 * desktop 122:136, mobile 841:876), now a Server Component for the static copy
 * with two client islands (navbar + key-words chips).
 *
 * The static content comes from `getStoryContent` (catalog-derived) via the
 * `content` arg. The key-words island reads the per-story glossary through
 * TanStack Query; rather than run MSW in Storybook, each story seeds a fresh
 * QueryClient cache with fixtures under the real query keys so the chips resolve
 * instantly. The chips are live: flip to reveal the meaning, press "+" to save
 * (optimistic; the POST seam 404s without MSW, so it rolls back — intentional).
 */

const FABLE_ID = "the-ant-and-the-grasshopper";
const EMPTY_ID = "the-lost-keys";

const ANT_DETAIL: StoryDetail = {
  id: FABLE_ID,
  title: "The Ant and the Grasshopper",
  level: "A2",
  levelLabel: "Elementary",
  minutes: 6,
  words: 312,
  coverSrc: "/covers/the-ant-grasshopper.webp",
  category: "fables",
  href: `/read/${FABLE_ID}`,
  eyebrow: "A CLASSIC FABLE  ·  FOR ENGLISH LEARNERS",
  teaser:
    "All summer long the grasshopper sings while the ants store grain. When winter comes, only one of them is ready.",
  moral: "There is a time for work and a time for play.",
  keyWords: [
    { surface: "grasshopper", pos: "noun", translation: "saltamontes" },
    { surface: "field", pos: "noun", translation: "campo" },
    { surface: "summer", pos: "noun", translation: "verano" },
    { surface: "winter", pos: "noun", translation: "invierno" },
    { surface: "ants", pos: "noun", translation: "hormiga" },
    { surface: "ant", pos: "noun", translation: "hormiga" },
    { surface: "grain", pos: "noun", translation: "grano" },
    { surface: "seeds", pos: "noun", translation: "semilla" },
  ],
};

/** A non-fable with no key words: both the moral and key-words sections hide. */
const EMPTY_DETAIL: StoryDetail = {
  ...ANT_DETAIL,
  id: EMPTY_ID,
  title: "The Lost Keys",
  category: "daily-life",
  href: `/read/${EMPTY_ID}`,
  eyebrow: "AN EVERYDAY STORY  ·  FOR ENGLISH LEARNERS",
  teaser:
    "Late for the bus and the keys are gone — a small everyday panic, told in clear, simple English.",
  moral: undefined,
  keyWords: [],
};

const NO_SAVED: SavedData = { words: [], stats: deriveSavedStats([]) };

/** A QueryClient whose cache already holds the fixtures — no network in stories. */
function makeSeededClient(detail: StoryDetail): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(storyDetailQueryKey(detail.id), detail);
  client.setQueryData(savedQueryKey, NO_SAVED);
  return client;
}

function withDetail(detail: StoryDetail) {
  return function Decorator(Story: () => ReactElement) {
    return (
      <QueryClientProvider client={makeSeededClient(detail)}>
        <Story />
      </QueryClientProvider>
    );
  };
}

const meta = {
  title: "Features/Story/StoryDetailContent",
  component: StoryDetailContent,
  parameters: { layout: "fullscreen" },
  args: { content: getStoryContent(FABLE_ID)!, storyId: FABLE_ID },
} satisfies Meta<typeof StoryDetailContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Desktop — the two-column body: cover + CTA beside the copy + key-words. */
export const Desktop: Story = {
  decorators: [withDetail(ANT_DETAIL)],
};

/** Mobile — the responsive variant: navbar icon-row, single reflowed column. */
export const Mobile: Story = {
  decorators: [withDetail(ANT_DETAIL)],
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

/** Empty — a non-fable with no key words and no moral: both sections hide. */
export const Empty: Story = {
  args: { content: getStoryContent(EMPTY_ID)!, storyId: EMPTY_ID },
  decorators: [withDetail(EMPTY_DETAIL)],
};

/** Loading — the skeleton that matches the real layout (used by loading.tsx). */
export const Loading: Story = {
  render: () => (
    <main className="bg-canvas min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-lg py-2xl">
        <StoryDetailSkeleton />
      </div>
    </main>
  ),
};

/** Error — the retryable inline error card (shared state component). */
export const ErrorState: Story = {
  render: () => (
    <main className="bg-canvas min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-lg py-2xl">
        <StoryDetailError onRetry={() => {}} />
      </div>
    </main>
  ),
};
