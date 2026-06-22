import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./EmptyState";

/**
 * EmptyState stories cover its two production uses (Saved empty + Search
 * no-results), plus the body-less and link-action variants, and the focus
 * state of the CTA. Rendered in a constrained column so the centered layout
 * reads the way it does on a screen.
 */
const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[640px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/* --- demo glyphs (decorative) --------------------------------------------- */
const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/** The canonical Figma node 144:213 — the Saved screen with no saved words. */
export const SavedEmpty: Story = {
  args: {
    icon: <BookmarkIcon />,
    title: "No saved words yet",
    body: "You haven't saved any words yet. Tap a word while reading to keep it here for practice.",
    action: { label: "Start reading", onClick: () => {} },
  },
};

/** Reused on Search with a different glyph + copy. */
export const SearchNoResults: Story = {
  args: {
    icon: <SearchIcon />,
    title: "No stories found",
    body: "We couldn't find anything for that search. Try another word or browse a category.",
    action: { label: "Browse categories", onClick: () => {} },
  },
};

/** Body is optional — title + CTA only. */
export const TitleAndActionOnly: Story = {
  args: {
    icon: <BookmarkIcon />,
    title: "Nothing here yet",
    action: { label: "Start reading", onClick: () => {} },
  },
};

/** No action — purely informational. */
export const Informational: Story = {
  args: {
    icon: <SearchIcon />,
    title: "Type to search",
    body: "Start typing above to find a story.",
  },
};

/** Link CTA — renders an <a> instead of a <button>. */
export const LinkAction: Story = {
  args: {
    icon: <BookmarkIcon />,
    title: "No saved words yet",
    body: "Save words while you read to practice them later.",
    action: { label: "Start reading", href: "/library" },
  },
};
