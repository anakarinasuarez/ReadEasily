import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../../../tests/mocks/server";
import { useSaveWord } from "../hooks/useSaveWord";
import { savedQueryKey } from "@/features/saved/api/getSaved";
import {
  deriveSavedStats,
  type SavedData,
  type SavedWord,
} from "@/features/saved/types";
import type { NewSavedWord } from "../types";

/**
 * Behavior tests for the optimistic save-word cache contract, on the hook
 * directly. The popover flips to "Saved" instantly off this cache edit, so the
 * edit IS the behavior: insert-at-front, the case-insensitive de-dupe that keeps
 * a double-tap from spawning a second card, and the rollback when the POST fails
 * — none of which the popover/screen tests assert at the cache level.
 *
 * We assert the resulting `savedQueryKey` cache (what the Saved screen renders),
 * never which methods ran. The shared client uses `gcTime: Infinity` because the
 * hook is mutation-only — a `gcTime: 0` client would GC the seed immediately.
 */

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function savedWord(id: string, word: string): SavedWord {
  return {
    id,
    word,
    translation: `t-${word}`,
    sourceStoryId: "s",
    sourceStoryTitle: "Story",
    sentencesReady: 0,
    savedAt: "2026-06-22T10:00:00.000Z",
  };
}

function newWord(word: string): NewSavedWord {
  return {
    word,
    translation: `t-${word}`,
    sourceStoryId: "s",
    sourceStoryTitle: "Story",
    sentencesReady: 0,
    savedAt: "2026-06-23T10:00:00.000Z",
  };
}

function seed(client: QueryClient, words: SavedWord[]) {
  client.setQueryData<SavedData>(savedQueryKey, {
    words,
    stats: deriveSavedStats(words),
  });
}

function readWords(client: QueryClient): SavedWord[] {
  return client.getQueryData<SavedData>(savedQueryKey)?.words ?? [];
}

function setup(client: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return renderHook(() => useSaveWord(), { wrapper: Wrapper });
}

const okPost = () =>
  server.use(
    http.post("/api/saved", () =>
      HttpResponse.json(savedWord("server-id", "Whatever"), { status: 201 }),
    ),
  );
const failPost = () =>
  server.use(
    http.post("/api/saved", () =>
      HttpResponse.json({ error: "boom" }, { status: 500 }),
    ),
  );

describe("useSaveWord", () => {
  it("optimistically inserts the new word at the front and re-derives stats", async () => {
    const client = makeClient();
    seed(client, [savedWord("a", "Apple")]);
    okPost();

    const { result } = setup(client);
    await act(async () => {
      await result.current.mutateAsync(newWord("Banana"));
    });

    const words = readWords(client);
    // New word leads the list (most-recent-first) ahead of the existing one.
    expect(words.map((w) => w.word)).toEqual(["Banana", "Apple"]);
    expect(words[0].id).toBe("optimistic-banana");
    expect(client.getQueryData<SavedData>(savedQueryKey)!.stats).toEqual({
      wordsToReview: 2,
      practiceSets: 0,
    });
  });

  it("does not duplicate a word already saved (case-insensitive)", async () => {
    const client = makeClient();
    seed(client, [savedWord("path", "Path")]);
    okPost();

    const { result } = setup(client);
    await act(async () => {
      // Different casing than the saved "Path" — must be treated as the same.
      await result.current.mutateAsync(newWord("path"));
    });

    // Still exactly one card, and the original real row is untouched (no
    // optimistic placeholder shoved in front).
    const words = readWords(client);
    expect(words).toHaveLength(1);
    expect(words[0].id).toBe("path");
  });

  it("rolls back the optimistic word when the POST fails", async () => {
    const client = makeClient();
    seed(client, [savedWord("a", "Apple")]);
    failPost();

    const { result } = setup(client);
    await act(async () => {
      await result.current.mutateAsync(newWord("Banana")).catch(() => {});
    });

    // The placeholder is removed; the pre-existing list is exactly restored.
    const words = readWords(client);
    expect(words.map((w) => w.word)).toEqual(["Apple"]);
  });

  it("leaves the list untouched on failure when nothing was inserted (already saved)", async () => {
    const client = makeClient();
    seed(client, [savedWord("path", "Path")]);
    failPost();

    const { result } = setup(client);
    await act(async () => {
      await result.current.mutateAsync(newWord("Path")).catch(() => {});
    });

    // A no-op insert must mean a no-op rollback — the real row must survive a
    // failed double-save, not get wrongly filtered out.
    const words = readWords(client);
    expect(words).toHaveLength(1);
    expect(words[0].id).toBe("path");
  });

  it("inserts into an empty cache when nothing is saved yet", async () => {
    const client = makeClient();
    // No seed at all — the very first save.
    okPost();

    const { result } = setup(client);
    await act(async () => {
      await result.current.mutateAsync(newWord("First"));
    });

    const words = readWords(client);
    expect(words.map((w) => w.word)).toEqual(["First"]);
    expect(words[0].id).toBe("optimistic-first");
  });
});
