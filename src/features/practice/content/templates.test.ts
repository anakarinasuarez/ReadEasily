import { describe, expect, it } from "vitest";
import { templatePracticeSet } from "./templates";

describe("templatePracticeSet", () => {
  it("generates 8 four-language sentences for any word", () => {
    const set = templatePracticeSet("crow");
    expect(set.sentences).toHaveLength(8);
    expect(set.word).toBe("crow");
    for (const s of set.sentences) {
      expect(s.en).toContain("crow");
      expect(s.es.length).toBeGreaterThan(0);
      expect(s.fr.length).toBeGreaterThan(0);
      expect(s.pt.length).toBeGreaterThan(0);
    }
  });

  it("inserts the active-language gloss (primary option) into translations", () => {
    const set = templatePracticeSet("Path", "sendero, camino");
    expect(set.sentences.some((s) => s.es.includes("sendero"))).toBe(true);
    // The secondary gloss after the comma is dropped — one clean word.
    expect(set.sentences.every((s) => !s.es.includes("camino"))).toBe(true);
    // The English line uses the lowercased word.
    expect(set.sentences[0].en).toContain("path");
  });

  it("falls back to the word itself when no translation is given", () => {
    const set = templatePracticeSet("crow");
    expect(set.sentences[0].es).toContain("crow");
  });

  it("lowercases + normalizes the word field for highlighting", () => {
    expect(templatePracticeSet("Path").word).toBe("path");
  });
});
