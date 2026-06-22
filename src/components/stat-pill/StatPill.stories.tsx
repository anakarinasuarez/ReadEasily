import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatPill } from "./StatPill";

/**
 * StatPill stories cover all 4 tones. The `accent` + `warning` pair is the
 * actual Saved header (999:1714) — "words to review" / "practice sets". The
 * warning numeral renders in the AA-safe --feedback-warning, never raw amber.
 */
const meta = {
  title: "Components/StatPill",
  component: StatPill,
  parameters: { layout: "padded" },
  args: {
    tone: "accent",
    value: 8,
    label: "words to review",
  },
} satisfies Meta<typeof StatPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Accent: Story = {
  args: { tone: "accent", value: 8, label: "words to review" },
};

export const Warning: Story = {
  args: { tone: "warning", value: 2, label: "practice sets" },
};

export const Info: Story = {
  args: { tone: "info", value: 5, label: "stories saved" },
};

export const Success: Story = {
  args: { tone: "success", value: 24, label: "days on streak" },
};

/* --- the real Saved header (accent + warning) ----------------------------- */
export const SavedHeader: Story = {
  render: () => (
    <div className="flex gap-[14px]">
      <StatPill tone="accent" value={8} label="words to review" />
      <StatPill tone="warning" value={2} label="practice sets" />
    </div>
  ),
};

export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-[14px]">
      <StatPill tone="accent" value={8} label="words to review" />
      <StatPill tone="warning" value={2} label="practice sets" />
      <StatPill tone="info" value={5} label="stories saved" />
      <StatPill tone="success" value={24} label="days on streak" />
    </div>
  ),
};
