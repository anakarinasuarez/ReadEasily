import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Logo } from "./Logo";

/**
 * Logo primitive — the canonical ReadEasily mark + wordmark in both scales.
 * It is nameless to assistive tech (the mark/wordmark are aria-hidden); the
 * stories wrap it the way real consumers do so the brand reads once.
 */
const meta = {
  title: "UI/Logo",
  component: Logo,
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "inline-radio", options: ["md", "lg"] },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `md` (default) — the Navbar + auth-shell brand (responsive 14→19px wordmark). */
export const Medium: Story = {
  args: { size: "md" },
};

/** `lg` — the larger Landing brand (H3-sized wordmark, fixed 40×32 mark). */
export const Large: Story = {
  args: { size: "lg" },
};

/** As the Navbar uses it: wrapped in a labelled home link. */
export const InNavbarLink: Story = {
  render: () => (
    <a href="/library" aria-label="ReadEasily home" className="inline-flex">
      <Logo size="md" />
    </a>
  ),
};

/** As the auth shell uses it: wrapped in a labelled image role. */
export const AsLabelledImage: Story = {
  render: () => (
    <span role="img" aria-label="ReadEasily">
      <Logo size="md" />
    </span>
  ),
};
