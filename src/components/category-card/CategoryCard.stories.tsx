import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CategoryCard, type CategoryId } from "./CategoryCard";

/**
 * CategoryCard stories cover the full Figma component SET — all 4 categories
 * (Fables / Daily Life / Technology / Travel) × both `selected` states — plus a
 * hover/focus showcase and the Search-grid example the cards live in.
 *
 * Each card is a real link; the `href` here is illustrative. The grid stories
 * size the cards via the surrounding grid (202px desktop / 172px mobile column),
 * matching the responsive-by-grid rule.
 */
const meta = {
  title: "Components/CategoryCard",
  component: CategoryCard,
  parameters: { layout: "padded" },
  args: {
    category: "fables",
    label: "Fables",
    storyCount: 4,
    href: "/search?category=fables",
    selected: false,
  },
  // Constrain the standalone canvas to the Figma desktop width.
  decorators: [
    (Story) => (
      <div className="w-[202px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CategoryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/* --- per-category single cards (unselected) -------------------------------- */

export const Fables: Story = {};

export const DailyLife: Story = {
  args: { category: "daily-life", label: "Daily Life", storyCount: 2, href: "/search?category=daily-life" },
};

export const Technology: Story = {
  args: { category: "technology", label: "Technology", storyCount: 2, href: "/search?category=technology" },
};

export const Travel: Story = {
  args: { category: "travel", label: "Travel", storyCount: 2, href: "/search?category=travel" },
};

/* --- selected state (the view you're currently on) ------------------------- */

export const FablesSelected: Story = { args: { selected: true } };

export const DailyLifeSelected: Story = {
  args: { category: "daily-life", label: "Daily Life", storyCount: 2, href: "/search?category=daily-life", selected: true },
};

export const TechnologySelected: Story = {
  args: { category: "technology", label: "Technology", storyCount: 2, href: "/search?category=technology", selected: true },
};

export const TravelSelected: Story = {
  args: { category: "travel", label: "Travel", storyCount: 2, href: "/search?category=travel", selected: true },
};

/* --- the full 8-cell variant matrix --------------------------------------- */

const CATEGORIES: Array<{ id: CategoryId; label: string; count: number }> = [
  { id: "fables", label: "Fables", count: 4 },
  { id: "daily-life", label: "Daily Life", count: 2 },
  { id: "technology", label: "Technology", count: 2 },
  { id: "travel", label: "Travel", count: 2 },
];

export const AllVariants: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [],
  render: () => (
    <div className="space-y-6 bg-canvas p-8">
      {[false, true].map((sel) => (
        <div key={String(sel)}>
          <p className="mb-3 font-ui text-label-m font-semibold text-muted">
            {sel ? "Selected (aria-current=page)" : "Unselected"}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CATEGORIES.map((c) => (
              <CategoryCard
                key={c.id}
                category={c.id}
                label={c.label}
                storyCount={c.count}
                href={`/search?category=${c.id}`}
                selected={sel}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

/* --- hover / focus showcase ------------------------------------------------ */

export const HoverFocusShowcase: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [],
  render: () => (
    <div className="bg-canvas p-8">
      <p className="mb-3 font-ui text-label-m font-semibold text-muted">
        Hover lifts the card (shadow-card → shadow-md + 2px rise); Tab paints the
        AA focus ring. Both respect prefers-reduced-motion.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CATEGORIES.map((c) => (
          <CategoryCard
            key={c.id}
            category={c.id}
            label={c.label}
            storyCount={c.count}
            href={`/search?category=${c.id}`}
          />
        ))}
      </div>
    </div>
  ),
};

/* --- Search-grid example (one selected = the current view) ----------------- */

export const SearchGrid: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [],
  render: () => (
    <div className="bg-canvas p-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CATEGORIES.map((c) => (
          <CategoryCard
            key={c.id}
            category={c.id}
            label={c.label}
            storyCount={c.count}
            href={`/search?category=${c.id}`}
            selected={c.id === "daily-life"}
          />
        ))}
      </div>
    </div>
  ),
};
