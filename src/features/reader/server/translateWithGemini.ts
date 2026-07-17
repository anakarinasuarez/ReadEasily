import { normalizeLemma } from "@/features/reader/content/lemma";
import { LANGUAGE_LABELS, type Language, type WordTranslation } from "../types";

/**
 * Single-word translation FALLBACK via the Google Gemini REST API (free tier).
 *
 * Server-only: the `/api/translate/[word]` route calls this ONLY when the
 * story's curated glossary misses a tapped word (glossary hits are never sent
 * here). The API key lives in `GEMINI_API_KEY` (server env) and is never sent to
 * the browser. Returns `null` on ANY problem (no key, network error, bad/empty
 * JSON, wrong shape) so the route answers `found: false` and never invents a
 * meaning — the popover keeps its pending state and Save stays disabled.
 *
 * This is the exact structure of `features/practice/server/generateWithGemini.ts`
 * (retries, timeout, strict JSON via `responseMimeType`, thinking disabled),
 * specialised to return one concise dictionary sense instead of sentences.
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const TIMEOUT_MS = 15_000;

/** Transient statuses worth a quick retry (free tier flaps 404/503 under load). */
const RETRYABLE = new Set([404, 408, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** POST to Gemini with a few retries on transient errors; null on final failure. */
async function callGemini(url: string, body: string): Promise<Response | null> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.ok) return res;
      if (RETRYABLE.has(res.status) && attempt < MAX_ATTEMPTS) {
        await sleep(400 * attempt);
        continue;
      }
      return null;
    } catch {
      if (attempt < MAX_ATTEMPTS) {
        await sleep(400 * attempt);
        continue;
      }
      return null;
    }
  }
  return null;
}

function buildPrompt(word: string, lang: Language): string {
  const target = LANGUAGE_LABELS[lang];
  return `You are a bilingual dictionary for an English learner at CEFR level A2.
Give the CONCISE dictionary meaning of the single English word "${word}" in ${target}.
Keep the translation short: the most common sense, or at most a few comma-separated senses — never a full sentence or explanation.
Also give the word's part of speech in English, lowercase (noun, verb, adjective, adverb, preposition, pronoun, conjunction, interjection, …), and its IPA pronunciation.
Return ONLY a JSON object of EXACTLY this shape, with no extra text:
{"translation":"...","pos":"noun","phonetic":"/.../"}`;
}

/** Trust a Gemini payload only when it has a non-empty string `translation`;
 *  `pos`/`phonetic` are optional strings, dropped when absent or blank. */
function toWordTranslation(value: unknown): WordTranslation | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const translation =
    typeof v.translation === "string" ? v.translation.trim() : "";
  if (translation.length === 0) return null;
  const pos =
    typeof v.pos === "string" && v.pos.trim() !== ""
      ? v.pos.trim().toLowerCase()
      : undefined;
  const phonetic =
    typeof v.phonetic === "string" && v.phonetic.trim() !== ""
      ? v.phonetic.trim()
      : undefined;
  return { translation, pos, phonetic };
}

/** Translate one English `word` into `lang`, or `null` to signal "fall back". */
export async function translateWord(
  word: string,
  lang: Language,
): Promise<WordTranslation | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const normalized = normalizeLemma(word) || word.toLowerCase();
  if (normalized.length === 0) return null;

  try {
    const res = await callGemini(
      `${ENDPOINT}/${MODEL}:generateContent?key=${key}`,
      JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(normalized, lang) }] }],
        generationConfig: {
          // Strict JSON out; low temperature — a dictionary sense is not creative.
          responseMimeType: "application/json",
          temperature: 0.2,
          // Disable 2.5-flash's default "thinking" — a single-word gloss needs
          // none, so it's pure latency (~6s → ~1-2s).
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    );
    if (!res) return null;

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") return null;

    return toWordTranslation(JSON.parse(text) as unknown);
  } catch {
    // Timeout, network, or parse error → let the caller fall back.
    return null;
  }
}

// Exported for shape-validation tests (the fetch is mocked there).
export { toWordTranslation };
