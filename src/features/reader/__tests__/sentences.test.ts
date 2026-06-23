import { describe, expect, it } from "vitest";
import { buildSentences } from "../audio/sentences";
import type { StoryPage } from "../types";

/**
 * The audio sentence model. It must split a page into ordered sentences whose
 * word-index ranges line up with the rendered passage (same tokenizer), so the
 * karaoke highlight maps a spoken sentence onto the right WordTokens.
 */
describe("buildSentences", () => {
  it("splits on terminal punctuation with aligned word ranges", () => {
    const page: StoryPage = {
      index: 0,
      paragraphs: ["One two. Three four five!"],
      translationParagraphs: [],
    };
    const sentences = buildSentences(page);

    expect(sentences.map((s) => s.text)).toEqual([
      "One two.",
      "Three four five!",
    ]);
    expect(sentences[0]).toMatchObject({
      index: 0,
      firstWordIndex: 0,
      lastWordIndex: 1,
      wordIndices: [0, 1],
    });
    expect(sentences[1]).toMatchObject({
      index: 1,
      firstWordIndex: 2,
      lastWordIndex: 4,
      wordIndices: [2, 3, 4],
    });
  });

  it("treats a paragraph break as a sentence boundary and keeps indices page-global", () => {
    const page: StoryPage = {
      index: 0,
      paragraphs: ["Alpha beta.", "Gamma delta"],
      translationParagraphs: [],
    };
    const sentences = buildSentences(page);

    expect(sentences).toHaveLength(2);
    // Second paragraph's words continue the page-global index (no terminal
    // punctuation, but the paragraph break still closes the sentence).
    expect(sentences[1]).toMatchObject({
      text: "Gamma delta",
      firstWordIndex: 2,
      lastWordIndex: 3,
    });
  });

  it("ignores separator-only runs and an empty page", () => {
    expect(
      buildSentences({ index: 0, paragraphs: ["…  —  "], translationParagraphs: [] }),
    ).toEqual([]);
    expect(
      buildSentences({ index: 0, paragraphs: [], translationParagraphs: [] }),
    ).toEqual([]);
  });
});
