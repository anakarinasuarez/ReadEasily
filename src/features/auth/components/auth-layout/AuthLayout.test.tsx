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

  it("shows the two-tone marketing headline as styled copy, not a heading", () => {
    render(
      <AuthLayout>
        <Card />
      </AuthLayout>,
    );
    // The headline is split into two-tone spans across a line break, so assert
    // its pieces rather than one node.
    expect(screen.getByText(/Read your/)).toBeInTheDocument();
    expect(screen.getByText(/English\./)).toBeInTheDocument();
    // The ONLY heading is the form card's — the panel copy is styled <p>s.
    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Create your account");
  });

  it("renders the four marketing bullets verbatim", () => {
    render(
      <AuthLayout>
        <Card />
      </AuthLayout>,
    );
    expect(
      screen.getByText("Expand your vocabulary 3x faster, in real context"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Train your ear with native-speaker audio narration"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Never forget words with smart spaced-repetition cards",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Build daily reading habits with streaks and progress"),
    ).toBeInTheDocument();
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
