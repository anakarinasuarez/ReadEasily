import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "./Avatar";
import type { AvatarSize } from "./Avatar";

/**
 * Avatar primitive — sizes × {with-image, initials-fallback}, plus the
 * broken-src → fallback recovery. Used by Navbar (40px) and UserCard.
 */
const meta = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  args: { name: "Ada Lovelace", size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    src: { control: "text" },
    name: { control: "text" },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const SIZES: AvatarSize[] = ["sm", "md", "lg", "xl"];

// A small inline SVG data URI so the "with image" stories render deterministically
// (no network) in Storybook and visual snapshots.
const PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
       <rect width="80" height="80" fill="#3d6082"/>
       <circle cx="40" cy="30" r="16" fill="#dde9f2"/>
       <circle cx="40" cy="78" r="28" fill="#dde9f2"/>
     </svg>`,
  );

/** Default: md, initials fallback (no src). */
export const Default: Story = {};

/** Every size, rendering a real image. */
export const WithImage: Story = {
  render: () => (
    <div className="flex items-end gap-lg">
      {SIZES.map((size) => (
        <Avatar key={size} size={size} src={PHOTO} name="Ada Lovelace" />
      ))}
    </div>
  ),
};

/** Every size, initials fallback (no src). */
export const InitialsFallback: Story = {
  render: () => (
    <div className="flex items-end gap-lg">
      {SIZES.map((size) => (
        <Avatar key={size} size={size} name="Ada Lovelace" />
      ))}
    </div>
  ),
};

/** A broken URL falls back to initials instead of a broken-image icon. */
export const BrokenSrcFallsBack: Story = {
  args: { src: "https://invalid.example/nope.png", name: "Grace Hopper" },
};

/** Single-word names yield a single initial. */
export const SingleWordName: Story = {
  args: { name: "Cher" },
};

/**
 * The 120px Profile-header avatar (Figma 149:242) — image and initials
 * fallback side by side. Initials typography scales proportionally with the
 * larger circle.
 */
export const ProfileHeaderXl: Story = {
  render: () => (
    <div className="flex items-end gap-lg">
      <Avatar size="xl" src={PHOTO} name="Ada Lovelace" />
      <Avatar size="xl" name="Ada Lovelace" />
    </div>
  ),
};
