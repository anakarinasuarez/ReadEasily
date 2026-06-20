import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";
import type { BadgeTone } from "./Badge";

/**
 * Badge primitive — every tone × size, the "+" vocab affordance, and the
 * interactive (labelled-button) onAdd case. Matches Figma node 17:42.
 */
const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  args: { children: "Label" },
  argTypes: {
    tone: {
      control: "select",
      options: [
        "neutral",
        "accent",
        "success",
        "warning",
        "danger",
        "info",
        "selected",
      ],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
    children: { control: "text" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const TONES: BadgeTone[] = [
  "neutral",
  "accent",
  "success",
  "warning",
  "danger",
  "info",
  "selected",
];

/** Default: medium neutral. */
export const Default: Story = {};

/** The full matrix — 7 tones × {sm, md}. */
export const AllTonesAndSizes: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_auto] items-center gap-x-xl gap-y-md">
      {TONES.map((tone) => (
        <div key={tone} className="contents">
          <Badge tone={tone} size="sm">
            {tone === "selected" ? "Spanish" : "Label"}
          </Badge>
          <Badge tone={tone} size="md">
            {tone === "selected" ? "Spanish" : "Label"}
          </Badge>
        </div>
      ))}
    </div>
  ),
};

/** Neutral & accent expose the trailing "+". Here it is decorative (omitted
 *  when no `onAdd`) vs. present as a real button when `onAdd` is supplied. */
export const VocabAffordance: Story = {
  render: () => (
    <div className="flex items-center gap-lg">
      <Badge tone="neutral" onAdd={() => {}} addLabel="Save word">
        Serendipity
      </Badge>
      <Badge tone="accent" onAdd={() => {}} addLabel="Save word">
        Whisper
      </Badge>
    </div>
  ),
};

/** Interactive: the "+" is a real, keyboard-focusable, labelled button. */
export const Interactive: Story = {
  args: {
    tone: "neutral",
    children: "Eloquent",
    onAdd: () => window.alert("Saved!"),
    addLabel: "Save word",
  },
};

/** Feedback tones carry a decorative status dot — meaning lives in the label. */
export const FeedbackTones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-md">
      <Badge tone="success">Completed</Badge>
      <Badge tone="warning">Needs review</Badge>
      <Badge tone="danger">Overdue</Badge>
      <Badge tone="info">New</Badge>
    </div>
  ),
};

/** Selected — the active/highlighted state (solid accent, no dot/no "+"). */
export const Selected: Story = {
  args: { tone: "selected", children: "Spanish" },
};
