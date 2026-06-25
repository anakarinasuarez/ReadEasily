import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FeatureRow } from "./FeatureRow";
import { BookOpenIcon, HeadphonesIcon, TapWordIcon } from "../icons";

/**
 * FeatureRow stories show a single row plus the three Landing examples stacked,
 * mirroring the marketing list on the auth landing.
 */
const meta = {
  title: "Features/Auth/FeatureRow",
  component: FeatureRow,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeatureRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <HeadphonesIcon />,
    title: "Listen to classics",
    description: "Hear every story read aloud by a native voice.",
  },
};

/** The three Landing rows as assembled on the auth landing. */
export const LandingList: Story = {
  args: { icon: null, title: "", description: "" },
  render: () => (
    <div className="flex flex-col gap-[var(--space-xl)]">
      <FeatureRow
        icon={<HeadphonesIcon />}
        title="Listen to classics"
        description="Hear every story read aloud by a native voice."
      />
      <FeatureRow
        icon={<BookOpenIcon />}
        title="Read along"
        description="Follow the words as the narration plays."
      />
      <FeatureRow
        icon={<TapWordIcon />}
        title="Tap any word"
        description="Get an instant translation and save it to practice."
      />
    </div>
  ),
};
