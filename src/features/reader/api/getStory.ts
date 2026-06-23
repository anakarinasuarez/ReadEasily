import type { Story, NewSavedWord } from "../types";
import type { SavedWord } from "@/features/saved/types";

/**
 * The Reader read seam — a thin, typed network boundary mirroring
 * `getLibrary()` / `getSaved()`.
 *
 * `getStory(id)` fetches `/api/story/:id` and returns a typed `Story`; the MSW
 * mock parses the Markdown + merges the Spanish sidecar today, a real backend
 * returns the same shape tomorrow. Callers go through `useStory` and never know
 * which.
 */
export async function getStory(id: string): Promise<Story> {
  const res = await fetch(`/api/story/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`getStory failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as Story;
}

/** Stable per-story cache key. Import so the query + any invalidation agree. */
export function storyQueryKey(id: string): readonly ["story", string] {
  return ["story", id] as const;
}

/**
 * Save a word — the write seam behind the popover's Save button. POSTs a
 * `NewSavedWord` to `/api/saved`; the backend assigns the id and echoes the
 * created `SavedWord`. The Reader applies the change optimistically to the
 * shared `savedQueryKey` cache (see `useSaveWord`) so the popover flips to
 * "Saved" instantly, and reconciles with this response.
 */
export async function saveWord(word: NewSavedWord): Promise<SavedWord> {
  const res = await fetch("/api/saved", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(word),
  });
  if (!res.ok) {
    throw new Error(`saveWord failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as SavedWord;
}
