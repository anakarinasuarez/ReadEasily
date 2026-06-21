import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";

describe("nested interactive sanity", () => {
  it("flags button inside anchor?", async () => {
    const { container } = render(
      <a href="/x"><button type="button" aria-label="play">x</button></a>,
    );
    const results = await axe(container);
    console.log("VIOLATIONS:", JSON.stringify(results.violations.map(v => v.id)));
    expect(true).toBe(true);
  });
});
