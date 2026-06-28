"use client";

import { WordChip } from "@/components/word-chip";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { useSaveWord } from "@/features/reader/hooks/useSaveWord";
import { useStoryDetail } from "../hooks/useStoryDetail";
import type { StoryKeyWord } from "../types";

/**
 * "Key words you'll learn" — a client island below the server-rendered story
 * copy. It owns the only interactive, glossary-dependent piece of Story Detail:
 * the chips flip in place (English ↔ meaning) and "+" saves a word optimistically
 * (reflected in the shared Saved cache). It fetches the per-story glossary via
 * the existing `/api/story/:id/detail` seam — a regular (non-suspense) query, so
 * during SSG it renders nothing on the server and fills in after hydration,
 * never blocking the static content from prerendering.
 */

/** Title-case a surface word so a saved key word matches the Saved screen casing. */
function displayWord(surface: string): string {
  if (surface.length === 0) return surface;
  return surface[0].toUpperCase() + surface.slice(1);
}

export function StoryKeyWords({ storyId }: { storyId: string }) {
  const { data } = useStoryDetail(storyId);
  const { data: savedData } = useSaved();
  const save = useSaveWord();

  const savedWords = savedData?.words ?? [];
  const isSaved = (surface: string) =>
    savedWords.some((w) => w.word.toLowerCase() === surface.toLowerCase());

  const handleSave = (keyWord: StoryKeyWord) => {
    if (!data) return;
    if (isSaved(keyWord.surface)) return;
    save.mutate({
      word: displayWord(keyWord.surface),
      phonetic: keyWord.ipa,
      translation: keyWord.translation,
      sourceStoryId: data.id,
      sourceStoryTitle: data.title,
      sentencesReady: 0,
      savedAt: new Date().toISOString(),
    });
  };

  // Until the glossary arrives (and on the prerendered server pass) render
  // nothing — the static content above stands on its own.
  if (!data || data.keyWords.length === 0) return null;

  return (
    <section
      aria-labelledby="story-keywords-heading"
      className="order-8 flex flex-col gap-[var(--space-md)]"
    >
      <div className="flex flex-col gap-[var(--space-xs)]">
        <h2
          id="story-keywords-heading"
          className="text-[color:var(--text-primary)] [font-family:var(--text-heading-h3-family)] [font-size:var(--text-heading-h3-size)] [font-weight:var(--text-heading-h3-weight)] [line-height:var(--text-heading-h3-line-height)]"
        >
          Key words you&rsquo;ll learn
        </h2>
        <p className="text-[color:var(--text-muted)] [font-family:var(--text-label-s-family)] [font-size:var(--text-label-s-size)] [font-weight:var(--text-label-s-weight)] [letter-spacing:var(--text-label-s-tracking)] [line-height:var(--text-label-s-line-height)]">
          Tap a word to flip its meaning · tap + to save it for practice
        </p>
      </div>

      <ul className="flex list-none flex-wrap gap-[10px] p-0">
        {data.keyWords.map((kw) => (
          <li key={kw.surface} className="flex">
            <WordChip
              word={kw.surface}
              translation={kw.translation}
              pos={kw.pos}
              saved={isSaved(kw.surface)}
              onSave={() => handleSave(kw)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
