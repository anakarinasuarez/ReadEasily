import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useSession, type SessionUser } from "@/stores/session";
import { authClient } from "@/features/auth/api/authClient";
import { LoginScreen } from "./LoginScreen";

/**
 * LoginScreen behavior tests. The screen composes AuthLayout → AuthCard →
 * AuthTabs + inputs + CTA, validates on submit/blur, calls the AuthClient, and
 * on success writes the session store + pushes to the reading home. We spy on
 * `authClient` so the mock's 300ms latency never runs, reset the session store
 * between tests, and mock the App Router.
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

describe("LoginScreen — render", () => {
  it("renders inside the AuthLayout shell with the Welcome-back card", () => {
    render(<LoginScreen />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Welcome back" }),
    ).toBeInTheDocument();
    // Layout's breadcrumb-back affordance is present.
    expect(screen.getAllByRole("button", { name: "Back" }).length).toBeGreaterThan(0);
    // The screen-specific footer links. Row 1 is the WHOLE-line /signup link
    // ("New here? Sign up", distinct from the AuthTabs "Sign up" tab); row 2 is
    // the right-aligned /forgot link.
    expect(
      screen.getByRole("link", { name: "New here? Sign up" }),
    ).toHaveAttribute("href", "/signup");
    expect(
      screen.getByRole("link", { name: "Forgot password?" }),
    ).toHaveAttribute("href", "/forgot");
  });
});

describe("LoginScreen — validation", () => {
  it("shows both field errors on empty submit and focuses email first", async () => {
    const user = userEvent.setup();
    render(<LoginScreen />);
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveFocus();
  });

  it("rejects a malformed email and does not call the client", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(authClient, "signInWithPassword");
    render(<LoginScreen />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });

  it("validates email on blur", async () => {
    const user = userEvent.setup();
    render(<LoginScreen />);
    const email = screen.getByLabelText("Email");
    await user.type(email, "bad");
    await user.tab();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
  });
});

describe("LoginScreen — success", () => {
  it("calls the client, sets the session and pushes to the reading home", async () => {
    const user = userEvent.setup();
    const spy = vi
      .spyOn(authClient, "signInWithPassword")
      .mockResolvedValue({ user: USER });
    render(<LoginScreen />);

    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/library"));
    expect(spy).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "secret123",
    });
    expect(useSession.getState().user).toEqual(USER);
  });

  it("submits with Enter from a field", async () => {
    const user = userEvent.setup();
    vi.spyOn(authClient, "signInWithPassword").mockResolvedValue({
      user: USER,
    });
    render(<LoginScreen />);

    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123{Enter}");

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/library"));
  });
});

describe("LoginScreen — error", () => {
  it("surfaces invalid_credentials in the form-level alert", async () => {
    const user = userEvent.setup();
    vi.spyOn(authClient, "signInWithPassword").mockRejectedValue({
      code: "invalid_credentials",
      message: "nope",
    });
    render(<LoginScreen />);

    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "That email or password doesn't look right.",
    );
    expect(useSession.getState().user).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });
});

describe("LoginScreen — keyboard + a11y", () => {
  it("tabs through fields then the CTA in order", async () => {
    const user = userEvent.setup();
    render(<LoginScreen />);
    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");
    const cta = screen.getByRole("button", { name: "Log in" });

    email.focus();
    expect(email).toHaveFocus();
    await user.tab();
    expect(password).toHaveFocus();
    await user.tab();
    expect(cta).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(<LoginScreen />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
