import { normalizeLemma } from "@/features/reader/content/lemma";
import { isValidPracticeWord } from "@/features/practice/validateWord";
import { translateWord } from "@/features/reader/server/translateWithGemini";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  type Language,
  type TranslationResponse,
} from "@/features/reader/types";

/**
 * Single-word translation FALLBACK endpoint — `GET /api/translate/[word]?lang=`.
 *
 * The Reader resolves a tapped word from the story's curated glossary FIRST;
 * only on a MISS does it hit this route (see `useWordTranslation`), so this is
 * purely the fallback tier — the mirror of `/api/practice/[word]`:
 *   1. glossary (upstream, in the Reader — never reaches here on a hit)
 *   2. Gemini Flash (free tier) when `GEMINI_API_KEY` is set
 *   3. nothing — `found: false` when there's no key or Gemini errors/times out
 *
 * Unlike Practice (which always has offline templates to fall back to), a
 * translation has no zero-cost stand-in, so a true failure answers
 * `found: false` (still HTTP 200) rather than inventing a meaning. Successful
 * translations are cached in memory per word+lang so cost/latency is paid once;
 * `found: false` is NOT cached, so a transient Gemini failure is retried on the
 * next request.
 */
export const dynamic = "force-dynamic";

/** Per-instance cache of resolved translations, keyed by `lemma:lang`. */
const cache = new Map<string, TranslationResponse>();

/** Coerce the `?lang=` param to a supported language (default Spanish). */
function parseLang(raw: string | null): Language {
  return LANGUAGES.includes(raw as Language) ? (raw as Language) : DEFAULT_LANGUAGE;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ word: string }> },
) {
  const { word } = await params;
  const decoded = decodeURIComponent(word);

  // Validate at the boundary before forwarding to a paid generator: reject
  // oversized / non-word input rather than process it. Same guard the practice
  // route + MSW handler apply (single source of truth for the word contract).
  if (!isValidPracticeWord(decoded)) {
    return Response.json({ error: "Invalid word" }, { status: 400 });
  }

  const lang = parseLang(new URL(request.url).searchParams.get("lang"));
  const lemma = normalizeLemma(decoded) || decoded.toLowerCase();
  const cacheKey = `${lemma}:${lang}`;

  const cached = cache.get(cacheKey);
  if (cached) return Response.json(cached);

  const translated = await translateWord(decoded, lang);
  if (!translated) {
    // No key / network / parse error → don't invent a translation, and DON'T
    // cache the miss so the next tap retries Gemini.
    return Response.json({
      word: lemma,
      lang,
      found: false,
    } satisfies TranslationResponse);
  }

  const response: TranslationResponse = {
    word: lemma,
    lang,
    found: true,
    translation: translated.translation,
    pos: translated.pos,
    phonetic: translated.phonetic,
  };
  cache.set(cacheKey, response);
  return Response.json(response);
}
