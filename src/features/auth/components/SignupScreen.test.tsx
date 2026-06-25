import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useSession, type SessionUser } from "@/stores/session";
import { authClient } from "@/features/auth/api/authClient";
import { SignupScreen } from "./SignupScreen";

/**
 * SignupScreen behavior tests. Mirrors LoginScreen: validate (name/email/
 * password), call `authClient.signUp`, on success set the session + push home,
 * and map AuthError codes onto the right surface (email_taken → email field,
 * weak_password → password field, else the form alert). AuthClient is spied so
 * the mock latency never runs.
 */

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: vi.fn() }),
}));

const USER: SessionUser = { name: "Ana", email: "ana@example.com" };

beforeEach(() => {
  pushMock.mockClear();
  vi.restoreAllMocks();
  localStorage.clear();
  useSession.setState({ user: null, _hasHydrated: false });
});

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Ana");
  await user.type(screen.getByLabelText("Email"), "ana@example.com");
  await user.type(screen.getByLabelText("Password"), "secret123");
}

describe("SignupScreen — render", () => {
  it("renders inside the AuthLayout with the create-account card + footer", () => {
    render(<SignupScreen />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Create your account" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Back" }).length).toBeGreaterThan(0);
    // Footer "Log in" link, scoped so it doesn't collide with the AuthTabs tab.
    const haveAccount = screen.getByText(/Already have an account\?/);
    expect(
      within(haveAccount).getByRole("link", { name: "Log in" }),
    ).toHaveAttribute("href", "/login");
  });
});

describe("SignupScreen — validation", () => {
  it("shows all three field errors on empty submit and focuses name first", async () => {
    const user = userEvent.setup();
    render(<SignupScreen />);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
    expect(screen.getByText("Choose a password.")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveFocus();
  });

  it("rejects a too-short password", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(authClient, "signUp");
    render(<SignupScreen />);
    await user.type(screen.getByLabelText("Name"), "Ana");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Use at least 8 characters.")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveFocus();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("SignupScreen — success", () => {
  it("calls signUp, sets the session and pushes to the reading home", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(authClient, "signUp").mockResolvedValue({ user: USER });
    render(<SignupScreen />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/library"));
    expect(spy).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@example.com",
      password: "secret123",
    });
    expect(useSession.getState().user).toEqual(USER);
  });
});

describe("SignupScreen — AuthError mapping", () => {
  it("maps email_taken onto the email field", async () => {
    const user = userEvent.setup();
    vi.spyOn(authClient, "signUp").mockRejectedValue({
      code: "email_taken",
      message: "taken",
    });
    render(<SignupScreen />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("That email is already registered."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveFocus();
    expect(useSession.getState().user).toBeNull();
  });

  it("maps weak_password onto the password field", async () => {
    const user = userEvent.setup();
    vi.spyOn(authClient, "signUp").mockRejectedValue({
      code: "weak_password",
      message: "Pick something stronger.",
    });
    render(<SignupScreen />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("Pick something stronger."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveFocus();
  });

  it("falls back to the form-level alert for an unknown error", async () => {
    const user = userEvent.setup();
    vi.spyOn(authClient, "signUp").mockRejectedValue({
      code: "unknown",
      message: "boom",
    });
    render(<SignupScreen />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Something went wrong. Please try again.");
  });
});

describe("SignupScreen — a11y", () => {
  it("has no axe violations", async () => {
    const { container } = render(<SignupScreen />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
