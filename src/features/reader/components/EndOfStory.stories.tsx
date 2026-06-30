import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { EndOfStory } from "./EndOfStory";

/**
 * EndOfStory — the "The End" card shown when a story's narration finishes
 * (Figma node 1058:1829). A green check + completion message on the left, a
 * terracotta "Read again" action on the right, on an elevated card.
 */
const meta = {
  title: "Features/Reader/EndOfStory",
  component: EndOfStory,
  parameters: { layout: "centered" },
  args: {
    storyTitle: "The Ant and the Grasshopper",
    onReadAgain: fn(),
  },
} satisfies Meta<typeof EndOfStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — the completion banner with a long-ish title (subtitle truncates). */
export const Default: Story = {};

/** A short title, and a play test exercising the "Read again" action. */
export const ReadAgain: Story = {
  args: { storyTitle: "The Clever Crow" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const readAgain = canvas.getByRole("button", { name: "Read again" });
    await userEvent.click(readAgain);
    await expect(args.onReadAgain).toHaveBeenCalled();
  },
};
