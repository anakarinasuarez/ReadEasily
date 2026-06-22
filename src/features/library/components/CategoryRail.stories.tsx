import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CatalogSection } from "../types";
import { CategoryRail, RailDivider } from "./CategoryRail";

/**
 * CategoryRail — one labelled shelf of books (Figma node 1272:4623): a full-
 * height accent marker bar + title + subtitle, then a horizontally-scrolling
 * row of BookCards. The RailDivider story shows the decorative rule that sits
 * between stacked rails.
 */
const SECTION: CatalogSection = {
  id: "fables",
  title: "Fables",
  subtitle: "Timeless tales, gently retold",
  accent: "bg-cat-fables-rail",
  books: [
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
  ],
};

const meta = {
  title: "Features/Library/CategoryRail",
  component: CategoryRail,
  parameters: { layout: "padded" },
  args: { section: SECTION },
  decorators: [
    (Story) => (
      <div className="bg-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CategoryRail>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A standard four-book shelf. */
export const Default: Story = {};

/** A short "Continue listening"-style shelf (two books, brand accent bar). */
export const ShortShelf: Story = {
  args: {
    section: {
      id: "continue",
      title: "Continue listening",
      subtitle: "Pick up where you left off",
      accent: "bg-accent",
      books: SECTION.books.slice(0, 2),
    },
  },
};

/** The Travel shelf — shows the per-section accent bar in a category color. */
export const TravelAccent: Story = {
  args: {
    section: {
      id: "travel",
      title: "Travel",
      subtitle: "Stories from the road",
      accent: "bg-cat-travel",
      books: [
        {
          id: "a-trip-to-the-mountains",
          title: "A Trip to the Mountains",
          level: "B1",
          minutes: 6,
          coverSrc: "/covers/A-trip-mountains.webp",
          category: "travel",
          href: "/read/a-trip-to-the-mountains",
        },
      ],
    },
  },
};

/** Two rails separated by the decorative divider. */
export const StackedWithDivider: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <CategoryRail {...args} />
      <RailDivider />
      <CategoryRail
        section={{
          ...SECTION,
          id: "fables-2",
          title: "More fables",
          subtitle: "Another shelf below the rule",
        }}
      />
    </div>
  ),
};
