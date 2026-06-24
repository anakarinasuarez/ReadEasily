import { describe, it, expect, beforeEach } from "vitest";
import {
  usePreferences,
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
} from "./preferences";

/**
 * Store behavior tests — the persisted preferences are the feature's value
 * contract, so they get tested directly (not only through the screen). We
 * assert three things: the factory defaults, that a setter writes BOTH state
 * and localStorage, and that a fresh rehydrate reads the persisted slice back.
 */

/** Read the persisted preference slice straight out of localStorage. */
function readPersisted() {
  const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
  return raw ? JSON.parse(raw).state : null;
}

beforeEach(() => {
  // Each test starts from a clean slate: factory state + empty storage.
  localStorage.clear();
  usePreferences.setState({ ...DEFAULT_PREFERENCES, _hasHydrated: false });
});

describe("preferences store — defaults", () => {
  it("starts at the documented factory defaults", () => {
    const s = usePreferences.getState();
    expect(s.translationLang).toBe("ES");
    expect(s.readingAccent).toBe("US");
    expect(s.autoplay).toBe(false);
    expect(s.pronounceOnTap).toBe(true);
    expect(s.reduceMotion).toBe(false);
  });
});

describe("preferences store — setPreference persists", () => {
  it("updates state for each preference", () => {
    const { setPreference } = usePreferences.getState();
    setPreference("translationLang", "FR");
    setPreference("readingAccent", "UK");
    setPreference("autoplay", true);
    setPreference("pronounceOnTap", false);
    setPreference("reduceMotion", true);

    const s = usePreferences.getState();
    expect(s.translationLang).toBe("FR");
    expect(s.readingAccent).toBe("UK");
    expect(s.autoplay).toBe(true);
    expect(s.pronounceOnTap).toBe(false);
    expect(s.reduceMotion).toBe(true);
  });

  it("writes the change through to localStorage", () => {
    usePreferences.getState().setPreference("translationLang", "PT");
    expect(readPersisted()?.translationLang).toBe("PT");

    usePreferences.getState().setPreference("autoplay", true);
    expect(readPersisted()?.autoplay).toBe(true);
  });

  it("persists ONLY the preference values, never the hydration flag", () => {
    usePreferences.getState().setPreference("reduceMotion", true);
    const persisted = readPersisted();
    expect(persisted).toHaveProperty("reduceMotion", true);
    expect(persisted).not.toHaveProperty("_hasHydrated");
    expect(persisted).not.toHaveProperty("setPreference");
  });
});

describe("preferences store — reset", () => {
  it("restores every preference to its default", () => {
    const { setPreference, reset } = usePreferences.getState();
    setPreference("autoplay", true);
    setPreference("translationLang", "FR");
    reset();

    const s = usePreferences.getState();
    expect(s.autoplay).toBe(false);
    expect(s.translationLang).toBe("ES");
  });
});

describe("preferences store — hydration survives a reload", () => {
  it("rehydrate() reads the persisted slice back over fresh defaults", async () => {
    // Simulate a PRIOR session's persisted slice sitting in localStorage, while
    // the in-memory store is still at factory defaults (as it is right after a
    // fresh page load, before mount-time rehydration runs). Writing storage
    // directly — rather than via setPreference — avoids the persist middleware
    // re-writing defaults when we reset the in-memory state.
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        state: {
          translationLang: "FR",
          readingAccent: "US",
          autoplay: true,
          pronounceOnTap: true,
          reduceMotion: false,
        },
        version: 0,
      }),
    );
    expect(usePreferences.getState().translationLang).toBe("ES");
    expect(usePreferences.getState()._hasHydrated).toBe(false);

    // Mount-time rehydration pulls the persisted values back in.
    await usePreferences.persist.rehydrate();

    const s = usePreferences.getState();
    expect(s.translationLang).toBe("FR");
    expect(s.autoplay).toBe(true);
    expect(s._hasHydrated).toBe(true);
  });
});
