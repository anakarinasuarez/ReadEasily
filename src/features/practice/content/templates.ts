/**
 * Zero-cost practice fallback — template-generated example sentences for ANY
 * word, so Practice never falls through to a "coming soon" empty state.
 *
 * This is the offline branch the resolver's TODO promised: when
 * `resolvePracticeSet` misses (the word isn't one of the 14 hand-authored
 * samples), the MSW handler calls `templatePracticeSet` instead of returning
 * `found: false`. The frames are authored in all four languages with a single
 * `{w}` slot — the English word fills the `en` line, and the word's translation
 * (the gloss the overlay already shows in the header, e.g. "sendero") fills the
 * translation lines, so the per-sentence translation for the active language is
 * a real sentence, not an echo.
 *
 * Deliberately "basic": the frames assume a masculine singular noun (the common
 * case for tapped content words). Some article/gender agreement will be off —
 * that's the accepted trade-off for a free, dependency-free, offline generator.
 * A higher-fidelity backend (an LLM per word) can replace this behind the same
 * `GET /api/practice/:word` seam with no overlay change.
 */
import { normalizeLemma } from "@/features/reader/content/lemma";
import type { PracticeSentence, PracticeSet } from "../types";

interface Frame {
  en: string;
  es: string;
  fr: string;
  pt: string;
}

/** Eight everyday frames, short and concrete (A2). `{w}` is the word slot. */
const FRAMES: Frame[] = [
  { en: "I can see the {w}.", es: "Puedo ver el {w}.", fr: "Je peux voir le {w}.", pt: "Eu posso ver o {w}." },
  { en: "This is my {w}.", es: "Este es mi {w}.", fr: "C'est mon {w}.", pt: "Este é o meu {w}." },
  { en: "I really like the {w}.", es: "Me gusta mucho el {w}.", fr: "J'aime beaucoup le {w}.", pt: "Eu gosto muito do {w}." },
  { en: "Where is the {w}?", es: "¿Dónde está el {w}?", fr: "Où est le {w} ?", pt: "Onde está o {w}?" },
  { en: "She has a {w}.", es: "Ella tiene un {w}.", fr: "Elle a un {w}.", pt: "Ela tem um {w}." },
  { en: "We need a new {w}.", es: "Necesitamos un {w} nuevo.", fr: "Nous avons besoin d'un nouveau {w}.", pt: "Precisamos de um {w} novo." },
  { en: "The {w} is here.", es: "El {w} está aquí.", fr: "Le {w} est ici.", pt: "O {w} está aqui." },
  { en: "Do you like the {w}?", es: "¿Te gusta el {w}?", fr: "Aimes-tu le {w} ?", pt: "Gostas do {w}?" },
];

/** First option of a multi-gloss translation ("sendero, camino" → "sendero"). */
function primaryGloss(translation: string): string {
  return translation.split(/[,/;·|]/)[0].trim();
}

/**
 * Build a `PracticeSet` for `word` from the frames. `translation` (the word's
 * gloss in the active Reader language) fills the foreign lines; without one they
 * fall back to the English word. `word` field is the normalized lemma so the
 * overlay highlights every inflection.
 */
export function templatePracticeSet(
  word: string,
  translation?: string,
): PracticeSet {
  const en = word.trim().toLowerCase() || "word";
  const gloss =
    translation && primaryGloss(translation)
      ? primaryGloss(translation).toLowerCase()
      : en;

  const sentences: PracticeSentence[] = FRAMES.map((frame) => ({
    en: frame.en.replace("{w}", en),
    es: frame.es.replace("{w}", gloss),
    fr: frame.fr.replace("{w}", gloss),
    pt: frame.pt.replace("{w}", gloss),
  }));

  return { word: normalizeLemma(word) || en, sentences };
}
