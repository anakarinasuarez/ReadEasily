import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { ForgotPasswordScreen } from "./ForgotPasswordScreen";

/**
 * ForgotPasswordScreen — the reset-link request screen (Figma 1225:3826), a
 * sub-flow of Log-in (no AuthTabs). Two runtime states: the request form and
 * the design-approved success confirmation. The `Sent` story drives the real
 * submit so the confirmation (and its focus move) is exercised.
 */
const meta: Meta<typeof ForgotPasswordScreen> = {
  title: "Features/Auth/ForgotPasswordScreen",
  component: ForgotPasswordScreen,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof ForgotPasswordScreen>;

/** The request form. */
export const Default: Story = {};

/** Invalid email is rejected before any request is made. */
export const InvalidEmail: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Email"), "nope");
    await userEvent.click(
      canvas.getByRole("button", { name: "Send reset link" }),
    );
    await expect(
      await canvas.findByText("Enter a valid email address."),
    ).toBeVisible();
  },
};

/** A valid email swaps the card to the "Check your inbox" confirmation. */
export const Sent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Email"), "ana@example.com");
    await userEvent.click(
      canvas.getByRole("button", { name: "Send reset link" }),
    );
    await expect(
      await canvas.findByRole("heading", { name: "Check your inbox" }),
    ).toBeVisible();
    await expect(
      canvas.getByText("We sent a reset link to ana@example.com."),
    ).toBeVisible();
  },
};
