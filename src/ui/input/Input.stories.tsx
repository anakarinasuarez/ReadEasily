import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./Input";

/** A small decorative mail glyph used to exercise the trailing-icon slot. */
function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
      <rect
        x="2.5"
        y="4.5"
        width="15"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m3 6 7 5 7-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "inline-radio", options: ["md", "lg"] },
  },
  args: {
    label: "Email",
    placeholder: "you@example.com",
    size: "md",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/* --- MD ----------------------------------------------------------------- */

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: "reader@readeasily.app" },
};

/**
 * Focus is a runtime state (`:focus-within`). This story autofocuses on mount
 * to render the 2px accent ring; tabbing into any Input reproduces it.
 */
export const Focus: Story = {
  args: { autoFocus: true },
};

export const Error: Story = {
  args: {
    defaultValue: "reader@@readeasily",
    errorMessage: "Please enter a valid email address",
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "reader@readeasily.app" },
};

export const WithTrailingIcon: Story = {
  args: { trailingIcon: <MailIcon /> },
};

/* --- LG ----------------------------------------------------------------- */

export const LargeDefault: Story = {
  args: { size: "lg" },
};

export const LargeFilled: Story = {
  args: { size: "lg", defaultValue: "reader@readeasily.app" },
};

export const LargeError: Story = {
  args: {
    size: "lg",
    defaultValue: "reader@@readeasily",
    errorMessage: "Please enter a valid email address",
    trailingIcon: <MailIcon />,
  },
};

export const LargeDisabled: Story = {
  args: { size: "lg", disabled: true, defaultValue: "reader@readeasily.app" },
};

/* --- All states side by side ------------------------------------------- */

export const AllStates: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    (Story) => (
      <div style={{ display: "grid", gap: 24, width: 360 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <>
      <Input {...args} label="Default" />
      <Input {...args} label="Filled" defaultValue="reader@readeasily.app" />
      <Input
        {...args}
        label="With trailing icon"
        defaultValue="reader@readeasily.app"
        trailingIcon={<MailIcon />}
      />
      <Input
        {...args}
        label="Error"
        defaultValue="reader@@readeasily"
        errorMessage="Please enter a valid email address"
      />
      <Input
        {...args}
        label="Disabled"
        disabled
        defaultValue="reader@readeasily.app"
      />
    </>
  ),
};
