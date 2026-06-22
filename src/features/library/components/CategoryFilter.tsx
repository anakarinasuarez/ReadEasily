"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Chip } from "@/ui/chip";
import type { Category } from "../types";

/**
 * CategoryFilter — the single-select chip row that filters the catalog rails
 * in place (Figma node 1272:4582). It REUSES the Chip primitive, wrapped in a
 * Radix `ToggleGroup type="single"` so exactly one category is ever active and
 * the row gets roving-focus arrow-key navigation for free.
 *
 * Radix single-select gives the group radio semantics (radiogroup / radio +
 * `aria-checked`) — the correct AT model for "pick exactly one". `value` always
 * holds a category id, never empty: re-clicking the active chip is ignored so a
 * filter is always applied (no "nothing selected" state). The Chip's `selected`
 * prop only drives the visual fill; selection state lives in the parent.
 *
 * Mobile: the row scrolls horizontally rather than wrapping (cards/chips keep
 * their footprint), matching the variant rule.
 */
export interface CategoryFilterProps {
  categories: Category[];
  /** The active category id (e.g. "all"). */
  value: string;
  /** Fires with the newly-selected category id. */
  onValueChange: (value: string) => void;
}

export function CategoryFilter({
  categories,
  value,
  onValueChange,
}: CategoryFilterProps) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      // Radix single-select can emit "" when the active item is re-clicked;
      // ignore that so a category is always applied (the "All" sentinel covers
      // the unfiltered case explicitly).
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
      aria-label="Filter stories by category"
      // Mobile: horizontal scroll (chips keep their footprint). Desktop: the
      // row fits the 1200 column, so centre it (Figma centres the chip row).
      className="flex w-full items-center gap-sm overflow-x-auto py-xs md:justify-center"
    >
      {categories.map((category) => (
        <ToggleGroup.Item key={category.id} value={category.id} asChild>
          <Chip selected={category.id === value} className="shrink-0">
            {category.label}
          </Chip>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
