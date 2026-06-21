import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
describe("probe", () => {
  it("button in anchor", async () => {
    const { container } = render(
      <a href="/x"><button type="button" aria-label="play">x</button></a>,
    );
    const r = await axe(container);
    console.log("PROBE_VIOLATIONS=" + JSON.stringify(r.violations.map((v) => v.id)));
    expect(true).toBe(true);
  });
});
