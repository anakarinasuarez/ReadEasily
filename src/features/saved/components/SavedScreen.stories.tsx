import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { savedQueryKey } from "../api/getSaved";
import { deriveSavedStats, type SavedData, type SavedWord } from "../types";
import { SavedScreen } from "./SavedScreen";

/**
 * SavedScreen — the full saved-words screen (Figma "Screen / Saved" desktop
 * 137:154, empty 144:181, mobile 866:1094 / 864:1048).
 *
 * The screen reads its collection through TanStack Query (`useSaved`). Rather
 * than run MSW inside Storybook, each story seeds a fresh QueryClient cache with
 * a fixture under the real `savedQueryKey`, so `useSaved` resolves instantly to
 * the loaded state. The remove (unsave) interaction is live: pressing a card's
 * trash button optimistically drops it (the DELETE seam 404s without MSW, so it
 * then rolls back — the visual remove → restore is intentional in Storybook).
 */

const ANT = {
  id: "the-ant-and-the-grasshopper",
  title: "The Ant & the Grasshopper",
} as const;

function word(
  partial: Pick<SavedWord, "id" | "word" | "translation" | "sentencesReady"> &
    Partial<SavedWord>,
): SavedWord {
  return {
    sourceStoryId: ANT.id,
    sourceStoryTitle: ANT.title,
    savedAt: "2026-06-22T10:00:00.000Z",
    ...partial,
  };
}

const WORDS: SavedWord[] = [
  word({ id: "path", word: "Path", translation: "sendero, camino", sentencesReady: 10 }),
  word({ id: "taught", word: "Taught", translation: "enseñó", sentencesReady: 10 }),
  word({ id: "gentle", word: "Gentle", translation: "amable", sentencesReady: 0 }),
  word({ id: "warm", word: "Warm", translation: "cálido", sentencesReady: 0 }),
  word({ id: "shivering", word: "Shivering", translation: "tiritando", sentencesReady: 0 }),
  word({ id: "grew", word: "Grew", phonetic: "/kreˈsjo/", translation: "creció", sentencesReady: 0 }),
  word({ id: "covered", word: "Covered", phonetic: "/kuˈβjerto/", translation: "cubierto", sentencesReady: 0 }),
  word({ id: "bright", word: "Bright", phonetic: "/brɪt/", translation: "brillante", sentencesReady: 0 }),
];

const POPULATED: SavedData = { words: WORDS, stats: deriveSavedStats(WORDS) };
const EMPTY: SavedData = { words: [], stats: deriveSavedStats([]) };

/** A QueryClient whose cache already holds the fixture — no network in stories. */
function makeSeededClient(data: SavedData): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(savedQueryKey, data);
  return client;
}

function withData(data: SavedData) {
  return function Decorator(Story: () => ReactElement) {
    return (
      <QueryClientProvider client={makeSeededClient(data)}>
        <Story />
      </QueryClientProvider>
    );
  };
}

const meta = {
  title: "Features/Saved/SavedScreen",
  component: SavedScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SavedScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Populated — eight saved words, two stat pills, 4-column grid. Remove a card
 * with its trash button (optimistic; rolls back without MSW). */
export const Populated: Story = {
  decorators: [withData(POPULATED)],
};

/** Empty — zero words: centered header above the designed EmptyState card. */
export const Empty: Story = {
  decorators: [withData(EMPTY)],
};

/** Mobile — the responsive variant: navbar icon-row, single stat pill, one
 * column of cards. Same component, no rebuild. */
export const Mobile: Story = {
  decorators: [withData(POPULATED)],
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
