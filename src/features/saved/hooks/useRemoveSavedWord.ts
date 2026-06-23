import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeSavedWord, savedQueryKey } from "../api/getSaved";
import { deriveSavedStats, type SavedData, type SavedWord } from "../types";

/**
 * Optimistic unsave. The Saved screen implies instant feedback — a removed card
 * animates out and the grid reflows immediately — so this does NOT wait for the
 * network: it edits the Query cache the moment the button is pressed, recomputes
 * the header stats from the remaining words (via `deriveSavedStats`, the same
 * function the mock uses, so the pills stay honest), and only reconciles with
 * the server afterwards. If the DELETE rejects, the one failed word is restored
 * at its original position.
 *
 * Concurrency-correct rollback: we capture only the removed word + its index in
 * `onMutate`, and on error re-insert THAT word into the CURRENT cache rather than
 * restoring a whole pre-mutation snapshot. Restoring a snapshot would resurrect a
 * different word that a concurrent remove had already successfully deleted (two
 * removes are reachable — the screen's `if (exitingId) return` guard clears at
 * commit-time, and the reduced-motion path skips the exit gate entirely). A
 * targeted re-insert touches only the word that actually failed.
 *
 * No `onSettled` refetch is issued: each path leaves the cache already correct
 * (success → word stays gone; error → word restored), so invalidating would only
 * add a redundant round-trip (and, against a stubbed delete, could contradict the
 * optimistic edit).
 *
 * Cache writes go through the shared `savedQueryKey`, so `useSaved` re-renders
 * automatically — no local copy of the list, no drift.
 */
interface RemoveContext {
  /** The word removed (for restore on failure), or undefined if not found. */
  removed: SavedWord | undefined;
  /** Its index in the list at removal time (re-insertion point on failure). */
  index: number;
}

export function useRemoveSavedWord() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, RemoveContext>({
    mutationFn: (id) => removeSavedWord(id),

    onMutate: async (id) => {
      // Cancel in-flight reads so a late refetch can't clobber the optimistic
      // edit, capture the single word being removed (for a targeted rollback),
      // then drop it + re-derive the stats.
      await queryClient.cancelQueries({ queryKey: savedQueryKey });
      const previous = queryClient.getQueryData<SavedData>(savedQueryKey);

      const index = previous?.words.findIndex((w) => w.id === id) ?? -1;
      const removed = index >= 0 ? previous?.words[index] : undefined;

      if (previous) {
        const words = previous.words.filter((w) => w.id !== id);
        queryClient.setQueryData<SavedData>(savedQueryKey, {
          words,
          stats: deriveSavedStats(words),
        });
      }

      return { removed, index };
    },

    onError: (_err, _id, context) => {
      // Re-insert only the failed word, into the CURRENT list, at its original
      // index — leaving any concurrently-removed word removed.
      if (!context?.removed) return;
      const current = queryClient.getQueryData<SavedData>(savedQueryKey);
      const base = current?.words ?? [];
      // Don't duplicate if it's somehow already back.
      if (base.some((w) => w.id === context.removed!.id)) return;
      const words = [...base];
      const at = Math.min(Math.max(context.index, 0), words.length);
      words.splice(at, 0, context.removed);
      queryClient.setQueryData<SavedData>(savedQueryKey, {
        words,
        stats: deriveSavedStats(words),
      });
    },
  });
}
