import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { profileQueryKey } from "../api/getProfile";
import type { ProfileData } from "../types";
import { ProfileScreen } from "./ProfileScreen";

/**
 * ProfileScreen — the full Profile screen (Figma desktop 149:212, mobile
 * 870:1117).
 *
 * The screen reads its user + stats through TanStack Query (`useProfile`) and
 * its five reading preferences from the global persisted `usePreferences` store.
 * Rather than run MSW inside Storybook, each story seeds a fresh QueryClient
 * cache with a fixture under the real `profileQueryKey`, so `useProfile`
 * resolves instantly; the settings are live against the real store (changes
 * persist to localStorage across reloads of the preview), and the destructive
 * Account rows open real confirm modals.
 */

const PROFILE: ProfileData = {
  user: {
    name: "Karina Suárez",
    email: "karina@readeasily.app",
    joinedAt: "2026-06-01T00:00:00.000Z",
  },
  stats: { wordsSaved: 8, practiceSets: 2, inProgress: 1, finished: 3 },
};

/** A QueryClient whose cache already holds the fixture — no network in stories. */
function makeSeededClient(data: ProfileData): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(profileQueryKey, data);
  return client;
}

/** A QueryClient whose profile query never resolves — for the loading story. */
function makePendingClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, queryFn: () => new Promise(() => {}) },
    },
  });
}

function withClient(client: QueryClient) {
  return function Decorator(Story: () => ReactElement) {
    return (
      <QueryClientProvider client={client}>
        <Story />
      </QueryClientProvider>
    );
  };
}

const meta = {
  title: "Features/Profile/ProfileScreen",
  component: ProfileScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ProfileScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Desktop — header card, a row of 4 stat tiles, the 5 settings rows, and the
 * 3 account rows. Change a setting (it persists) or open a destructive modal. */
export const Desktop: Story = {
  decorators: [withClient(makeSeededClient(PROFILE))],
};

/** Mobile — the responsive variant: navbar icon-row, centered header column,
 * 2×2 stats grid, segmented controls wrapped below their text. Same component. */
export const Mobile: Story = {
  decorators: [withClient(makeSeededClient(PROFILE))],
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

/** Loading — the header + stats skeletons while the profile fetch is pending
 * (the settings below stay interactive, since they're store-driven). */
export const Loading: Story = {
  decorators: [withClient(makePendingClient())],
};
