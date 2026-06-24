import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import type { VoiceAccent } from "../types";
import { VoiceDropdown } from "./VoiceDropdown";

/**
 * VoiceDropdown — the audio voice/accent menu, mirroring LanguageDropdown's
 * visual + a11y. Opens from the header's US/UK pill; selecting a row switches
 * the TTS accent. Controlled via a wrapper here so the menu is interactive.
 */
const meta = {
  title: "Features/Reader/VoiceDropdown",
  component: VoiceDropdown,
  parameters: { layout: "centered" },
  // Each story uses a controlled `render` wrapper; these args satisfy the
  // component's required props for the type and are otherwise overridden.
  args: { value: "en-US", onChange: () => {} },
} satisfies Meta<typeof VoiceDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ initial }: { initial: VoiceAccent }) {
  const [value, setValue] = useState<VoiceAccent>(initial);
  return <VoiceDropdown value={value} onChange={setValue} />;
}

/** Closed — the header pill reflecting the active accent (US). */
export const Closed: Story = {
  render: () => <Controlled initial="en-US" />,
};

/** Open — the US/UK menu with the active row tinted + checked. The play test
 *  opens the menu and switches the accent to UK English. */
export const Open: Story = {
  render: () => <Controlled initial="en-US" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Audio voice" }));
    const uk = await canvas.findByRole("menuitemradio", { name: "UK English" });
    await expect(uk).toBeVisible();
    await userEvent.click(uk);
    await expect(
      canvas.getByRole("button", { name: "Audio voice" }),
    ).toHaveAttribute("aria-expanded", "false");
  },
};
