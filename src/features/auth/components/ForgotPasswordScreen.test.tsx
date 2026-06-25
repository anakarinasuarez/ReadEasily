import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { authClient } from "@/features/auth/api/authClient";
import { ForgotPasswordScreen } from "./ForgotPasswordScreen";

/**
 * ForgotPasswordScreen behavior tests. No AuthTabs (sub-flow of login). Email is
 * validated on submit/blur; a valid submit calls `resetPasswordForEmail` and
 * swaps the card to the announced success confirmation, moving focus to its
 * heading. AuthClient is spied so the mock latency never runs.
 */

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: vi.fn() }),
}));

beforeEach(() => {
  pushMock.mockClear();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("ForgotPasswordScreen — render", () => {
  it("renders the reset card with NO auth tabs and a back link", () => {
    render(<ForgotPasswordScreen />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Reset your password" }),
    ).toBeInTheDocument();
    // Sub-flow: the Sign up / Log in tabs are NOT shown.
    expect(
      screen.queryByRole("link", { name: "Sign up" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to log in" }),
    ).toHaveAttribute("href", "/login");
  });
});

describe("ForgotPasswordScreen — validation", () => {
  it("rejects an invalid email and does not call the client", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(authClient, "resetPasswordForEmail");
    render(<ForgotPasswordScreen />);
    await user.type(screen.getByLabelText("Email"), "nope");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveFocus();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("ForgotPasswordScreen — success", () => {
  it("swaps to the announced confirmation and moves focus to its heading", async () => {
    const user = userEvent.setup();
    const spy = vi
      .spyOn(authClient, "resetPasswordForEmail")
      .mockResolvedValue(undefined);
    render(<ForgotPasswordScreen />);

    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    const heading = await screen.findByRole("heading", {
      name: "Check your inbox",
    });
    expect(spy).toHaveBeenCalledWith("ana@example.com");
    // Announced live region carries the confirmation.
    expect(screen.getByRole("status")).toHaveTextContent(
      "We sent a reset link to ana@example.com.",
    );
    // The request form is gone.
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    await waitFor(() => expect(heading).toHaveFocus());
  });
});

describe("ForgotPasswordScreen — a11y", () => {
  it("has no axe violations in the form state", async () => {
    const { container } = render(<ForgotPasswordScreen />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in the success state", async () => {
    const user = userEvent.setup();
    vi.spyOn(authClient, "resetPasswordForEmail").mockResolvedValue(undefined);
    const { container } = render(<ForgotPasswordScreen />);

    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    await screen.findByRole("heading", { name: "Check your inbox" });

    expect(await axe(container)).toHaveNoViolations();
  });
});
