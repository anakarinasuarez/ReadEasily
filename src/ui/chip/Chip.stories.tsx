import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Chip } from "./Chip";

const meta = {
  title: "UI/Chip",
  component: Chip,
  parameters: { layout: "centered" },
  args: { children: "Label", selected: false, disabled: false },
  argTypes: {
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
    onSelect: { action: "select" },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Unselected, resting state — elevated surface, default border, secondary text. */
export const Unselected: Story = {};

/** Selected — the defining `Selected` property: accent-strong fill, on-accent text. */
export const Selected: Story = { args: { selected: true } };

/** Disabled while unselected — muted text, reduced opacity, no pointer. */
export const UnselectedDisabled: Story = { args: { disabled: true } };

/** Disabled while selected — accent fill held at reduced opacity. */
export const SelectedDisabled: Story = { args: { selected: true, disabled: true } };

/**
 * Hover is a CSS-only state and can't be frozen as an arg. Hover any chip below
 * to verify: unselected lifts to the subtle surface + strong border + primary
 * text; selected darkens to accent-hover. Disabled chips never react to hover.
 */
export const HoverReference: Story = {
  render: () => (
    <div className="flex gap-[var(--space-sm)]">
      <Chip>Unselected</Chip>
      <Chip selected>Selected</Chip>
      <Chip disabled>Disabled</Chip>
    </div>
  ),
};

/** Every variant × state laid out together, the way the Figma set is organized. */
export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-md)]">
      <div className="flex gap-[var(--space-sm)]">
        <Chip selected>Selected</Chip>
        <Chip selected disabled>
          Selected
        </Chip>
      </div>
      <div className="flex gap-[var(--space-sm)]">
        <Chip>Unselected</Chip>
        <Chip disabled>Unselected</Chip>
      </div>
    </div>
  ),
};

/**
 * Interactive single-select row — illustrates how chips compose as a category
 * filter (the group's job is the single-select invariant; the Chip just reports
 * its toggle via `onSelect`).
 */
export const InteractiveRow: Story = {
  render: () => {
    const categories = ["All", "Adventure", "Fantasy", "Slice of life"];
    const [active, setActive] = useState("All");
    return (
      <div className="flex flex-wrap gap-[var(--space-sm)]">
        {categories.map((category) => (
          <Chip
            key={category}
            selected={active === category}
            onSelect={() => setActive(category)}
          >
            {category}
          </Chip>
        ))}
      </div>
    );
  },
};
