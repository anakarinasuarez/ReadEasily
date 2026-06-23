import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { searchQueryKey } from "../api/getSearch";
import type { SearchData } from "../types";
import { SearchScreen } from "./SearchScreen";

/**
 * SearchScreen — the full browse-by-category screen (Figma "Screen / Search"
 * 132:129, All variant 1282:4099).
 *
 * The screen reads its catalog through TanStack Query (`useSearch`). Rather than
 * run MSW inside Storybook, each story seeds a fresh QueryClient cache with a
 * fixture under the real `searchQueryKey`, so `useSearch` resolves instantly to
 * the loaded state. Drive both modes live: select a category card to filter the
 * results + section header (same-screen morph, scroll preserved; re-selecting
 * the active card returns to "All stories"), OR type in the SearchField to run a
 * live, whole-catalog text search (clearing it restores the category view; a
 * no-match query shows the EmptyState).
 */

const FIXTURE: SearchData = {
  categories: [
    { id: "fables", label: "Fables", storyCount: 4 },
    { id: "daily-life", label: "Daily Life", storyCount: 2 },
    { id: "technology", label: "Technology", storyCount: 2 },
    { id: "travel", label: "Travel", storyCount: 2 },
  ],
  stories: [
    {
      id: "the-ant-and-the-grasshopper",
      title: "The Ant and the Grasshopper",
      level: "A2",
      minutes: 6,
      coverSrc: "/covers/the-ant-grasshopper.webp",
      category: "fables",
      href: "/read/the-ant-and-the-grasshopper",
    },
    {
      id: "the-clever-crow",
      title: "The Clever Crow",
      level: "A1",
      minutes: 4,
      coverSrc: "/covers/the-clever-crow.webp",
      category: "fables",
      href: "/read/the-clever-crow",
    },
    {
      id: "the-boy-who-cried-wolf",
      title: "The Boy Who Cried Wolf",
      level: "A2",
      minutes: 5,
      coverSrc: "/covers/The-boy-who-cried-wolf.webp",
      category: "fables",
      href: "/read/the-boy-who-cried-wolf",
    },
    {
      id: "the-tortoise-and-the-hare",
      title: "The Tortoise and the Hare",
      level: "A1",
      minutes: 5,
      coverSrc: "/covers/The-tortoise-and-the-hare.webp",
      category: "fables",
      href: "/read/the-tortoise-and-the-hare",
    },
    {
      id: "a-morning-in-the-city",
      title: "A Morning in the City",
      level: "A2",
      minutes: 6,
      coverSrc: "/covers/A-morning-in-the-city.webp",
      category: "daily-life",
      href: "/read/a-morning-in-the-city",
    },
    {
      id: "the-lost-keys",
      title: "The Lost Keys",
      level: "A2",
      minutes: 4,
      coverSrc: "/covers/the-lost-keys.webp",
      category: "daily-life",
      href: "/read/the-lost-keys",
    },
    {
      id: "my-first-smartphone",
      title: "My First Smartphone",
      level: "B1",
      minutes: 6,
      coverSrc: "/covers/My-first-Smartphone.webp",
      category: "technology",
      href: "/read/my-first-smartphone",
    },
    {
      id: "the-helpful-robot",
      title: "The Helpful Robot",
      level: "A2",
      minutes: 5,
      coverSrc: "/covers/the-helpful-robot.webp",
      category: "technology",
      href: "/read/the-helpful-robot",
    },
    {
      id: "a-trip-to-the-mountains",
      title: "A Trip to the Mountains",
      level: "B1",
      minutes: 6,
      coverSrc: "/covers/A-trip-mountains.webp",
      category: "travel",
      href: "/read/a-trip-to-the-mountains",
    },
    {
      id: "lost-at-the-airport",
      title: "Lost at the Airport",
      level: "B1",
      minutes: 7,
      coverSrc: "/covers/Airport.webp",
      category: "travel",
      href: "/read/lost-at-the-airport",
    },
  ],
};

/** A QueryClient whose cache already holds the fixture — no network in stories. */
function makeSeededClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(searchQueryKey, FIXTURE);
  return client;
}

const meta = {
  title: "Features/Search/SearchScreen",
  component: SearchScreen,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeSeededClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof SearchScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — lands on "All stories" (no card selected), the whole catalog shown.
 * Select a category card to filter; select it again to return to All.
 */
export const AllStories: Story = {};

/** Mobile — the responsive variant: navbar icon-row, 2×2 category grid, 2-col
 * results. Same component, no rebuild. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
