import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconButton } from "./IconButton";

/** Close glyph — the canonical Modal-close use case for this primitive. */
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Search glyph — a Navbar mobile utility action. */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const meta = {
  title: "UI/IconButton",
  component: IconButton,
  parameters: { layout: "centered" },
  args: {
    icon: <CloseIcon />,
    "aria-label": "Close",
    variant: "subtle",
    size: "md",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["subtle", "ghost", "accent"],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default toolbar utility: a subtle, circular icon-only button. */
export const Subtle: Story = {};

export const Ghost: Story = { args: { variant: "ghost" } };

export const Accent: Story = {
  args: { variant: "accent", icon: <SearchIcon />, "aria-label": "Search" },
};

/** Every variant x size. */
export const AllVariantsAndSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-lg)]">
      {(["subtle", "ghost", "accent"] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-[var(--space-md)]">
          {(["sm", "md"] as const).map((size) => (
            <IconButton
              key={size}
              variant={variant}
              size={size}
              icon={<CloseIcon />}
              aria-label={`Close (${variant} ${size})`}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * Hover is a CSS `:hover` state, not a prop. Hover any button to see the
 * variant's hover token take over (subtle→accent-subtle, ghost→subtle,
 * accent→accent-hover).
 */
export const HoverStates: Story = {
  render: () => (
    <div className="flex items-center gap-[var(--space-md)]">
      <IconButton variant="subtle" icon={<CloseIcon />} aria-label="Close" />
      <IconButton variant="ghost" icon={<CloseIcon />} aria-label="Close" />
      <IconButton variant="accent" icon={<SearchIcon />} aria-label="Search" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-[var(--space-md)]">
      <IconButton
        variant="subtle"
        disabled
        icon={<CloseIcon />}
        aria-label="Close"
      />
      <IconButton
        variant="ghost"
        disabled
        icon={<CloseIcon />}
        aria-label="Close"
      />
      <IconButton
        variant="accent"
        disabled
        icon={<SearchIcon />}
        aria-label="Search"
      />
    </div>
  ),
};

/** Footprint stays stable while the icon is swapped for a spinner. */
export const Loading: Story = {
  render: () => (
    <div className="flex items-center gap-[var(--space-md)]">
      <IconButton
        variant="subtle"
        loading
        icon={<CloseIcon />}
        aria-label="Close"
      />
      <IconButton
        variant="ghost"
        loading
        icon={<CloseIcon />}
        aria-label="Close"
      />
      <IconButton
        variant="accent"
        loading
        icon={<SearchIcon />}
        aria-label="Search"
      />
    </div>
  ),
};
