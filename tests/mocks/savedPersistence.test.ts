import { afterEach, describe, expect, it } from "vitest";
import { __setSavedStorageForTest, resetSavedWords } from "./handlers";
import { getSaved, removeSavedWord } from "@/features/saved/api/getSaved";

/**
 * BUG-3 regression: the MSW saved mock persists removals/saves to localStorage in
 * a real browser, so a deleted card does NOT reappear after a full page reload.
 *
 * Under the unit runner persistence is OFF by default (NODE_ENV === "test"), which
 * is what keeps every other Saved test isolated. These tests assert BOTH halves:
 *  1. with a forced storage, a delete survives a simulated reload (the fix);
 *  2. with the default gate, a delete does NOT survive a reseed (isolation holds).
 *
 * The forced storage is a STANDALONE in-memory Storage (not jsdom's shared
 * localStorage) and the override is cleared in `afterEach`, so this file cannot
 * leak persisted state into any other test.
 */

/** A self-contained in-memory Storage, independent of jsdom's localStorage. */
function makeMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => (map.has(key) ? (map.get(key) as string) : null),
    key: (index) => Array.from(map.keys())[index] ?? null,
    removeItem: (key) => {
      map.delete(key);
    },
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe("saved mock persistence", () => {
  afterEach(() => {
    // Restore the default browser-only gate + reseed so isolation is preserved.
    __setSavedStorageForTest(undefined);
    resetSavedWords();
  });

  it("keeps a removed word gone across a simulated reload when persistence is on", async () => {
    __setSavedStorageForTest(makeMemoryStorage());
    resetSavedWords(); // fresh "load": storage empty → falls back to the seed

    const before = await getSaved();
    expect(before.words.some((w) => w.id === "path")).toBe(true);

    await removeSavedWord("path"); // the handler persists the reduced list

    // Simulate a full page reload: the module re-seeds from the persisted list.
    resetSavedWords();

    const after = await getSaved();
    expect(after.words.some((w) => w.id === "path")).toBe(false);
    expect(after.words).toHaveLength(before.words.length - 1);
  });

  it("does NOT persist under the default test gate, so reseed restores the word", async () => {
    await removeSavedWord("path");
    resetSavedWords(); // no active storage → seed is restored intact

    const after = await getSaved();
    expect(after.words.some((w) => w.id === "path")).toBe(true);
  });
});
