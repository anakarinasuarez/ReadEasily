import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savedQueryKey } from "@/features/saved/api/getSaved";
import {
  deriveSavedStats,
  type SavedData,
  type SavedWord,
} from "@/features/saved/types";
import { markPracticeReady, savePracticeWord } from "../api/getPractice";

/**
 * "Save to practice later" — persists that a word has ready practice sentences
 * so the Saved screen shows "Review" (its `sentencesReady` becomes `> 0`).
 *
 * Two paths, one mutation, decided from the SHARED saved cache so the overlay
 * needn't know which applies:
 *  • word already saved → PATCH `/api/saved/:id` to set `sentencesReady`.
 *  • word not saved yet → POST `/api/saved` to create it WITH `sentencesReady`.
 *
 * The CTA implies instant feedback (it flips to "Saved to practice"), so this
 * updates the `savedQueryKey` cache optimistically — flipping/creating the row's
 * `sentencesReady` and re-deriving the header stats the same way the server
 * will — then reconciles on success and rolls back on error. Writing through the
 * shared key means the Saved screen reflects the change automatically.
 */
export interface SavePracticeInput {
  /** The word as displayed/saved (Title-cased, e.g. "Path"). */
  word: string;
  translation: string;
  phonetic?: string;
  sourceStoryId: string;
  sourceStoryTitle: string;
  /** How many practice sentences are ready (the sample count, e.g. 10). */
  sentencesReady: number;
}

interface SaveContext {
  /** The previous cache, for rollback. */
  previous: SavedData | undefined;
}

export function useSavePractice() {
  const queryClient = useQueryClient();

  return useMutation<SavedWord, Error, SavePracticeInput, SaveContext>({
    mutationFn: async (input) => {
      const current = queryClient.getQueryData<SavedData>(savedQueryKey);
      // `onMutate` runs BEFORE this function and writes an optimistic row to the
      // cache, so skip optimistic rows here — otherwise a brand-new word would be
      // "found" as its own optimistic entry and wrongly take the PATCH path with
      // a fake `optimistic-` id (404). Only a REAL server row means "already
      // saved" → PATCH; everything else → POST.
      const existing = current?.words.find(
        (w) =>
          w.word.toLowerCase() === input.word.toLowerCase() &&
          !w.id.startsWith("optimistic-"),
      );
      if (existing) {
        return markPracticeReady(existing.id, input.sentencesReady);
      }
      return savePracticeWord({
        word: input.word,
        translation: input.translation,
        phonetic: input.phonetic,
        sourceStoryId: input.sourceStoryId,
        sourceStoryTitle: input.sourceStoryTitle,
        sentencesReady: input.sentencesReady,
        savedAt: new Date().toISOString(),
      });
    },

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: savedQueryKey });
      const previous = queryClient.getQueryData<SavedData>(savedQueryKey);

      const base = previous?.words ?? [];
      const idx = base.findIndex(
        (w) => w.word.toLowerCase() === input.word.toLowerCase(),
      );

      let words: SavedWord[];
      if (idx >= 0) {
        // Already saved → bump its sentencesReady in place.
        words = base.map((w, i) =>
          i === idx ? { ...w, sentencesReady: input.sentencesReady } : w,
        );
      } else {
        // Not saved → optimistic new row at the front (deterministic id).
        const optimistic: SavedWord = {
          id: `optimistic-${input.word.toLowerCase()}`,
          word: input.word,
          translation: input.translation,
          phonetic: input.phonetic,
          sourceStoryId: input.sourceStoryId,
          sourceStoryTitle: input.sourceStoryTitle,
          sentencesReady: input.sentencesReady,
          savedAt: new Date().toISOString(),
        };
        words = [optimistic, ...base];
      }

      queryClient.setQueryData<SavedData>(savedQueryKey, {
        words,
        stats: deriveSavedStats(words),
      });

      return { previous };
    },

    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(savedQueryKey, context.previous);
      }
    },

    onSuccess: () => {
      // Reconcile the optimistic row with the server's canonical one.
      void queryClient.invalidateQueries({ queryKey: savedQueryKey });
    },
  });
}
