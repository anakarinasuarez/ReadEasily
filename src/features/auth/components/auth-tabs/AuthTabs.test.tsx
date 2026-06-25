import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AuthTabs } from "./AuthTabs";

describe("AuthTabs — navigation, not a radiogroup", () => {
  it("renders both tabs as links", () => {
    render(<AuthTabs active="signup" />);
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    // Explicitly NOT radios — these are route navigation.
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("the inactive tab is a link pointing at the other route", () => {
    render(<AuthTabs active="signup" />);
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("marks the active tab with aria-current=page (and only that one)", () => {
    render(<AuthTabs active="login" />);
    const login = screen.getByRole("link", { name: "Log in" });
    const signup = screen.getByRole("link", { name: "Sign up" });
    expect(login).toHaveAttribute("aria-current", "page");
    expect(signup).not.toHaveAttribute("aria-current");
  });

  it("honors custom hrefs", () => {
    render(
      <AuthTabs active="signup" loginHref="/enter" signupHref="/join" />,
    );
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/join",
    );
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/enter",
    );
  });
});

describe("AuthTabs — a11y (jest-axe)", () => {
  it("has no violations", async () => {
    const { container } = render(<AuthTabs active="signup" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
