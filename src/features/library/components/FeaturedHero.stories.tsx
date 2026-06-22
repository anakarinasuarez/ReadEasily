import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { FeaturedBook } from "../types";
import { FeaturedHero } from "./FeaturedHero";

/**
 * FeaturedHero — the centered Library hero (Figma node 1272:4575). An
 * interactive, auto-cycling fan of several distinct featured stories over a copy
 * block that always describes the CENTERED story: per-story uppercase eyebrow +
 * optional green editor's-pick badge, display title, muted teaser, an icon'd
 * meta row (level dot · listen-time · word count), and the "Read & Listen" CTA.
 *
 * Run the story live: the fan auto-advances (pausing on hover/focus), the dots
 * are named per story, side covers click to centre, and the copy block + CTA
 * swap to match — without changing the hero's height.
 */
const FEATURED: FeaturedBook[] = [
  {
    id: "the-tortoise-and-the-hare",
    title: "The Tortoise and the Hare",
    level: "A1",
    levelLabel: "Beginner",
    minutes: 5,
    words: 240,
    coverSrc: "/covers/The-tortoise-and-the-hare.webp",
    category: "fables",
    href: "/read/the-tortoise-and-the-hare",
    eyebrow: "Featured Fable",
    teaser:
      "The hare laughs at the slow tortoise — until a steady pace turns a sure win into a famous lesson.",
  },
  {
    id: "a-trip-to-the-mountains",
    title: "A Trip to the Mountains",
    level: "B1",
    levelLabel: "Intermediate",
    minutes: 6,
    words: 540,
    coverSrc: "/covers/A-trip-mountains.webp",
    category: "travel",
    href: "/read/a-trip-to-the-mountains",
    eyebrow: "Featured Journey",
    teaser:
      "A weekend hike, a wrong turn, and a view worth every step — simple English for the road ahead.",
  },
  {
    id: "the-clever-crow",
    title: "The Clever Crow",
    level: "A1",
    levelLabel: "Beginner",
    minutes: 4,
    words: 210,
    coverSrc: "/covers/the-clever-crow.webp",
    category: "fables",
    href: "/read/the-clever-crow",
    eyebrow: "Featured Fable",
    teaser:
      "Thirsty and stuck, a crow finds that a few small stones can solve a very big problem.",
  },
  {
    id: "the-ant-and-the-grasshopper",
    title: "The Ant and the Grasshopper",
    level: "A2",
    levelLabel: "Elementary",
    minutes: 6,
    words: 312,
    coverSrc: "/covers/the-ant-grasshopper.webp",
    category: "fables",
    href: "/read/the-ant-and-the-grasshopper",
    eyebrow: "Featured Fable",
    badgeLabel: "Editor's pick",
    teaser:
      "All summer long the grasshopper sings while the ants store grain. When winter comes, only one of them is ready.",
  },
  {
    id: "the-boy-who-cried-wolf",
    title: "The Boy Who Cried Wolf",
    level: "A2",
    levelLabel: "Elementary",
    minutes: 5,
    words: 300,
    coverSrc: "/covers/The-boy-who-cried-wolf.webp",
    category: "fables",
    href: "/read/the-boy-who-cried-wolf",
    eyebrow: "Featured Fable",
    teaser:
      "A bored shepherd boy raises one false alarm too many — and learns what a lie really costs.",
  },
  {
    id: "a-morning-in-the-city",
    title: "A Morning in the City",
    level: "A2",
    levelLabel: "Elementary",
    minutes: 6,
    words: 320,
    coverSrc: "/covers/A-morning-in-the-city.webp",
    category: "daily-life",
    href: "/read/a-morning-in-the-city",
    eyebrow: "Featured Daily Life",
    teaser:
      "Coffee, a busy bus, and a friendly stranger — everyday English from one ordinary morning.",
  },
  {
    id: "my-first-smartphone",
    title: "My First Smartphone",
    level: "B1",
    levelLabel: "Intermediate",
    minutes: 6,
    words: 520,
    coverSrc: "/covers/My-first-Smartphone.webp",
    category: "technology",
    href: "/read/my-first-smartphone",
    eyebrow: "Featured Technology",
    teaser:
      "Unboxing, set-up, and a few funny mistakes — the words you need for a brand-new phone.",
  },
];

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

/** The default hero, exactly as the Library landing composes it (centre = Ant). */
export const Default: Story = {};

/** A centre story WITHOUT an editor's-pick badge (eyebrow only). */
export const NoBadge: Story = {
  args: { featured: FEATURED.map((story) => ({ ...story, badgeLabel: undefined })) },
};

/**
 * Layout stress — the centred story has a long, wrapping title AND a long
 * teaser, so the reserved two-line min-heights keep the CTA from shifting. Run
 * live and select other (shorter) stories: the hero height must NOT change.
 */
export const LongerStory: Story = {
  args: {
    featured: FEATURED.map((story, i) =>
      i === Math.floor(FEATURED.length / 2)
        ? {
            ...story,
            title: "The Lighthouse Keeper and the Long Winter Storm",
            level: "B1",
            levelLabel: "Intermediate",
            minutes: 12,
            words: 980,
            teaser:
              "When the lamp goes dark on the longest night of the year, the keeper must choose between the ships at sea and the warmth of a home that has waited far too long.",
          }
        : story,
    ),
  },
};
