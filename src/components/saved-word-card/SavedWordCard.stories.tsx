import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SavedWordCard } from "./SavedWordCard";

/**
 * Stories render inside a 288-wide frame — the card's natural width on the
 * Saved screen. Width is owned by the consumer (the card itself is fluid), so
 * the frame is a decorator, not a prop.
 */
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[288px]">{children}</div>
);

const meta = {
  title: "Components/SavedWordCard",
  component: SavedWordCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <Frame>
        <Story />
      </Frame>
    ),
  ],
  args: {
    word: "Path",
    translation: "sendero, camino",
    sourceStoryTitle: "The Ant & the Grasshopper",
    sentencesReady: 10,
    wordHref: "#",
  },
  argTypes: {
    wordHref: { control: "text" },
    practiceHref: { control: "text" },
    sentencesReady: { control: { type: "number", min: 0 } },
    onListen: { action: "listen" },
    onRemove: { action: "remove" },
    onPractice: { action: "practice" },
  },
} satisfies Meta<typeof SavedWordCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Badge variant (Figma 1135:2637) — sentencesReady > 0 shows the
 *  "N sentences ready" pill and the footer action reads "Review". */
export const WithBadge: Story = {};

/** Phonetic variant (Figma 1136:3177) — an IPA line in Lora italic; no badge,
 *  so the footer action reads "Practice". */
export const WithPhonetic: Story = {
  args: {
    word: "Grew",
    phonetic: "/kreˈsjo/",
    translation: "creció",
    sentencesReady: 0,
  },
};

/** Plain — no phonetic, no badge. Minimal card; action is "Practice". */
export const Plain: Story = {
  args: {
    word: "Bright",
    translation: "brillante",
    sentencesReady: 0,
  },
};

/** Phonetic + badge together (e.g. "Covered"). */
export const PhoneticAndBadge: Story = {
  args: {
    word: "Covered",
    phonetic: "/ˈkʌvərd/",
    translation: "cubierto, tapado",
    sentencesReady: 1,
  },
};

/** Truncation stress — a long word wraps; a long source title ellipsizes to a
 *  single line in the footer. */
export const LongContent: Story = {
  args: {
    word: "Photosynthesis",
    translation: "fotosíntesis, proceso de las plantas",
    sourceStoryTitle:
      "The Extremely Long Story Title That Will Not Fit In The Footer Row",
    sentencesReady: 24,
  },
};

/** All controls wired — link on the word, the practice action as a link, and
 *  every handler present. */
export const AllControls: Story = {
  args: {
    word: "Path",
    phonetic: "/pɑːθ/",
    translation: "sendero, camino",
    sentencesReady: 10,
    wordHref: "/read/ant-grasshopper#path",
    practiceHref: "/practice/path",
  },
};
