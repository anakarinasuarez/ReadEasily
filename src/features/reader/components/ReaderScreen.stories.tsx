import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";
import { storyQueryKey } from "../api/getStory";
import { savedQueryKey } from "@/features/saved/api/getSaved";
import { deriveSavedStats } from "@/features/saved/types";
import { loadStory } from "../content/loader";
import { ReaderScreen } from "./ReaderScreen";

/**
 * ReaderScreen — the full reading surface (Figma "Screen / Reader" desktop
 * 125:153, mobile 856:928). Audio is Web Speech (client TTS): where the
 * Storybook browser exposes `speechSynthesis` the PlayerBar is live, else it
 * keeps its inert "Audio is unavailable" state. The header carries the
 * translation-language (ES/FR/PT) and voice (US/UK) dropdowns.
 *
 * The screen reads its story + saved list through TanStack Query. Rather than run
 * MSW in Storybook, each story seeds a fresh QueryClient cache with the real
 * parsed story (via the content loader) under `storyQueryKey` (default ES), plus
 * an empty saved list, so the screen resolves instantly to the loaded state. (A
 * language switch in Storybook refetches and 404s without MSW — switch language
 * in the app/tests.) Save is live (it 404s without MSW, then rolls back).
 */
const CLEVER_CROW = loadStory("the-clever-crow")!; // A1 — ES by default

// A no-translation variant of the same story (all ten stories ship sidecars in
// all three languages now, so the graceful-degrade state is synthesized: strip
// the translations + glossary so the translation block hides and the popover
// shows the pending note). Demonstrates the degrade path without a fixture.
const NO_TRANSLATION: typeof CLEVER_CROW = {
  ...CLEVER_CROW,
  id: "clever-crow-no-translation",
  hasTranslation: false,
  glossary: {},
  pages: CLEVER_CROW.pages.map((p) => ({ ...p, translationParagraphs: [] })),
};

function makeSeededClient(story: typeof CLEVER_CROW) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(storyQueryKey(story.id), story);
  client.setQueryData(savedQueryKey, { words: [], stats: deriveSavedStats([]) });
  return client;
}

function withStory(story: typeof CLEVER_CROW) {
  return function Decorator(Story: () => ReactElement) {
    return (
      <QueryClientProvider client={makeSeededClient(story)}>
        <Story />
      </QueryClientProvider>
    );
  };
}

const meta = {
  title: "Features/Reader/ReaderScreen",
  component: ReaderScreen,
  parameters: { layout: "fullscreen" },
  args: { storyId: CLEVER_CROW.id },
} satisfies Meta<typeof ReaderScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A page — title, reading card with tappable words, translation block, the
 *  disabled PlayerBar. Tap any word to open its meaning. */
export const Page: Story = {
  decorators: [withStory(CLEVER_CROW)],
};

/** Popover open — the tap-a-word meaning panel anchored to a word. */
export const PopoverOpen: Story = {
  decorators: [withStory(CLEVER_CROW)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = await canvas.findByRole("group", {
      name: "Story text — tap a word for its meaning",
    });
    await userEvent.click(within(group).getByRole("button", { name: "sun" }));
    await expect(await canvas.findByRole("dialog", { name: "Sun" })).toBeVisible();
  },
};

/** No translation — the graceful degrade: with no sidecar the translation block
 *  hides (the language dropdown stays, so a reader can switch language), and a
 *  tapped word's popover shows a pending note with Save disabled. */
export const NoTranslation: Story = {
  args: { storyId: NO_TRANSLATION.id },
  decorators: [withStory(NO_TRANSLATION)],
};

/** Mobile — the responsive variant: single column, compact header pills, the
 *  PlayerBar pinned. Same component, no rebuild. */
export const Mobile: Story = {
  decorators: [withStory(CLEVER_CROW)],
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
