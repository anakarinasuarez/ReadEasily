import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MoralCallout } from "./MoralCallout";

const meta = {
  title: "Components/MoralCallout",
  component: MoralCallout,
  parameters: { layout: "padded" },
  args: {
    moral: "There is a time for work and a time for play.",
  },
  decorators: [
    (Story) => (
      <div className="max-w-[532px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MoralCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The canonical Story Detail moral callout. */
export const Default: Story = {};

/** A longer moral — the card grows; type and spacing hold. */
export const LongMoral: Story = {
  args: {
    moral:
      "Idleness in the warm days of plenty leaves you cold and hungry when the lean season finally comes — so gather what you can while you still can, and let no easy summer fool you into forgetting the winter ahead.",
  },
};

/** A custom eyebrow label. */
export const CustomLabel: Story = {
  args: {
    label: "The Lesson",
    moral: "Slow and steady wins the race.",
  },
};
