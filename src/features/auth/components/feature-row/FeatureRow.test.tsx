import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { FeatureRow } from "./FeatureRow";
import { HeadphonesIcon } from "../icons";

describe("FeatureRow — content", () => {
  it("renders the title as a heading and the description", () => {
    render(
      <FeatureRow
        icon={<HeadphonesIcon />}
        title="Listen to classics"
        description="Hear every story read aloud."
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Listen to classics" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Hear every story read aloud.")).toBeInTheDocument();
  });

  it("renders the icon decoratively (not in the accessible name)", () => {
    render(
      <FeatureRow
        icon={<HeadphonesIcon data-testid="glyph" />}
        title="Tap any word"
        description="Instant translation."
      />,
    );
    // The heading's accessible name is exactly the title — the glyph is hidden.
    const heading = screen.getByRole("heading", { name: "Tap any word" });
    expect(heading).toBeInTheDocument();
  });
});

describe("FeatureRow — a11y (jest-axe)", () => {
  it("has no violations", async () => {
    const { container } = render(
      <FeatureRow
        icon={<HeadphonesIcon />}
        title="Listen to classics"
        description="Hear every story read aloud by a native voice."
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
