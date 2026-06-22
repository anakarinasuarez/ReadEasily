import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LibraryEmpty, LibraryError, LibrarySkeleton } from "./LibraryStates";

/**
 * LibraryStates — the Library's three designed non-data states (Figma node
 * 1272:4578 content area). In ReadEasily the states ARE the design, so each one
 * is a real, laid-out treatment and gets its own story:
 *   - Skeleton — the loading placeholder, footprints mirroring the loaded layout
 *   - Empty    — a filter yielded no rails; offers a one-tap reset to "All"
 *   - Error    — the query failed; offers a retry (announced as an alert)
 */
const meta = {
  title: "Features/Library/LibraryStates",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex justify-center bg-canvas px-4 py-10">
        <div className="flex w-full max-w-7xl justify-center">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Loading — shimmer hero + two rail placeholders, no reflow on data arrival. */
export const Skeleton: Story = {
  render: () => <LibrarySkeleton />,
};

/** Empty — the active filter matched no stories; "Show all" resets the filter. */
export const Empty: Story = {
  render: () => <LibraryEmpty onShowAll={() => {}} />,
};

/** Error — the catalog query failed; "Try again" re-runs it. */
export const Error: Story = {
  render: () => <LibraryError onRetry={() => {}} />,
};
