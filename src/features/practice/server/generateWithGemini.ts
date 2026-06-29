import { normalizeLemma } from "@/features/reader/content/lemma";
import type { PracticeSentence, PracticeSet } from "../types";

/**
 * Per-word practice generation via the Google Gemini REST API (free tier).
 *
 * Server-only: the `/api/practice/[word]` route calls this when a word has no
 * precomputed sample. The API key lives in `GEMINI_API_KEY` (server env) and is
 * never sent to the browser. Returns `null` on ANY problem (no key, network
 * error, bad/empty JSON) so the route falls back to the offline templates —
 * Practice never breaks and never blocks on the model.
 *
 * Uses plain `fetch` (no SDK dependency). Asks for strict JSON via
 * `responseMimeType` and validates the shape before trusting it.
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const COUNT = 6;
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

function buildPrompt(word: string, translation?: string): string {
  const hint = translation ? ` Its meaning is roughly "${translation}".` : "";
  return `You write example sentences for an English learner at CEFR level A2.
For the English word "${word}"${hint}, write exactly ${COUNT} short, simple, everyday example sentences (max 10 words each) that use the word naturally, in varied concrete situations.
For each sentence, also give an accurate, natural translation in Spanish (es), French (fr), and Portuguese (pt).
Return ONLY a JSON object of EXACTLY this shape, with no extra text:
{"sentences":[{"en":"...","es":"...","fr":"...","pt":"..."}]}`;
}

function isSentence(value: unknown): value is PracticeSentence {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.en === "string" &&
    typeof s.es === "string" &&
    typeof s.fr === "string" &&
    typeof s.pt === "string"
  );
}

/** Generate a `PracticeSet` for `word`, or `null` to signal "fall back". */
export async function generatePracticeSet(
  word: string,
  translation?: string,
): Promise<PracticeSet | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    const res = await callGemini(
      `${ENDPOINT}/${MODEL}:generateContent?key=${key}`,
      JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(word, translation) }] }],
        generationConfig: {
          // Strict JSON out; a little temperature so "New sentences" varies.
          responseMimeType: "application/json",
          temperature: 0.9,
          // Disable 2.5-flash's default "thinking" — these are simple A2
          // sentences, so it's pure latency (~6s → ~1-2s). For even faster,
          // set GEMINI_MODEL=gemini-2.5-flash-lite.
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

    const parsed: unknown = JSON.parse(text);
    const list = Array.isArray(parsed)
      ? parsed
      : (parsed as { sentences?: unknown }).sentences;
    if (!Array.isArray(list)) return null;

    const sentences: PracticeSentence[] = list
      .filter(isSentence)
      .slice(0, 10)
      .map((s) => ({
        en: s.en.trim(),
        es: s.es.trim(),
        fr: s.fr.trim(),
        pt: s.pt.trim(),
      }));
    if (sentences.length === 0) return null;

    return { word: normalizeLemma(word) || word.toLowerCase(), sentences };
  } catch {
    // Timeout, network, or parse error → let the caller fall back.
    return null;
  }
}
