import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthCard } from "./AuthCard";

/**
 * AuthCard stories show the bare elevated container holding arbitrary content.
 * It is presentation-only — the form composites (AuthTabs / Input / Button) are
 * dropped in by the screen, so the story uses placeholder content to show the
 * surface, radius, shadow and padding.
 */
const meta = {
  title: "Features/Auth/AuthCard",
  component: AuthCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[420px] bg-canvas p-[var(--space-2xl)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AuthCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-[var(--space-md)]">
        <h2 className="font-display text-[length:var(--text-title-l-size)] font-bold leading-[var(--text-title-l-line-height)] text-primary">
          Create your account
        </h2>
        <p className="font-ui text-[length:var(--text-ui-m-size)] leading-[var(--text-ui-m-line-height)] text-muted">
          Track your progress and save words as you read.
        </p>
        <div className="mt-[var(--space-md)] h-[48px] rounded-[var(--radius-sm)] border border-default" />
        <div className="h-[48px] rounded-[var(--radius-sm)] border border-default" />
        <div className="mt-[var(--space-sm)] h-[48px] rounded-pill bg-accent-strong" />
      </div>
    ),
  },
};

/** The container adapts to whatever it frames — here a single short message. */
export const Compact: Story = {
  args: {
    children: (
      <p className="font-ui text-[length:var(--text-ui-l-size)] leading-[var(--text-ui-l-line-height)] text-primary">
        Check your inbox — we sent a reset link.
      </p>
    ),
  },
};
