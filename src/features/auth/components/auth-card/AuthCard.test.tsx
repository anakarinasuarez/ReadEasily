import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AuthCard } from "./AuthCard";

describe("AuthCard — presentational container", () => {
  it("renders its children", () => {
    render(
      <AuthCard>
        <button type="button">Create account</button>
      </AuthCard>,
    );
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
  });

  it("merges a forwarded className onto the container", () => {
    const { container } = render(
      <AuthCard className="mt-8">
        <span>content</span>
      </AuthCard>,
    );
    expect(container.firstChild).toHaveClass("mt-8");
  });
});

describe("AuthCard — a11y (jest-axe)", () => {
  it("has no violations", async () => {
    const { container } = render(
      <AuthCard>
        <h2>Create your account</h2>
        <p>Track your progress and save words as you read.</p>
      </AuthCard>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
