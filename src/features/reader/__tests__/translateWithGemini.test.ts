import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  toWordTranslation,
  translateWord,
} from "../server/translateWithGemini";

/**
 * Unit tests for the single-word Gemini FALLBACK. The network is mocked, so
 * these pin the discipline the route relies on: a strict, validated shape on a
 * good response, and `null` (→ the route answers `found:false`) on a missing
 * key, a transport error, or a malformed/empty payload — the translator never
 * throws and never returns a half-built meaning.
 */

/** Wrap a model JSON string in the Gemini `generateContent` envelope. */
function geminiEnvelope(text: string) {
  return {
    ok: true,
    json: async () => ({
      candidates: [{ content: { parts: [{ text }] } }],
    }),
  } as unknown as Response;
}

const ORIGINAL_KEY = process.env.GEMINI_API_KEY;

beforeEach(() => {
  process.env.GEMINI_API_KEY = "test-key";
});

afterEach(() => {
  vi.restoreAllMocks();
  if (ORIGINAL_KEY === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = ORIGINAL_KEY;
});

describe("toWordTranslation (shape validation)", () => {
  it("accepts a well-formed payload and trims the fields", () => {
    expect(
      toWordTranslation({
        translation: "  correr  ",
        pos: " Verb ",
        phonetic: " /rʌn/ ",
      }),
    ).toEqual({ translation: "correr", pos: "verb", phonetic: "/rʌn/" });
  });

  it("keeps translation but drops blank optional fields", () => {
    expect(
      toWordTranslation({ translation: "correr", pos: "", phonetic: "   " }),
    ).toEqual({ translation: "correr", pos: undefined, phonetic: undefined });
  });

  it("rejects a payload with no real translation", () => {
    expect(toWordTranslation({ translation: "   " })).toBeNull();
    expect(toWordTranslation({ pos: "noun" })).toBeNull();
    expect(toWordTranslation(null)).toBeNull();
    expect(toWordTranslation("correr")).toBeNull();
  });
});

describe("translateWord", () => {
  it("returns null when no API key is configured (falls back)", async () => {
    delete process.env.GEMINI_API_KEY;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(await translateWord("run", "es")).toBeNull();
    // Never even reached the network without a key.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns a validated WordTranslation on a good response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      geminiEnvelope(
        JSON.stringify({ translation: "correr", pos: "verb", phonetic: "/rʌn/" }),
      ),
    );
    expect(await translateWord("running", "es")).toEqual({
      translation: "correr",
      pos: "verb",
      phonetic: "/rʌn/",
    });
  });

  it("returns null on a non-retryable HTTP error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
    } as unknown as Response);
    expect(await translateWord("run", "fr")).toBeNull();
  });

  it("returns null on a network throw", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    expect(await translateWord("run", "pt")).toBeNull();
  });

  it("returns null when the model text is not valid JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      geminiEnvelope("not json at all"),
    );
    expect(await translateWord("run", "es")).toBeNull();
  });

  it("returns null when the parsed payload has the wrong shape", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      geminiEnvelope(JSON.stringify({ meaning: "correr" })),
    );
    expect(await translateWord("run", "es")).toBeNull();
  });
});
