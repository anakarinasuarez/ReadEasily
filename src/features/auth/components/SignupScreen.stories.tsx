import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { SignupScreen } from "./SignupScreen";

/**
 * SignupScreen — the full "Create your account" auth screen (Figma 79:139)
 * inside the shared AuthLayout split shell. Self-contained form; the stories
 * drive its runtime states through interaction.
 */
const meta: Meta<typeof SignupScreen> = {
  title: "Features/Auth/SignupScreen",
  component: SignupScreen,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof SignupScreen>;

/** Pristine form. */
export const Default: Story = {};

/** Submit-while-empty surfaces all three field errors, focus on Name. */
export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Create account" }),
    );
    await expect(await canvas.findByText("Enter your name.")).toBeVisible();
    await expect(canvas.getByText("Enter your email address.")).toBeVisible();
    await expect(canvas.getByText("Choose a password.")).toBeVisible();
  },
};

/** A short password is rejected with the minimum-length message. */
export const WeakPassword: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Name"), "Ana");
    await userEvent.type(canvas.getByLabelText("Email"), "ana@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "short");
    await userEvent.click(
      canvas.getByRole("button", { name: "Create account" }),
    );
    await expect(
      await canvas.findByText("Use at least 8 characters."),
    ).toBeVisible();
  },
};
