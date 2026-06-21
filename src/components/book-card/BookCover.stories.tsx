import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookCover } from "./BookCover";

const COVER =
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=640&q=80";

const meta = {
  title: "Components/BookCover",
  component: BookCover,
  parameters: { layout: "centered" },
  args: { src: COVER, alt: "The Ant & the Grasshopper cover", size: "small" },
  argTypes: {
    size: { control: "inline-radio", options: ["thumbnail", "small", "hero"] },
    src: { control: "text" },
    alt: { control: "text" },
  },
} satisfies Meta<typeof BookCover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Smallest size — 140×200 grid thumbnail, shadow-sm. */
export const Thumbnail: Story = { args: { size: "thumbnail" } };

/** Default size — 168×242 library tile, shadow-sm. */
export const Small: Story = {};

/** Largest size — 320×480 reader hero, shadow-md. */
export const Hero: Story = { args: { size: "hero" } };

/** Broken URL → the warm token-bound fallback tile (never a broken `<img>`). */
export const Fallback: Story = { args: { src: "https://example.com/missing.png" } };

/** All three sizes side by side, the way the Figma variant set is laid out. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-[var(--space-lg)]">
      <BookCover {...args} size="thumbnail" />
      <BookCover {...args} size="small" />
      <BookCover {...args} size="hero" />
    </div>
  ),
};
