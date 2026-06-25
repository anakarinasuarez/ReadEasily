import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { SegmentedControl } from "./SegmentedControl";

const TRANSLATION = [
  { value: "ES", label: "ES" },
  { value: "FR", label: "FR" },
  { value: "PT", label: "PT" },
] as const;

const ACCENT = [
  { value: "US", label: "US" },
  { value: "UK", label: "UK" },
  { value: "AU", label: "AU" },
  { value: "CA", label: "CA" },
] as const;

const meta = {
  title: "UI/SegmentedControl",
  component: SegmentedControl,
  parameters: { layout: "centered" },
  // Default args satisfy the required props; every story overrides via `render`.
  args: {
    options: [...TRANSLATION],
    value: "ES",
    onChange: () => {},
    "aria-label": "Translation language",
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Translation language row (info tone) — 3 options. Selected pill = `--feedback-info`.
 * This is the exact Figma node 158:11 control.
 */
export const TranslationInfo: Story = {
  render: () => {
    const [value, setValue] = useState<(typeof TRANSLATION)[number]["value"]>("ES");
    return (
      <SegmentedControl
        tone="info"
        aria-label="Translation language"
        options={[...TRANSLATION]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

/**
 * Reading accent row (accent tone, default) — 4 options. Selected pill =
 * `--bg-accent-strong` + terracotta glow.
 */
export const ReadingAccent: Story = {
  render: () => {
    const [value, setValue] = useState<(typeof ACCENT)[number]["value"]>("US");
    return (
      <SegmentedControl
        tone="accent"
        aria-label="Reading accent"
        options={[...ACCENT]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

/**
 * Large label ramp (`size="lg"` → Heading/H4 16/26 SemiBold) — the Landing
 * language selector. Geometry and semantics are unchanged; only the label type
 * steps up from Meta (13/18) to match the hero scale.
 */
export const LargeLabels: Story = {
  render: () => {
    const [value, setValue] = useState<(typeof TRANSLATION)[number]["value"]>("ES");
    return (
      <SegmentedControl
        tone="info"
        size="lg"
        aria-label="Translation language"
        options={[...TRANSLATION]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

/**
 * Full-width (the wrapped mobile row): `w-full` on the track makes the `flex-1`
 * segments distribute equally. Inline desktop usage (the stories above) sizes to
 * content instead.
 */
export const FullWidth: Story = {
  render: () => {
    const [value, setValue] = useState<(typeof ACCENT)[number]["value"]>("UK");
    return (
      <div className="w-[320px]">
        <SegmentedControl
          tone="accent"
          aria-label="Reading accent"
          className="w-full"
          options={[...ACCENT]}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};

/** Each selection state, frozen, for the info tone (no interaction needed). */
export const InfoSelectionStates: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-md)]">
      {TRANSLATION.map((selected) => (
        <SegmentedControl
          key={selected.value}
          tone="info"
          aria-label={`Translation language — ${selected.label} selected`}
          options={[...TRANSLATION]}
          value={selected.value}
          onChange={() => {}}
        />
      ))}
    </div>
  ),
};

/** Each selection state, frozen, for the accent tone. */
export const AccentSelectionStates: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-md)]">
      {ACCENT.map((selected) => (
        <SegmentedControl
          key={selected.value}
          tone="accent"
          aria-label={`Reading accent — ${selected.label} selected`}
          options={[...ACCENT]}
          value={selected.value}
          onChange={() => {}}
        />
      ))}
    </div>
  ),
};
