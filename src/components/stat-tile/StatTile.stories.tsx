import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatTile } from "./StatTile";

/**
 * StatTile stories cover all 4 Figma tones (Accent / Warning / Info / Success)
 * — the tone drives the icon-tile tint + glyph colour while the numeral stays
 * `text-primary`. The grid story mirrors the Profile-header stat row.
 */
const meta = {
  title: "Components/StatTile",
  component: StatTile,
  parameters: { layout: "padded" },
  args: {
    tone: "accent",
    icon: <BookmarkIcon />,
    value: 12,
    label: "Saved words",
  },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

/* --- demo glyphs (decorative in stories) ---------------------------------- */
function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export const Accent: Story = {
  args: { tone: "accent", icon: <BookmarkIcon />, value: 12, label: "Saved words" },
};

export const Warning: Story = {
  args: { tone: "warning", icon: <PlusIcon />, value: 3, label: "New this week" },
};

export const Info: Story = {
  args: { tone: "info", icon: <ListIcon />, value: 8, label: "Stories read" },
};

export const Success: Story = {
  args: { tone: "success", icon: <CheckIcon />, value: 24, label: "Days streak" },
};

/* --- the full Figma tone set (the Profile stat row) ----------------------- */
export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-[14px]">
      <StatTile tone="accent" icon={<BookmarkIcon />} value={12} label="Saved words" />
      <StatTile tone="warning" icon={<PlusIcon />} value={3} label="New this week" />
      <StatTile tone="info" icon={<ListIcon />} value={8} label="Stories read" />
      <StatTile tone="success" icon={<CheckIcon />} value={24} label="Days streak" />
    </div>
  ),
};
