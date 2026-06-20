import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";

/**
 * Harness smoke test. Proves three tools run together:
 *  - Vitest executes the test,
 *  - React Testing Library renders + queries by role,
 *  - jest-axe runs the a11y audit and the custom matcher resolves.
 * This is intentionally trivial; real component tests live with each component.
 */
function Greeting() {
  return (
    <main>
      <h1>ReadEasily</h1>
      <button type="button">Open story</button>
    </main>
  );
}

describe("test harness", () => {
  it("renders and queries by accessible role (RTL)", () => {
    render(<Greeting />);
    expect(
      screen.getByRole("heading", { level: 1, name: "ReadEasily" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open story" }),
    ).toBeInTheDocument();
  });

  it("has no detectable a11y violations (jest-axe)", async () => {
    const { container } = render(<Greeting />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
