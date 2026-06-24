import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { MoralCallout } from "./MoralCallout";

describe("MoralCallout", () => {
  it("renders the eyebrow label and the moral body inside a labelled region", () => {
    render(
      <MoralCallout moral="There is a time for work and a time for play." />,
    );
    const region = screen.getByRole("region", { name: "The Moral" });
    expect(
      within(region).getByText(
        "There is a time for work and a time for play.",
      ),
    ).toBeInTheDocument();
  });

  it("is NOT a dialog (static in-flow callout, no overlay semantics)", () => {
    render(<MoralCallout moral="A stitch in time saves nine." />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports a custom label", () => {
    render(<MoralCallout label="The Lesson" moral="Slow and steady wins." />);
    expect(
      screen.getByRole("region", { name: "The Lesson" }),
    ).toBeInTheDocument();
  });

  it("renders rich children when provided", () => {
    render(
      <MoralCallout>
        <span>Custom moral content</span>
      </MoralCallout>,
    );
    expect(screen.getByText("Custom moral content")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <MoralCallout moral="There is a time for work and a time for play." />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
