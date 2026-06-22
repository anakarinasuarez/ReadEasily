import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchField } from "./SearchField";
import type { SearchFieldProps } from "./SearchField";

/**
 * A controlled host so the field is interactive in Storybook. The field itself
 * is presentational — the consumer owns the value, exactly as here.
 */
function ControlledSearchField({
  value: initial = "",
  ...props
}: Partial<SearchFieldProps>) {
  const [value, setValue] = useState(initial);
  return <SearchField {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  title: "UI/SearchField",
  component: SearchField,
  parameters: { layout: "centered" },
  args: {
    value: "",
    onValueChange: () => {},
    placeholder: "Search stories, themes…",
  },
  decorators: [
    (Story) => (
      // Desktop sits ~500px and left-aligned; the field itself is fluid (w-full).
      <div style={{ width: 500 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Idle — the only state Figma ships. */
export const Idle: Story = {
  render: (args) => <ControlledSearchField {...args} />,
};

/**
 * Focus is a runtime state (`:focus-within`). Autofocus renders the AA ring on
 * mount; tabbing into the field reproduces it.
 */
export const Focused: Story = {
  render: (args) => <ControlledSearchField {...args} autoFocus />,
};

/** Filled — a non-empty value reveals the clear (✕) button. */
export const Filled: Story = {
  render: (args) => <ControlledSearchField {...args} value="bedtime fables" />,
};

/** Disabled — dimmed, no interaction; the clear button is suppressed. */
export const Disabled: Story = {
  render: (args) => (
    <ControlledSearchField {...args} value="bedtime fables" disabled />
  ),
};

/** Mobile — the field is fluid, so it simply fills a narrow container. */
export const MobileFullWidth: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => <ControlledSearchField {...args} />,
};
