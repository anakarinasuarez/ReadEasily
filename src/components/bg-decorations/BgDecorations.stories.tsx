import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BgDecorations } from "./BgDecorations";

/**
 * BgDecorations sits BEHIND content, so every story renders it inside a
 * `relative` frame with sample foreground content on top to prove the layering,
 * the tint placement, and that it never obscures or blocks the UI.
 */
const meta = {
  title: "Components/BgDecorations",
  component: BgDecorations,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BgDecorations>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Backdrop behind a sample screen. */
export const BehindContent: Story = {
  render: (args) => (
    <div className="relative min-h-[600px] w-full overflow-hidden bg-canvas">
      <BgDecorations {...args} />
      <div className="relative z-0 mx-auto max-w-[480px] px-lg py-3xl">
        <h1 className="font-display text-display-l font-extrabold text-primary">
          Good evening
        </h1>
        <p className="mt-md text-body-l text-secondary">
          The decorations bloom softly behind this content — terracotta top-left,
          sky top-right, forest along the bottom.
        </p>
        <button
          type="button"
          className="mt-xl rounded-pill bg-accent-strong px-xl py-md text-on-accent"
        >
          A button on top
        </button>
      </div>
    </div>
  ),
};

/** Just the backdrop, on a neutral surface, to inspect the tints in isolation. */
export const TintsOnly: Story = {
  render: (args) => (
    <div className="relative min-h-[600px] w-full overflow-hidden bg-canvas">
      <BgDecorations {...args} />
    </div>
  ),
};
