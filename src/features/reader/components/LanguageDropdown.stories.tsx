import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import type { TranslationSelection } from "../types";
import { LanguageDropdown } from "./LanguageDropdown";

/**
 * LanguageDropdown — the translation-language menu (Figma node 1154:3342),
 * opening from the header's ES/FR/PT pill. Controlled: the consumer owns the
 * selected language; here a small wrapper holds it so the menu is interactive.
 */
const meta = {
  title: "Features/Reader/LanguageDropdown",
  component: LanguageDropdown,
  parameters: { layout: "centered" },
  // Each story uses a controlled `render` wrapper; these args satisfy the
  // component's required props for the type and are otherwise overridden.
  args: { value: "es", onChange: () => {} },
} satisfies Meta<typeof LanguageDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ initial }: { initial: TranslationSelection }) {
  const [value, setValue] = useState<TranslationSelection>(initial);
  return <LanguageDropdown value={value} onChange={setValue} />;
}

/** Closed — the header pill reflecting the active language (ES). */
export const Closed: Story = {
  render: () => <Controlled initial="es" />,
};

/** Open — the ES/FR/PT menu with the active row tinted + checked. The play test
 *  opens the menu and switches the language to Français. */
export const Open: Story = {
  render: () => <Controlled initial="es" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Translation language" }),
    );
    const french = await canvas.findByRole("menuitemradio", {
      name: "Français",
    });
    await expect(french).toBeVisible();
    await userEvent.click(french);
    // The pill now reads FR (menu closed).
    await expect(
      canvas.getByRole("button", { name: "Translation language" }),
    ).toHaveAttribute("aria-expanded", "false");
  },
};
