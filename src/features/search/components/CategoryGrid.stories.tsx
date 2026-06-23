import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { SearchCategory } from "../types";
import { CategoryGrid } from "./CategoryGrid";

/**
 * CategoryGrid — the four browse cards. Prop-injected (no data layer), so these
 * stories exercise the layout + the `active` state directly: the "All" view
 * (nothing selected) and a category view (one card carries the selected ring +
 * check badge + `aria-current`). Mobile collapses the single row of 4 to a 2×2
 * grid via the same component (responsive-by-grid, no rebuild).
 */

const CATEGORIES: SearchCategory[] = [
  { id: "fables", label: "Fables", storyCount: 4 },
  { id: "daily-life", label: "Daily Life", storyCount: 2 },
  { id: "technology", label: "Technology", storyCount: 2 },
  { id: "travel", label: "Travel", storyCount: 2 },
];

const meta = {
  title: "Features/Search/CategoryGrid",
  component: CategoryGrid,
  parameters: { layout: "padded" },
  args: {
    categories: CATEGORIES,
    active: "all",
    onSelect: () => {},
  },
} satisfies Meta<typeof CategoryGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** All view — nothing selected. */
export const All: Story = {};

/** A category view — Fables selected (selected ring + check + aria-current). */
export const FablesSelected: Story = {
  args: { active: "fables" },
};

/** Travel selected — a different category view. */
export const TravelSelected: Story = {
  args: { active: "travel" },
};

/** Mobile — the 2×2 responsive variant. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
