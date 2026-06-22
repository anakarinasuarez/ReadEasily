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
  books: [
    {
      id: "the-tortoise-and-the-hare",
      title: "The Tortoise and the Hare",
      level: "A1",
      minutes: 4,
      coverSrc: "/covers/tortoise-hare.svg",
      category: "fables",
      href: "/read/the-tortoise-and-the-hare",
    },
    {
      id: "the-lion-and-the-mouse",
      title: "The Lion and the Mouse",
      level: "A2",
      minutes: 5,
      coverSrc: "/covers/lion-mouse.svg",
      category: "fables",
      href: "/read/the-lion-and-the-mouse",
    },
    {
      id: "the-fox-and-the-grapes",
      title: "The Fox and the Grapes",
      level: "A1",
      minutes: 3,
      coverSrc: "/covers/fox-grapes.svg",
      category: "fables",
      href: "/read/the-fox-and-the-grapes",
    },
    {
      id: "the-boy-who-cried-wolf",
      title: "The Boy Who Cried Wolf",
      level: "A2",
      minutes: 6,
      coverSrc: "/covers/crying-wolf.svg",
      category: "fables",
      href: "/read/the-boy-who-cried-wolf",
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

/** A short "Continue listening"-style shelf (two books). */
export const ShortShelf: Story = {
  args: {
    section: {
      id: "continue",
      title: "Continue listening",
      subtitle: "Pick up where you left off",
      books: SECTION.books.slice(0, 2),
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
