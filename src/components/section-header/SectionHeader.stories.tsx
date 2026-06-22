import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SectionHeader } from "./SectionHeader";

/**
 * SectionHeader stories show the default Heading/H2, alternative heading levels
 * (the `as` prop), and a long title that wraps — the marker bar stays full text
 * height via `self-stretch`.
 */
const meta = {
  title: "Components/SectionHeader",
  component: SectionHeader,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[640px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: "Fables" },
};

export const AsH1: Story = {
  args: { title: "Search", as: "h1" },
};

export const AsH3: Story = {
  args: { title: "Daily life", as: "h3" },
};

/** A long title wraps; the marker bar stretches to the full text height. */
export const LongTitle: Story = {
  args: {
    title: "Stories to read and listen on a slow afternoon",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[320px]">
        <Story />
      </div>
    ),
  ],
};

/** Stacked, as they appear down a results page. */
export const Stacked: Story = {
  args: { title: "Fables" },
  render: () => (
    <div className="flex flex-col gap-2xl">
      <SectionHeader title="Fables" />
      <SectionHeader title="Daily life" />
      <SectionHeader title="Travel" />
    </div>
  ),
};
