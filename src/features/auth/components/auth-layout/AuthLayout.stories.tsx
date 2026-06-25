import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AuthLayout } from "./AuthLayout";
import { AuthCard } from "../auth-card";
import { AuthTabs } from "../auth-tabs";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";

/**
 * AuthLayout stories show the split shell assembled with a realistic Sign-up
 * card (tabs + fields + CTA) in the right slot. The `WithBack` story adds the
 * breadcrumb-back affordance (desktop ghost over the panel + mobile chevron).
 * Resize across the `md` breakpoint to see the panel collapse to its compact
 * mobile band.
 */
const meta = {
  title: "Features/Auth/AuthLayout",
  component: AuthLayout,
  parameters: { layout: "fullscreen" },
  args: { onBack: fn() },
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

function SignupCard() {
  return (
    <AuthCard>
      <AuthTabs active="signup" />
      <div className="mt-[var(--space-xl)] flex flex-col gap-[var(--space-md)]">
        <h1 className="font-display text-[length:var(--text-title-l-size)] font-bold leading-[var(--text-title-l-line-height)] text-primary">
          Create your account
        </h1>
        <p className="font-ui text-[length:var(--text-ui-m-size)] leading-[var(--text-ui-m-line-height)] text-muted">
          Track your progress and save words as you read.
        </p>
        <div className="mt-[var(--space-sm)] flex flex-col gap-[var(--space-md)]">
          <Input label="Name" placeholder="Your name" />
          <Input label="Email" type="email" placeholder="you@example.com" />
          <Input label="Password" type="password" defaultValue="••••••••" />
        </div>
        <Button className="mt-[var(--space-sm)] w-full">Create account</Button>
      </div>
    </AuthCard>
  );
}

export const SignUp: Story = {
  args: { onBack: undefined, children: <SignupCard /> },
};

export const WithBack: Story = {
  args: { children: <SignupCard /> },
};
