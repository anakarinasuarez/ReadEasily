import { describe, it, expect, beforeEach } from "vitest";
import {
  useProfileAvatar,
  PROFILE_AVATAR_STORAGE_KEY,
} from "../profileAvatar";

/**
 * Store behavior tests — the persisted avatar is local-only state, so it gets
 * tested directly (not only through the screen). We assert the default (null),
 * that setAvatar updates state AND writes through to localStorage, that
 * clearAvatar resets to null, that the persisted slice carries ONLY the value,
 * and that a fresh rehydrate reads the persisted slice back over a fresh null.
 */

const DATA_URL = "data:image/jpeg;base64,SGVsbG8=";

/** Read the persisted slice straight out of localStorage. */
function readPersisted() {
  const raw = localStorage.getItem(PROFILE_AVATAR_STORAGE_KEY);
  return raw ? JSON.parse(raw).state : null;
}

beforeEach(() => {
  // Each test starts from a clean slate: null state + empty storage.
  localStorage.clear();
  useProfileAvatar.setState({ avatarDataUrl: null, _hasHydrated: false });
});

describe("profileAvatar store — defaults", () => {
  it("starts with no avatar override", () => {
    expect(useProfileAvatar.getState().avatarDataUrl).toBeNull();
  });
});

describe("profileAvatar store — setAvatar", () => {
  it("updates state with the new data URL", () => {
    useProfileAvatar.getState().setAvatar(DATA_URL);
    expect(useProfileAvatar.getState().avatarDataUrl).toBe(DATA_URL);
  });

  it("writes the change through to localStorage", () => {
    useProfileAvatar.getState().setAvatar(DATA_URL);
    expect(readPersisted()?.avatarDataUrl).toBe(DATA_URL);
  });

  it("persists ONLY the avatar value, never the hydration flag/methods", () => {
    useProfileAvatar.getState().setAvatar(DATA_URL);
    const persisted = readPersisted();
    expect(persisted).toHaveProperty("avatarDataUrl", DATA_URL);
    expect(persisted).not.toHaveProperty("_hasHydrated");
    expect(persisted).not.toHaveProperty("setAvatar");
  });
});

describe("profileAvatar store — clearAvatar", () => {
  it("resets the override back to null and persists the clear", () => {
    useProfileAvatar.getState().setAvatar(DATA_URL);
    expect(useProfileAvatar.getState().avatarDataUrl).toBe(DATA_URL);

    useProfileAvatar.getState().clearAvatar();
    expect(useProfileAvatar.getState().avatarDataUrl).toBeNull();
    expect(readPersisted()?.avatarDataUrl).toBeNull();
  });
});

describe("profileAvatar store — hydration survives a reload", () => {
  it("rehydrate() reads the persisted value back over fresh null", async () => {
    // Simulate a PRIOR session's persisted slice sitting in localStorage while
    // the in-memory store is still at null (as right after a fresh page load,
    // before mount-time rehydration runs). Writing storage directly — rather
    // than via setAvatar — avoids the persist middleware re-writing null when we
    // reset the in-memory state.
    localStorage.setItem(
      PROFILE_AVATAR_STORAGE_KEY,
      JSON.stringify({ state: { avatarDataUrl: DATA_URL }, version: 0 }),
    );
    expect(useProfileAvatar.getState().avatarDataUrl).toBeNull();
    expect(useProfileAvatar.getState()._hasHydrated).toBe(false);

    await useProfileAvatar.persist.rehydrate();

    const s = useProfileAvatar.getState();
    expect(s.avatarDataUrl).toBe(DATA_URL);
    expect(s._hasHydrated).toBe(true);
  });
});
