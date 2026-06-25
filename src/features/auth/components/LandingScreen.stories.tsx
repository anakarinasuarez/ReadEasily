import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usePreferences, DEFAULT_PREFERENCES } from "@/stores/preferences";
import { LandingScreen } from "./LandingScreen";

/**
 * LandingScreen — the guest-friendly marketing front door (Figma desktop
 * 171:361 / mobile 821:825). One responsive component: a centered brand header
 * over a 2-column hero on md+ (a 22px-rhythm text column left, the decorative
 * auto-cycling LandingShowcase right) that collapses to a single stacked column
 * below md (logo → eyebrow → h1 → body → showcase → features → translate →
 * helper → CTA). The "Translate to" row is informational only (not a control).
 * The Default story shows the desktop layout; the Mobile story exercises the
 * same component at a phone viewport (no separate build).
 *
 * The screen reads `reduceMotion` from the preferences store (for the showcase),
 * so each story resets that store first to keep rendering deterministic.
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

/** Desktop — the landing as a first-time guest sees it. */
export const Default: Story = {};

/** The same component at a phone viewport — responsive variant, not a rebuild. */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
