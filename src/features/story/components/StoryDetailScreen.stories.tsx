import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { savedQueryKey } from "@/features/saved/api/getSaved";
import { deriveSavedStats, type SavedData } from "@/features/saved/types";
import { storyDetailQueryKey } from "../api/getStoryDetail";
import type { StoryDetail } from "../types";
import { StoryDetailScreen } from "./StoryDetailScreen";
import { StoryDetailError, StoryDetailSkeleton } from "./StoryDetailStates";

/**
 * StoryDetailScreen — the Story Detail screen (Figma "Screen / Story Detail"
 * desktop 122:136, mobile 841:876).
 *
 * The screen reads its payload through TanStack Query (`useStoryDetail`) and the
 * Saved cache (`useSaved`). Rather than run MSW inside Storybook, each story
 * seeds a fresh QueryClient cache with fixtures under the real query keys, so the
 * hooks resolve instantly to the loaded state. The key-word chips are live: flip
 * a chip to reveal its meaning, press "+" to save it (optimistic; the POST seam
 * 404s without MSW, so it rolls back — the visual save → restore is intentional
 * in Storybook).
 */

const FABLE_ID = "the-ant-and-the-grasshopper";

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

const EMPTY_DETAIL: StoryDetail = {
  ...ANT_DETAIL,
  id: "the-lost-keys",
  title: "The Lost Keys",
  category: "daily-life",
  href: "/read/the-lost-keys",
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
  title: "Features/Story/StoryDetailScreen",
  component: StoryDetailScreen,
  parameters: { layout: "fullscreen" },
  args: { storyId: FABLE_ID },
} satisfies Meta<typeof StoryDetailScreen>;

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
  args: { storyId: EMPTY_DETAIL.id },
  decorators: [withDetail(EMPTY_DETAIL)],
};

/** Loading — the skeleton that matches the real layout (no jump on arrival). */
export const Loading: Story = {
  render: () => (
    <main className="bg-canvas min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-lg py-2xl">
        <StoryDetailSkeleton />
      </div>
    </main>
  ),
};

/** Error / not found — story couldn't load: alert + retry + back to Library. */
export const ErrorState: Story = {
  render: () => (
    <main className="bg-canvas min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-lg py-2xl">
        <StoryDetailError onRetry={() => {}} />
      </div>
    </main>
  ),
};
