import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toggle } from "./Toggle";

/**
 * Toggle stories cover the full Figma variant matrix from node 19:18:
 * Size {SM, MD} x State {Off, On, Disabled-Off, Disabled-On}, each paired
 * with a visible label so the accessible-name path is exercised too.
 */
const meta = {
  title: "UI/Toggle",
  component: Toggle,
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    size: "md",
    label: "Enable translations",
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  args: { checked: false },
};

export const On: Story = {
  args: { checked: true },
};

export const DisabledOff: Story = {
  args: { checked: false, disabled: true },
};

export const DisabledOn: Story = {
  args: { checked: true, disabled: true },
};

export const SmallOff: Story = {
  args: { size: "sm", checked: false },
};

export const SmallOn: Story = {
  args: { size: "sm", checked: true },
};

export const SmallDisabledOff: Story = {
  args: { size: "sm", checked: false, disabled: true },
};

export const SmallDisabledOn: Story = {
  args: { size: "sm", checked: true, disabled: true },
};

/** Every size x state cell at once, with associated `<label>`s. */
export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-lg)]">
      {(["md", "sm"] as const).map((size) => (
        <div key={size} className="flex items-center gap-[var(--space-xl)]">
          {(
            [
              { id: `${size}-off`, checked: false, disabled: false, text: "Off" },
              { id: `${size}-on`, checked: true, disabled: false, text: "On" },
              {
                id: `${size}-doff`,
                checked: false,
                disabled: true,
                text: "Disabled off",
              },
              {
                id: `${size}-don`,
                checked: true,
                disabled: true,
                text: "Disabled on",
              },
            ] as const
          ).map((cell) => (
            <label
              key={cell.id}
              htmlFor={cell.id}
              className="flex items-center gap-[var(--space-sm)] text-[var(--text-secondary)]"
            >
              <Toggle
                id={cell.id}
                size={size}
                defaultChecked={cell.checked}
                disabled={cell.disabled}
              />
              <span>
                {size.toUpperCase()} {cell.text}
              </span>
            </label>
          ))}
        </div>
      ))}
    </div>
  ),
};
