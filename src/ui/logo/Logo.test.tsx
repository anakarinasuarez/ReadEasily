import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("renders the ReadEasily wordmark text", () => {
    render(<Logo />);
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("Easily")).toBeInTheDocument();
  });

  it("is nameless to assistive tech on its own (consumers label it)", () => {
    // No role="img"/link/button comes from the Logo itself; the mark and
    // wordmark are aria-hidden so a wrapping aria-label is the sole name.
    const { container } = render(<Logo />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("applies the requested wordmark scale", () => {
    const { rerender } = render(<Logo size="md" />);
    expect(screen.getByText("Read").parentElement).toHaveClass("text-[14px]");
    rerender(<Logo size="lg" />);
    expect(screen.getByText("Read").parentElement).toHaveClass(
      "text-[length:var(--text-heading-h3-size)]",
    );
  });

  it("forwards className to the outer wrapper", () => {
    const { container } = render(<Logo className="custom-x" />);
    expect(container.firstChild).toHaveClass("custom-x");
  });

  it("has no axe violations when wrapped as a labelled image", async () => {
    const { container } = render(
      <span role="img" aria-label="ReadEasily">
        <Logo />
      </span>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
