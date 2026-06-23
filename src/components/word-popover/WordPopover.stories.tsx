import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WordPopover } from "./WordPopover";

/**
 * The WordPopover is presentational + controlled. Stories render it on a warm
 * canvas and wire the `saved` toggle locally so the Save↔Saved behaviour is
 * visible; data (translation / pos / status) is passed in, never fetched.
 */
const meta = {
  title: "Components/WordPopover",
  component: WordPopover,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="flex min-h-[420px] items-center justify-center bg-[var(--bg-canvas)] p-[var(--space-3xl)]">
        <Story />
      </div>
    ),
  ],
  args: {
    word: "Path",
    pos: "noun",
    translation: "sendero, camino",
    status: "ready",
    saved: false,
  },
} satisfies Meta<typeof WordPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Local-state wrapper so the Save button visibly toggles in the story. */
function Interactive(args: React.ComponentProps<typeof WordPopover>) {
  const [saved, setSaved] = useState(args.saved ?? false);
  return (
    <WordPopover
      {...args}
      saved={saved}
      onToggleSave={() => setSaved((s) => !s)}
    />
  );
}

/** Canonical ready state: noun, translation, unsaved. */
export const Ready: Story = {
  render: (args) => <Interactive {...args} />,
};

/** Already-saved: filled bookmark + "Saved" label. */
export const Saved: Story = {
  args: { saved: true },
  render: (args) => <Interactive {...args} />,
};

/** Loading: skeletons replace POS + translation; header word still shows. */
export const Loading: Story = {
  args: { status: "loading" },
  render: (args) => <Interactive {...args} />,
};

/** Error: inline "Couldn't load — retry" affordance. */
export const ErrorState: Story = {
  args: { status: "error" },
  render: (args) => <Interactive {...args} />,
};

/** Long, comma-joined senses wrap within the fixed-width card. */
export const LongTranslation: Story = {
  args: {
    word: "Run",
    pos: "verb",
    translation: "correr, gestionar, dirigir, fluir, funcionar, postularse",
  },
  render: (args) => <Interactive {...args} />,
};

/** No part-of-speech supplied — the POS pill is omitted entirely. */
export const NoPos: Story = {
  args: { pos: undefined },
  render: (args) => <Interactive {...args} />,
};
