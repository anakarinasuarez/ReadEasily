import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LandingShowcase, type LandingShowcaseItem } from "./LandingShowcase";

/**
 * LandingShowcase — the Landing's decorative book display: a large auto-cycling
 * active cover above a 5-thumbnail rail. Purely presentational (`aria-hidden`,
 * no tab stops). The Default story auto-cycles; ReducedMotion is pinned static.
 */
const ITEMS: LandingShowcaseItem[] = [
  { coverSrc: "/covers/the-ant-grasshopper.webp", alt: "The Ant and the Grasshopper" },
  { coverSrc: "/covers/The-tortoise-and-the-hare.webp", alt: "The Tortoise and the Hare" },
  { coverSrc: "/covers/the-clever-crow.webp", alt: "The Clever Crow" },
  { coverSrc: "/covers/The-boy-who-cried-wolf.webp", alt: "The Boy Who Cried Wolf" },
  { coverSrc: "/covers/A-trip-mountains.webp", alt: "A Trip to the Mountains" },
];

const meta = {
  title: "Features/Auth/LandingShowcase",
  component: LandingShowcase,
  parameters: { layout: "centered" },
  args: { items: ITEMS },
} satisfies Meta<typeof LandingShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Auto-cycling (3600ms) — the active cover and framed thumb advance. */
export const Default: Story = {};

/** Static presentation when the consumer's reduce-motion preference is set. */
export const ReducedMotion: Story = {
  args: { reduceMotion: true },
};
