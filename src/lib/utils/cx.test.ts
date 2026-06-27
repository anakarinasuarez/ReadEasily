import { describe, it, expect } from "vitest";
import { cx } from "./cx";

describe("cx", () => {
  it("joins truthy class fragments with a single space", () => {
    expect(cx("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy fragments (false / null / undefined / empty string)", () => {
    expect(cx("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("returns an empty string when everything is falsy", () => {
    expect(cx(false, null, undefined)).toBe("");
  });

  it("supports conditional expressions (the common call shape)", () => {
    const active = true;
    const disabled = false;
    expect(cx("base", active && "active", disabled && "disabled")).toBe(
      "base active",
    );
  });
});
