import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { LoginScreen } from "./LoginScreen";

/**
 * LoginScreen — the full "Welcome back" auth screen (Figma 600:646) inside the
 * shared AuthLayout split shell. The form is self-contained (no args): the
 * stories below drive its runtime states (default, validation errors) through
 * interaction, since the Input "error" state is a runtime state, not a prop on
 * the screen.
 */
const meta: Meta<typeof LoginScreen> = {
  title: "Features/Auth/LoginScreen",
  component: LoginScreen,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof LoginScreen>;

/** Pristine form — the screen as a returning reader first sees it. */
export const Default: Story = {};

/** Submit-while-empty surfaces both field errors and focuses the email field. */
export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Log in" }));
    await expect(
      await canvas.findByText("Enter your email address."),
    ).toBeVisible();
    await expect(canvas.getByText("Enter your password.")).toBeVisible();
  },
};

/** A malformed email is rejected on submit with the format message. */
export const InvalidEmail: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Email"), "not-an-email");
    await userEvent.type(canvas.getByLabelText("Password"), "whatever");
    await userEvent.click(canvas.getByRole("button", { name: "Log in" }));
    await expect(
      await canvas.findByText("Enter a valid email address."),
    ).toBeVisible();
  },
};
