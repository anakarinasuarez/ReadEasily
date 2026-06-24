import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, within } from "storybook/test";
import { practiceQueryKey } from "../api/getPractice";
import { resolvePracticeSet } from "../content";
import type { PracticeResponse } from "../types";
import { PracticeOverlay } from "./PracticeOverlay";

/**
 * PracticeOverlay — the Reader's "practise this word" dialog (Figma desktop
 * 879:1263, mobile 992:1657). Opened from the WordPopover Practice button for a
 * selected word, in the active translation language.
 *
 * Rather than run MSW in Storybook, each story seeds a fresh QueryClient cache
 * under `practiceQueryKey` so the overlay resolves instantly: the sample stories
 * inject the precomputed set; the empty story injects a `found:false` miss. Audio
 * is live where the Storybook browser exposes `speechSynthesis`.
 */
function seededClient(word: string, response: PracticeResponse): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(practiceQueryKey(word, 0), response);
  return client;
}

function hit(word: string): PracticeResponse {
  const set = resolvePracticeSet(word);
  return { word: set?.word ?? word, found: true, sentences: set?.sentences ?? [] };
}

function withCache(word: string, response: PracticeResponse) {
  return function Decorator(Story: () => ReactElement) {
    return (
      <QueryClientProvider client={seededClient(word, response)}>
        <Story />
      </QueryClientProvider>
    );
  };
}

const meta = {
  title: "Features/Practice/PracticeOverlay",
  component: PracticeOverlay,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    onOpenChange: () => {},
    word: "Path",
    translation: "sendero, camino",
    language: "es",
    voice: "en-US",
    sourceStoryId: "the-ant-and-the-grasshopper",
    sourceStoryTitle: "The Ant & the Grasshopper",
  },
} satisfies Meta<typeof PracticeOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Loaded — ten sentences, the target word underlined in the accent, Spanish
 *  translations beneath, the Hide/New/Save controls, per-sentence speakers. */
export const Sample: Story = {
  decorators: [withCache("Path", hit("Path"))],
  play: async () => {
    const dialog = within(document.body).getByRole("dialog");
    await expect(
      within(dialog).getByRole("list", { name: "Practice sentences for Path" }),
    ).toBeVisible();
  },
};

/** French — the same set, translations resolved to the active language. */
export const FrenchTranslations: Story = {
  args: { word: "Path", translation: "sentier, chemin", language: "fr" },
  decorators: [withCache("Path", hit("Path"))],
};

/** Empty — a word with no precomputed sample degrades to the friendly empty
 *  state (the TODO(practice-generation) seam), never a broken/blank list. */
export const Empty: Story = {
  args: { word: "Glimmer", translation: "destello" },
  decorators: [
    withCache("Glimmer", { word: "glimmer", found: false, sentences: [] }),
  ],
};

/** Mobile — the responsive variant: a full-height bottom sheet, the utility
 *  actions collapse and the body keeps a single full-width Save CTA. No rebuild. */
export const Mobile: Story = {
  decorators: [withCache("Path", hit("Path"))],
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
