import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "../../../../tests/mocks/server";
import { useSavePractice, type SavePracticeInput } from "../hooks/useSavePractice";
import { savedQueryKey } from "@/features/saved/api/getSaved";
import {
  deriveSavedStats,
  type SavedData,
  type SavedWord,
} from "@/features/saved/types";

/**
 * Behavior tests for "Save to practice later". Its hardest logic is choosing the
 * write — PATCH an existing REAL saved row vs POST a brand-new one — from the
 * shared cache, while its own `onMutate` has already written an optimistic row.
 * The trap it must avoid: a never-saved word "finding itself" as its optimistic
 * placeholder and PATCHing `/api/saved/optimistic-…` (a guaranteed 404). The
 * overlay test asserts the happy paths' server effect; here we pin the routing
 * decision and the rollback at the seam, by recording which request actually
 * fired and asserting the resulting cache.
 */

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function savedWord(
  id: string,
  word: string,
  sentencesReady = 0,
): SavedWord {
  return {
    id,
    word,
    translation: `t-${word}`,
    sourceStoryId: "s",
    sourceStoryTitle: "Story",
    sentencesReady,
    savedAt: "2026-06-22T10:00:00.000Z",
  };
}

function input(word: string, sentencesReady = 10): SavePracticeInput {
  return {
    word,
    translation: `t-${word}`,
    sourceStoryId: "s",
    sourceStoryTitle: "Story",
    sentencesReady,
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
  return renderHook(() => useSavePractice(), { wrapper: Wrapper });
}

/** Record the write requests so the PATCH-vs-POST decision is observable. */
function recordWrites(opts: { fail?: boolean } = {}) {
  const calls: { method: "POST" | "PATCH"; id?: string }[] = [];
  server.use(
    http.post("/api/saved", async ({ request }) => {
      calls.push({ method: "POST" });
      if (opts.fail) return HttpResponse.json({ error: "boom" }, { status: 500 });
      const body = (await request.json()) as SavedWord;
      return HttpResponse.json({ ...body, id: "server-new" }, { status: 201 });
    }),
    http.patch("/api/saved/:id", async ({ params, request }) => {
      calls.push({ method: "PATCH", id: String(params.id) });
      if (opts.fail) return HttpResponse.json({ error: "boom" }, { status: 500 });
      const body = (await request.json()) as { sentencesReady: number };
      return HttpResponse.json(
        savedWord(String(params.id), "X", body.sentencesReady),
        { status: 200 },
      );
    }),
  );
  return calls;
}

describe("useSavePractice", () => {
  it("POSTs a brand-new word (never PATCHing its own optimistic placeholder)", async () => {
    const client = makeClient();
    seed(client, [savedWord("a", "Apple")]);
    const calls = recordWrites();

    const { result } = setup(client);
    await act(async () => {
      await result.current.mutateAsync(input("Robot", 10));
    });

    // The decisive assertion: a POST, and NOT a PATCH to an `optimistic-` id.
    expect(calls).toEqual([{ method: "POST" }]);
    // The optimistic row carries the practice count, so the Saved card shows
    // "Review" immediately.
    const robot = readWords(client).find((w) => w.word === "Robot");
    expect(robot?.sentencesReady).toBe(10);
  });

  it("PATCHes an already-saved REAL row instead of creating a duplicate", async () => {
    const client = makeClient();
    seed(client, [savedWord("robot", "Robot", 0), savedWord("a", "Apple")]);
    const calls = recordWrites();

    const { result } = setup(client);
    await act(async () => {
      // Case-insensitive match to the saved "Robot".
      await result.current.mutateAsync(input("robot", 10));
    });

    // PATCH to the real id — no second POST, no duplicate row.
    expect(calls).toEqual([{ method: "PATCH", id: "robot" }]);
    const words = readWords(client);
    expect(words.filter((w) => w.word.toLowerCase() === "robot")).toHaveLength(1);
    expect(words.find((w) => w.id === "robot")?.sentencesReady).toBe(10);
  });

  it("rolls back to the previous snapshot when the write fails", async () => {
    const client = makeClient();
    seed(client, [savedWord("robot", "Robot", 0)]);
    recordWrites({ fail: true });

    const { result } = setup(client);
    await act(async () => {
      await result.current.mutateAsync(input("robot", 10)).catch(() => {});
    });

    // The optimistic bump (0 → 10) is reverted exactly to the prior cache.
    const words = readWords(client);
    expect(words).toHaveLength(1);
    expect(words[0].sentencesReady).toBe(0);
  });

  it("removes the optimistic NEW row on a failed create", async () => {
    const client = makeClient();
    seed(client, [savedWord("a", "Apple")]);
    recordWrites({ fail: true });

    const { result } = setup(client);
    await act(async () => {
      await result.current.mutateAsync(input("Robot", 10)).catch(() => {});
    });

    // Rollback restores just the pre-existing list — the placeholder is gone.
    expect(readWords(client).map((w) => w.word)).toEqual(["Apple"]);
  });
});
