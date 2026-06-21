import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookCard } from "./BookCard";

const BOOK = {
  title: "The Ant & the Grasshopper",
  level: "A2",
  minutes: 6,
  coverSrc:
    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=640&q=80",
};

const meta = {
  title: "Components/BookCard",
  component: BookCard,
  parameters: { layout: "centered" },
  args: { book: BOOK, href: "/read/ant-grasshopper" },
  argTypes: {
    href: { control: "text" },
    loading: { control: "boolean" },
    onPlay: { action: "play" },
  },
} satisfies Meta<typeof BookCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Resting tile — cover, title, `level · minutes` meta. Hover to reveal the
 *  scrim + terracotta play FAB (this IS the Hover variant; CSS-only state). */
export const Default: Story = {};

/**
 * Hover/focus reference — the scrim + play FAB can't be frozen as an arg.
 * Hover (or tab to) the card to see the 200ms reveal.
 */
export const HoverReference: Story = {
  render: (args) => (
    <div className="flex gap-[var(--space-lg)]">
      <BookCard {...args} />
    </div>
  ),
};

/** Interactive play — `onPlay` makes the FAB a real nested button that fires
 *  its own action (and stops propagation) instead of riding the link. */
export const WithPlay: Story = {
  args: { onPlay: () => {} },
};

/** Skeleton placeholder — cover shimmer + title/meta bars while data loads. */
export const Loading: Story = { args: { loading: true } };

/** Cover load failure → warm fallback tile inside the card (never broken art). */
export const CoverError: Story = {
  args: { book: { ...BOOK, coverSrc: "https://example.com/missing.png" } },
};

/** A small grid, the way cards appear in the Browse screen. */
export const Grid: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-[var(--space-lg)]">
      <BookCard {...args} />
      <BookCard
        {...args}
        book={{ ...BOOK, title: "The Tortoise & the Hare", level: "B1", minutes: 8 }}
        href="/read/tortoise-hare"
      />
      <BookCard {...args} loading />
    </div>
  ),
};
