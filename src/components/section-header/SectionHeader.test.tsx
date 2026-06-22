import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { SectionHeader } from "./SectionHeader";

describe("SectionHeader — heading semantics", () => {
  it("renders a real heading at level 2 by default", () => {
    render(<SectionHeader title="Fables" />);
    const heading = screen.getByRole("heading", { level: 2, name: "Fables" });
    expect(heading).toBeInTheDocument();
  });

  it("honors the `as` prop for the heading level", () => {
    render(<SectionHeader title="Search" as="h1" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Search" }),
    ).toBeInTheDocument();
  });

  it("the marker bar is decorative (not part of the accessible name)", () => {
    render(<SectionHeader title="Daily life" />);
    // The accessible name is exactly the title — the bar contributes nothing.
    expect(
      screen.getByRole("heading", { name: "Daily life" }),
    ).toBeInTheDocument();
  });

  it("forwards extra class names to the heading", () => {
    render(<SectionHeader title="Travel" className="mt-8" />);
    expect(screen.getByRole("heading", { name: "Travel" }).className).toContain(
      "mt-8",
    );
  });
});

describe("SectionHeader — a11y (jest-axe)", () => {
  it("has no violations", async () => {
    const { container } = render(<SectionHeader title="Fables" as="h1" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
