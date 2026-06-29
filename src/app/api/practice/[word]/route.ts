import {
  resolvePracticeSet,
  templatePracticeSet,
} from "@/features/practice/content";
import { generatePracticeSet } from "@/features/practice/server/generateWithGemini";
import { normalizeLemma } from "@/features/reader/content/lemma";
import type { PracticeResponse, PracticeSet } from "@/features/practice/types";

/**
 * Real Practice generation endpoint — `GET /api/practice/[word]`.
 *
 * The browser's MSW worker serves precomputed words instantly and only
 * `passthrough()`s a MISS here, so this route's job is the long tail: generate
 * sentences for any word. Cascade:
 *   1. precomputed sample (safety net for environments without MSW)
 *   2. Gemini Flash (free tier) when `GEMINI_API_KEY` is set
 *   3. offline templates (when there's no key, or Gemini errors/times out)
 *
 * Always answers `found: true` (HTTP 200) — Practice never shows "coming soon".
 * Generated sets are cached in memory per word+nonce so cost/latency is paid
 * once; template fallbacks are NOT cached, so a transient Gemini failure is
 * retried on the next request.
 */
export const dynamic = "force-dynamic";

/** Per-instance cache of generated sets, keyed by `lemma:nonce`. */
const cache = new Map<string, PracticeSet>();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ word: string }> },
) {
  const { word } = await params;
  const decoded = decodeURIComponent(word);
  const url = new URL(request.url);
  const nonce = Number(url.searchParams.get("nonce") ?? "0");
  const translation = url.searchParams.get("t") ?? undefined;

  // 1. Precomputed (only reached when MSW isn't intercepting — e.g. SSR/no-mock).
  const precomputed = resolvePracticeSet(decoded);
  if (precomputed) {
    return Response.json({
      word: precomputed.word,
      found: true,
      sentences: precomputed.sentences,
    } satisfies PracticeResponse);
  }

  // 2/3. Gemini (cached) → templates (not cached, so it retries Gemini later).
  const cacheKey = `${normalizeLemma(decoded) || decoded.toLowerCase()}:${nonce}`;
  let set = cache.get(cacheKey);
  if (!set) {
    const generated = await generatePracticeSet(decoded, translation);
    if (generated) {
      set = generated;
      cache.set(cacheKey, generated);
    } else {
      set = templatePracticeSet(decoded, translation);
    }
  }

  return Response.json({
    word: set.word,
    found: true,
    sentences: set.sentences,
  } satisfies PracticeResponse);
}
