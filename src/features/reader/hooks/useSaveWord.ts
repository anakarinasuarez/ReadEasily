import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveWord } from "../api/getStory";
import { savedQueryKey } from "@/features/saved/api/getSaved";
import {
  deriveSavedStats,
  type SavedData,
  type SavedWord,
} from "@/features/saved/types";
import type { NewSavedWord } from "../types";

/**
 * Optimistic save-word. The popover implies instant feedback (its Save button
 * flips to "Saved" immediately), so this does NOT wait for the network: it
 * inserts the word at the front of the shared `savedQueryKey` cache the moment
 * Save is pressed, re-derives the header stats, then reconciles.
 *
 * Writing through `savedQueryKey` means the Saved screen reflects the new word
 * automatically — there is no second source of truth. On success we invalidate
 * that key so the optimistic placeholder is replaced by the server's canonical
 * `SavedWord` (with its real id); on error the optimistic word is rolled back.
 *
 * A word already present in the cache is a no-op insert (the cache is keyed by a
 * deterministic optimistic id), so double-saving never duplicates a card.
 */
interface SaveContext {
  /** The optimistic id inserted, so it can be removed on rollback. */
  optimisticId: string;
  /** Whether an optimistic insert actually happened (false if already present). */
  inserted: boolean;
}

/** Deterministic placeholder id for the optimistic row. */
function optimisticIdFor(word: NewSavedWord): string {
  return `optimistic-${word.word.toLowerCase()}`;
}

export function useSaveWord() {
  const queryClient = useQueryClient();

  return useMutation<SavedWord, Error, NewSavedWord, SaveContext>({
    mutationFn: (word) => saveWord(word),

    onMutate: async (word) => {
      await queryClient.cancelQueries({ queryKey: savedQueryKey });
      const optimisticId = optimisticIdFor(word);
      const previous = queryClient.getQueryData<SavedData>(savedQueryKey);

      // Already saved (matching word text, case-insensitive)? Don't duplicate.
      const alreadySaved = previous?.words.some(
        (w) => w.word.toLowerCase() === word.word.toLowerCase(),
      );
      if (alreadySaved) {
        return { optimisticId, inserted: false };
      }

      const optimistic: SavedWord = { id: optimisticId, ...word };
      const base = previous?.words ?? [];
      const words = [optimistic, ...base];
      queryClient.setQueryData<SavedData>(savedQueryKey, {
        words,
        stats: deriveSavedStats(words),
      });

      return { optimisticId, inserted: true };
    },

    onError: (_err, _word, context) => {
      if (!context?.inserted) return;
      const current = queryClient.getQueryData<SavedData>(savedQueryKey);
      if (!current) return;
      const words = current.words.filter((w) => w.id !== context.optimisticId);
      queryClient.setQueryData<SavedData>(savedQueryKey, {
        words,
        stats: deriveSavedStats(words),
      });
    },

    onSuccess: () => {
      // Reconcile the optimistic placeholder with the server's canonical row.
      void queryClient.invalidateQueries({ queryKey: savedQueryKey });
    },
  });
}
