import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { usePreferences, DEFAULT_PREFERENCES } from "@/stores/preferences";
import { LandingScreen } from "./LandingScreen";

/**
 * LandingScreen — the guest-friendly marketing front door (Figma desktop
 * 171:361 / mobile 821:825). One responsive component: a 2-column hero on md+
 * (text left, auto-cycling Book Showcase right) that collapses to a single
 * stacked column below md. The Default story shows the desktop layout; the
 * Mobile story exercises the same component at a phone viewport (no separate
 * build); the FrenchSelected story shows the language SegmentedControl in a
 * non-default selected state.
 *
 * The screen binds the translation language to the persisted preferences store,
 * so each story resets that store first to keep the rendered selection
 * deterministic.
 */
const meta: Meta<typeof LandingScreen> = {
  title: "Features/Auth/LandingScreen",
  component: LandingScreen,
  parameters: { layout: "fullscreen" },
  beforeEach: () => {
    usePreferences.setState({ ...DEFAULT_PREFERENCES });
  },
};
export default meta;

type Story = StoryObj<typeof LandingScreen>;

/** Desktop — the landing as a first-time guest sees it (Spanish default). */
export const Default: Story = {};

/** The same component at a phone viewport — responsive variant, not a rebuild. */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};

/** Language selector in a non-default (Français) selected state. */
export const FrenchSelected: Story = {
  beforeEach: () => {
    usePreferences.setState({ ...DEFAULT_PREFERENCES, translationLang: "FR" });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio", { name: "Français" })).toBeChecked();
  },
};

/** Selecting a language updates the persisted store (interaction proof). */
export const SelectPortuguese: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Português" }));
    await expect(canvas.getByRole("radio", { name: "Português" })).toBeChecked();
  },
};
