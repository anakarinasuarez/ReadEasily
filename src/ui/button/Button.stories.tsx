import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";

/**
 * A decorative glyph used across the stories. Design law: every CTA carries an
 * icon, so the icon usage is the *primary* documented case.
 */
function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14m0 0-6-6m6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  args: {
    children: "Continue",
    variant: "primary",
    size: "md",
    leftIcon: <BookmarkIcon />,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The canonical CTA: a primary button that carries an icon (design law). */
export const Primary: Story = {};

export const Secondary: Story = { args: { variant: "secondary" } };

export const Ghost: Story = { args: { variant: "ghost" } };

/** Every variant x size, with the leading icon that every CTA carries. */
export const AllVariantsAndSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-lg)]">
      {(["primary", "secondary", "ghost"] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-[var(--space-md)]">
          {(["sm", "md", "lg"] as const).map((size) => (
            <Button key={size} variant={variant} size={size} leftIcon={<BookmarkIcon />}>
              {`${variant} ${size}`}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * Hover is a CSS `:hover` state, not a prop. Hover any button below to see the
 * variant's hover token take over (primary→accent-hover, secondary→subtle +
 * strong border, ghost→accent-subtle).
 */
export const HoverStates: Story = {
  render: () => (
    <div className="flex items-center gap-[var(--space-md)]">
      <Button variant="primary" leftIcon={<BookmarkIcon />}>
        Hover me
      </Button>
      <Button variant="secondary" leftIcon={<BookmarkIcon />}>
        Hover me
      </Button>
      <Button variant="ghost" leftIcon={<BookmarkIcon />}>
        Hover me
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-[var(--space-md)]">
      <Button variant="primary" disabled leftIcon={<BookmarkIcon />}>
        Disabled
      </Button>
      <Button variant="secondary" disabled leftIcon={<BookmarkIcon />}>
        Disabled
      </Button>
      <Button variant="ghost" disabled leftIcon={<BookmarkIcon />}>
        Disabled
      </Button>
    </div>
  ),
};

/** Width stays stable while the label is swapped for a spinner. */
export const Loading: Story = {
  render: () => (
    <div className="flex items-center gap-[var(--space-md)]">
      <Button variant="primary" loading leftIcon={<BookmarkIcon />}>
        Saving…
      </Button>
      <Button variant="secondary" loading leftIcon={<BookmarkIcon />}>
        Saving…
      </Button>
      <Button variant="ghost" loading leftIcon={<BookmarkIcon />}>
        Saving…
      </Button>
    </div>
  ),
};

/** Trailing icon (e.g. a forward affordance). */
export const WithRightIcon: Story = {
  args: { leftIcon: undefined, rightIcon: <ArrowRightIcon />, children: "Next" },
};

/** Icon-only requires an `aria-label` for an accessible name. */
export const IconOnly: Story = {
  args: {
    children: undefined,
    leftIcon: <BookmarkIcon />,
    "aria-label": "Save to library",
  },
};

/** `asChild` renders the styling onto a link instead of a `<button>`. */
export const AsLink: Story = {
  render: () => (
    <Button asChild variant="primary">
      <a href="#story">Go to story</a>
    </Button>
  ),
};
