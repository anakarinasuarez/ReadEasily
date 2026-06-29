import { describe, expect, it } from "vitest";
import {
  isValidPracticeWord,
  MAX_PRACTICE_WORD_LENGTH,
  parsePracticeNonce,
} from "./validateWord";

describe("isValidPracticeWord", () => {
  it("accepts real words, including accented, hyphenated and apostrophe forms", () => {
    for (const word of [
      "run",
      "Mountain",
      "café",
      "co-operate",
      "it's",
      "well being", // a trimmed two-token surface still reads as letters/space
    ]) {
      expect(isValidPracticeWord(word)).toBe(true);
    }
  });

  it("accepts a word with surrounding whitespace (trimmed before checking)", () => {
    expect(isValidPracticeWord("  happy  ")).toBe(true);
  });

  it("rejects empty / whitespace-only input", () => {
    expect(isValidPracticeWord("")).toBe(false);
    expect(isValidPracticeWord("   ")).toBe(false);
  });

  it("rejects input over the length cap (a billing/DoS lever for the generator)", () => {
    expect(isValidPracticeWord("a".repeat(MAX_PRACTICE_WORD_LENGTH))).toBe(true);
    expect(isValidPracticeWord("a".repeat(MAX_PRACTICE_WORD_LENGTH + 1))).toBe(
      false,
    );
  });

  it("rejects markup, control chars, digits and other non-word payloads", () => {
    for (const bad of [
      "<script>alert(1)</script>",
      "word\n\rinjection",
      "drop table words;",
      "12345",
      "a/../../etc/passwd",
      "http://evil.example/x",
      "{{7*7}}",
    ]) {
      expect(isValidPracticeWord(bad)).toBe(false);
    }
  });

  it("rejects non-string input", () => {
    expect(isValidPracticeWord(undefined)).toBe(false);
    expect(isValidPracticeWord(null)).toBe(false);
    expect(isValidPracticeWord(42)).toBe(false);
  });
});

describe("parsePracticeNonce", () => {
  it("parses a normal non-negative integer", () => {
    expect(parsePracticeNonce("0")).toBe(0);
    expect(parsePracticeNonce("3")).toBe(3);
  });

  it("defaults to 0 for missing, non-numeric or negative values", () => {
    expect(parsePracticeNonce(null)).toBe(0);
    expect(parsePracticeNonce("abc")).toBe(0);
    expect(parsePracticeNonce("-5")).toBe(0);
    expect(parsePracticeNonce("NaN")).toBe(0);
  });

  it("floors fractional values and clamps absurdly large ones", () => {
    expect(parsePracticeNonce("2.9")).toBe(2);
    expect(parsePracticeNonce("999999999999")).toBe(1_000_000);
  });
});
