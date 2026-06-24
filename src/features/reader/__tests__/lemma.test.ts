import { describe, expect, it } from "vitest";
import { candidateLemmas, lookupWord, PENDING_TRANSLATION } from "../content/lemma";
import type { Glossary } from "../types";

/**
 * The Reader keys glossaries by base lemma, so the tap-a-word lookup must
 * lemmatize the surface form (suffix rules + an irregular map) to resolve
 * inflected words. A true miss still degrades to the pending note with
 * `found:false` so the feature can gate Save off (no junk vocabulary).
 */
const GLOSSARY: Glossary = {
  stone: { pos: "noun", translation: "piedra" },
  carry: { pos: "verb", translation: "llevar" },
  run: { pos: "verb", translation: "correr" },
  fly: { pos: "verb", translation: "volar" },
  good: { pos: "adjective", translation: "bueno" },
  big: { pos: "adjective", translation: "grande" },
};

describe("candidateLemmas", () => {
  it("recovers regular inflections", () => {
    expect(candidateLemmas("stones")).toContain("stone");
    expect(candidateLemmas("carried")).toContain("carry");
    expect(candidateLemmas("running")).toContain("run"); // doubled consonant
    expect(candidateLemmas("bigger")).toContain("big");
  });

  it("recovers common irregulars", () => {
    expect(candidateLemmas("ran")).toContain("run");
    expect(candidateLemmas("flew")).toContain("fly");
    expect(candidateLemmas("better")).toContain("good");
  });
});

describe("lookupWord", () => {
  it("resolves an exact base-lemma hit", () => {
    const r = lookupWord(GLOSSARY, "stone");
    expect(r.found).toBe(true);
    expect(r.translation).toBe("piedra");
  });

  it("resolves inflected and irregular surface forms to their base", () => {
    expect(lookupWord(GLOSSARY, "stones").translation).toBe("piedra");
    expect(lookupWord(GLOSSARY, "carried").translation).toBe("llevar");
    expect(lookupWord(GLOSSARY, "running").translation).toBe("correr");
    expect(lookupWord(GLOSSARY, "ran").translation).toBe("correr");
    expect(lookupWord(GLOSSARY, "flew").translation).toBe("volar");
  });

  it("strips surrounding punctuation before matching", () => {
    expect(lookupWord(GLOSSARY, '"Stone,').found).toBe(true);
  });

  it("degrades a true miss to the pending note with found:false", () => {
    const r = lookupWord(GLOSSARY, "xyzzy");
    expect(r.found).toBe(false);
    expect(r.translation).toBe(PENDING_TRANSLATION);
  });
});
