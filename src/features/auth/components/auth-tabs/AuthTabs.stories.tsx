import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthTabs } from "./AuthTabs";

/**
 * AuthTabs stories show both active states. The pair are real route links, so in
 * Storybook they navigate to `/login` / `/signup`; the active one carries the
 * solid-terracotta visual + `aria-current="page"`.
 */
const meta = {
  title: "Features/Auth/AuthTabs",
  component: AuthTabs,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[360px] bg-canvas p-[var(--space-2xl)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AuthTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignupActive: Story = {
  args: { active: "signup" },
};

export const LoginActive: Story = {
  args: { active: "login" },
};
