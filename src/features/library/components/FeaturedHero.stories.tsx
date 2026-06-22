import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { FeaturedBook } from "../types";
import { FeaturedHero } from "./FeaturedHero";

/**
 * FeaturedHero — the centered Library hero (Figma node 1272:4575). A purely
 * decorative, auto-cycling cover fan over the featured story's copy block:
 * orange uppercase eyebrow + green editor's-pick badge, display title, muted
 * teaser, an icon'd meta row (level dot · listen-time · word count), and the
 * "Read & Listen" CTA into the reader.
 *
 * There is a single featured story, so the fan advertises no choice — run the
 * story live to see it animate while the copy stays put.
 */
const FEATURED: FeaturedBook = {
  id: "the-ant-and-the-grasshopper",
  title: "The Ant and the Grasshopper",
  level: "A2",
  levelLabel: "Elementary",
  minutes: 6,
  words: 312,
  coverSrc: "/covers/ant-grasshopper.svg",
  category: "fables",
  href: "/read/the-ant-and-the-grasshopper",
  teaser:
    "All summer long the grasshopper sings while the ants store grain. When winter comes, only one of them is ready.",
  badgeLabel: "Editor's pick",
  showcaseCovers: [
    "/covers/ant-grasshopper.svg",
    "/covers/tortoise-hare.svg",
    "/covers/lion-mouse.svg",
    "/covers/fox-grapes.svg",
    "/covers/crying-wolf.svg",
    "/covers/lighthouse.svg",
    "/covers/market.svg",
  ],
};

const meta = {
  title: "Features/Library/FeaturedHero",
  component: FeaturedHero,
  parameters: { layout: "fullscreen" },
  args: { featured: FEATURED },
  decorators: [
    (Story) => (
      <div className="bg-canvas px-4 py-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeaturedHero>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default hero, exactly as the Library landing composes it. */
export const Default: Story = {};

/** A longer story with a higher level + word count (layout stress). */
export const LongerStory: Story = {
  args: {
    featured: {
      ...FEATURED,
      title: "The Lighthouse Keeper and the Winter Storm",
      level: "B1",
      levelLabel: "Intermediate",
      minutes: 12,
      words: 980,
      teaser:
        "When the lamp goes dark on the longest night of the year, the keeper must choose between the ships at sea and the warmth of home.",
      badgeLabel: "Staff favourite",
    },
  },
};
