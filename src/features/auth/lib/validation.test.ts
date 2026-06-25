import { describe, it, expect } from "vitest";
import {
  EMAIL_RE,
  MIN_PASSWORD_LENGTH,
  isValidEmail,
  validateEmail,
  validateRequired,
  validateNewPassword,
} from "./validation";

/**
 * Validation helpers — the single source of truth the three auth screens share.
 * Tested directly so the email regex + the field rules are pinned independent of
 * any screen, and a regression surfaces here rather than in three screen tests.
 */

describe("EMAIL_RE / isValidEmail", () => {
  it.each([
    "ana@example.com",
    "maria.jose@read.easily.io",
    "bob+tag@x.co",
    "a@b.cd",
  ])("accepts %s", (email) => {
    expect(isValidEmail(email)).toBe(true);
    expect(EMAIL_RE.test(email)).toBe(true);
  });

  it.each(["", "no-at", "no@dot", "@nolocal.com", "spaces in@x.com", "a@b"])(
    "rejects %s",
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );

  it("trims surrounding whitespace before testing", () => {
    expect(isValidEmail("  ana@example.com  ")).toBe(true);
  });
});

describe("validateEmail", () => {
  it("requires a value", () => {
    expect(validateEmail("")).toBe("Enter your email address.");
    expect(validateEmail("   ")).toBe("Enter your email address.");
  });

  it("flags a malformed address", () => {
    expect(validateEmail("not-an-email")).toBe("Enter a valid email address.");
  });

  it("passes a valid address", () => {
    expect(validateEmail("ana@example.com")).toBeUndefined();
  });
});

describe("validateRequired", () => {
  it("returns the supplied message when empty/whitespace", () => {
    expect(validateRequired("", "Enter your name.")).toBe("Enter your name.");
    expect(validateRequired("   ", "Enter your name.")).toBe("Enter your name.");
  });

  it("passes any non-empty value", () => {
    expect(validateRequired("Ana", "Enter your name.")).toBeUndefined();
  });
});

describe("validateNewPassword", () => {
  it("requires a value", () => {
    expect(validateNewPassword("")).toBe("Choose a password.");
  });

  it("enforces the minimum length", () => {
    expect(validateNewPassword("short")).toBe("Use at least 8 characters.");
    expect(validateNewPassword("1234567")).toBe("Use at least 8 characters.");
  });

  it("passes a password at or above the minimum", () => {
    expect(validateNewPassword("12345678")).toBeUndefined();
    expect("12345678").toHaveLength(MIN_PASSWORD_LENGTH);
  });
});
