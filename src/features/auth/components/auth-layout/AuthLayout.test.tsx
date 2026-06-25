import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AuthLayout } from "./AuthLayout";

function Card() {
  return (
    <div>
      <h1>Create your account</h1>
      <button type="button">Create account</button>
    </div>
  );
}

describe("AuthLayout — structure", () => {
  it("renders the landmark structure and the children slot", () => {
    render(
      <AuthLayout>
        <Card />
      </AuthLayout>,
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
    // The marketing panel is a complementary landmark with an accessible name.
    expect(
      screen.getByRole("complementary", { name: "Why ReadEasily" }),
    ).toBeInTheDocument();
    // The card (children) owns the page heading.
    expect(
      screen.getByRole("heading", { level: 1, name: "Create your account" }),
    ).toBeInTheDocument();
  });

  it("shows the fixed marketing headline (styled copy, not a heading)", () => {
    render(
      <AuthLayout>
        <Card />
      </AuthLayout>,
    );
    expect(
      screen.getByText("Read your way to fluent English."),
    ).toBeInTheDocument();
    // It must NOT be a heading — that role belongs to the form card.
    expect(
      screen.queryByRole("heading", { name: "Read your way to fluent English." }),
    ).not.toBeInTheDocument();
  });
});

describe("AuthLayout — back affordance", () => {
  it("renders no Back control when onBack is omitted", () => {
    render(
      <AuthLayout>
        <Card />
      </AuthLayout>,
    );
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
  });

  it("renders Back (mobile + desktop) and fires onBack when clicked", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(
      <AuthLayout onBack={onBack}>
        <Card />
      </AuthLayout>,
    );
    // Both the mobile chevron IconButton and the desktop ghost render in the DOM
    // (CSS, not JS, hides one per breakpoint).
    const backButtons = screen.getAllByRole("button", { name: "Back" });
    expect(backButtons.length).toBeGreaterThanOrEqual(1);
    await user.click(backButtons[0]);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe("AuthLayout — a11y (jest-axe)", () => {
  it("has no violations", async () => {
    const { container } = render(
      <AuthLayout onBack={() => {}}>
        <Card />
      </AuthLayout>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
