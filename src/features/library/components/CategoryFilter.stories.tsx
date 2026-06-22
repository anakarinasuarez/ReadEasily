import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import type { Category } from "../types";
import { CategoryFilter } from "./CategoryFilter";

/**
 * CategoryFilter — the single-select chip row that filters the catalog rails in
 * place (Figma node 1272:4613). Reuses the Chip primitive inside a Radix
 * ToggleGroup (radio semantics). Stories cover the selected/unselected states
 * and the live, interactive selection.
 */
const CATEGORIES: Category[] = [
  { id: "all", label: "All" },
  { id: "fables", label: "Fables" },
  { id: "daily-life", label: "Daily Life" },
  { id: "technology", label: "Technology" },
  { id: "travel", label: "Travel" },
];

const meta = {
  title: "Features/Library/CategoryFilter",
  component: CategoryFilter,
  parameters: { layout: "padded" },
  args: { categories: CATEGORIES, value: "all", onValueChange: () => {} },
  decorators: [
    (Story) => (
      <div className="bg-canvas p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CategoryFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default selection — the "All" sentinel chip is active. */
export const AllSelected: Story = { args: { value: "all" } };

/** A specific category selected — "Travel" carries the active fill. */
export const CategorySelected: Story = { args: { value: "travel" } };

/** Live — clicking a chip moves the single active selection. */
export const Interactive: Story = {
  render: (args) => {
    function Demo() {
      const [value, setValue] = useState("all");
      return (
        <CategoryFilter {...args} value={value} onValueChange={setValue} />
      );
    }
    return <Demo />;
  },
};
