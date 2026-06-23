import { describe, expect, it } from "vitest";
import {
  countWords,
  listStoryIds,
  loadStory,
  WORDS_PER_PAGE,
} from "../content/loader";
import { lookupWord, normalizeLemma, PENDING_TRANSLATION } from "../content/lemma";

/**
 * Content-loader unit tests. These prove the `*.md?raw` corpus actually loads
 * under the test bundler, the frontmatter/pagination is deterministic, and the
 * Spanish sidecar merges (and degrades) correctly — the contract the MSW handler
 * and the screen both depend on.
 */
describe("reader content loader", () => {
  it("exposes all ten stories", () => {
    expect(listStoryIds()).toHaveLength(10);
    expect(listStoryIds()).toContain("the-clever-crow");
  });

  it("parses frontmatter and paginates a story into multiple pages", () => {
    const story = loadStory("the-clever-crow");
    expect(story).not.toBeNull();
    expect(story!.title).toBe("The Clever Crow");
    expect(story!.level).toBe("A1");
    expect(story!.pages.length).toBeGreaterThan(1);

    // Every page stays at/under the word budget (single over-long paragraphs
    // are the only allowed exception, and these stories have none).
    for (const page of story!.pages) {
      const words = page.paragraphs.reduce((n, p) => n + countWords(p), 0);
      expect(words).toBeLessThanOrEqual(WORDS_PER_PAGE);
    }
  });

  it("merges the Spanish sidecar 1:1 with the English paragraphs", () => {
    const story = loadStory("the-clever-crow");
    expect(story!.hasTranslation).toBe(true);
    for (const page of story!.pages) {
      expect(page.translationParagraphs).toHaveLength(page.paragraphs.length);
    }
    // Glossary covers content words.
    expect(story!.glossary.crow?.es).toBe("cuervo");
  });

  it("wires every story's sidecar 1:1 (all ten are translatable)", () => {
    for (const id of listStoryIds()) {
      const story = loadStory(id);
      expect(story, id).not.toBeNull();
      // All ten now ship an aligned Spanish sidecar + glossary.
      expect(story!.hasTranslation, id).toBe(true);
      expect(Object.keys(story!.glossary).length, id).toBeGreaterThan(0);
      for (const page of story!.pages) {
        // Each page pairs every English paragraph with a Spanish one.
        expect(page.translationParagraphs, id).toHaveLength(
          page.paragraphs.length,
        );
      }
    }
  });

  it("returns null for an unknown id", () => {
    expect(loadStory("nope")).toBeNull();
  });

  it("normalizes lemmas and looks words up, with a pending fallback", () => {
    expect(normalizeLemma('"Path,')).toBe("path");
    expect(normalizeLemma("don't")).toBe("don't");

    const glossary = loadStory("the-clever-crow")!.glossary;
    expect(lookupWord(glossary, "Crow.").translation).toBe("cuervo");
    expect(lookupWord(glossary, "Crow.").found).toBe(true);

    const miss = lookupWord(glossary, "xyzzy");
    expect(miss.found).toBe(false);
    expect(miss.translation).toBe(PENDING_TRANSLATION);
  });
});
