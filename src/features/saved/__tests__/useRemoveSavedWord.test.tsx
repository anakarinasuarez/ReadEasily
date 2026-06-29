import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse, delay } from "msw";
import { server } from "../../../../tests/mocks/server";
import { useRemoveSavedWord } from "../hooks/useRemoveSavedWord";
import { savedQueryKey } from "../api/getSaved";
import { deriveSavedStats, type SavedData, type SavedWord } from "../types";

/**
 * Behavior tests for the optimistic-unsave cache contract, exercised on the hook
 * directly so the subtle, concurrency-correct rollback logic — which the screen
 * test (single removes only) never reaches — is actually proven.
 *
 * The "behavior" here IS the Query cache: this hook owns the optimistic edit and
 * the targeted re-insert. We drive real DELETE responses through MSW (204 / 500,
 * timed where ordering matters) and assert the resulting cache the Saved screen
 * renders from. We deliberately do NOT assert which methods ran — only the
 * observable cache outcome, so a behavior-preserving refactor stays green.
 */

/**
 * A client whose cache survives without an active query observer. The default
 * test client uses `gcTime: 0`, which would garbage-collect a `setQueryData`
 * seed the instant it has no `useQuery` subscriber — and this hook is mutation
 * -only. `gcTime: Infinity` keeps the seeded list alive for the assertions.
 */
function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function word(id: string, sentencesReady = 0): SavedWord {
  return {
    id,
    word: id.toUpperCase(),
    translation: `t-${id}`,
    sourceStoryId: "s",
    sourceStoryTitle: "Story",
    sentencesReady,
    savedAt: "2026-06-22T10:00:00.000Z",
  };
}

function seed(client: QueryClient, words: SavedWord[]) {
  client.setQueryData<SavedData>(savedQueryKey, {
    words,
    stats: deriveSavedStats(words),
  });
}

function readCache(client: QueryClient): SavedData {
  return client.getQueryData<SavedData>(savedQueryKey)!;
}

const ids = (data: SavedData) => data.words.map((w) => w.id);

function setup(client: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return renderHook(() => useRemoveSavedWord(), { wrapper: Wrapper });
}

describe("useRemoveSavedWord", () => {
  it("optimistically drops the word and re-derives the stats", async () => {
    const client = makeClient();
    seed(client, [word("a"), word("b", 5), word("c")]);
    server.use(
      http.delete("/api/saved/:id", () => new HttpResponse(null, { status: 204 })),
    );

    const { result } = setup(client);
    await act(async () => {
      await result.current.mutateAsync("b");
    });

    const data = readCache(client);
    expect(ids(data)).toEqual(["a", "c"]);
    // Stats follow the remaining words: 2 to review, 0 practice sets (b held the
    // only set), so the header pills stay honest.
    expect(data.stats).toEqual({ wordsToReview: 2, practiceSets: 0 });
  });

  it("re-inserts the failed word at its ORIGINAL index on error", async () => {
    const client = makeClient();
    seed(client, [word("a"), word("b"), word("c")]);
    server.use(
      http.delete("/api/saved/:id", () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );

    const { result } = setup(client);
    await act(async () => {
      await result.current.mutateAsync("b").catch(() => {});
    });

    // Restored at index 1 — not the front, not the end — so the grid order the
    // user saw is preserved.
    expect(ids(readCache(client))).toEqual(["a", "b", "c"]);
  });

  it("re-inserts a removed FIRST word back at the front on error", async () => {
    const client = makeClient();
    seed(client, [word("a"), word("b")]);
    server.use(
      http.delete("/api/saved/:id", () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );

    const { result } = setup(client);
    await act(async () => {
      await result.current.mutateAsync("a").catch(() => {});
    });

    expect(ids(readCache(client))).toEqual(["a", "b"]);
  });

  it("is a no-op when the id isn't in the cache (no phantom insert on error)", async () => {
    const client = makeClient();
    seed(client, [word("a"), word("b")]);
    server.use(
      http.delete("/api/saved/:id", () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );

    const { result } = setup(client);
    await act(async () => {
      await result.current.mutateAsync("ghost").catch(() => {});
    });

    // The unknown word was never captured, so error rollback must not invent a
    // row — the list is untouched.
    expect(ids(readCache(client))).toEqual(["a", "b"]);
  });

  it("rolls back the failed word WITHOUT resurrecting a concurrently-removed one", async () => {
    // The documented hazard: a snapshot-restore rollback would bring back a word
    // a parallel remove already deleted. We make "c" succeed immediately and "b"
    // fail late, so b's rollback runs AFTER c is gone — the targeted re-insert
    // must restore only b.
    const client = makeClient();
    seed(client, [word("a"), word("b"), word("c")]);
    server.use(
      http.delete("/api/saved/:id", async ({ params }) => {
        if (params.id === "b") {
          await delay(30);
          return HttpResponse.json({ error: "boom" }, { status: 500 });
        }
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { result } = setup(client);
    await act(async () => {
      const failing = result.current.mutateAsync("b").catch(() => {});
      const succeeding = result.current.mutateAsync("c");
      await Promise.allSettled([failing, succeeding]);
    });

    await waitFor(() => {
      const data = readCache(client);
      // b restored, c stays gone — a naive snapshot restore would yield a,b,c.
      expect(ids(data)).toEqual(["a", "b"]);
    });
  });
});
