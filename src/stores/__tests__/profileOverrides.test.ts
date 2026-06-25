import { describe, it, expect, beforeEach } from "vitest";
import {
  useProfileOverrides,
  PROFILE_OVERRIDES_STORAGE_KEY,
} from "../profileOverrides";

/**
 * Store behavior tests — the persisted profile overrides are local-only state,
 * so they get tested directly (not only through the screen). We assert the
 * defaults (both null), that setAvatar updates state AND writes through to
 * localStorage, that clearAvatar resets to null, that setDisplayName trims and
 * collapses empties to null, that the persisted slice carries ONLY the values,
 * and that a fresh rehydrate reads the persisted slice back over fresh nulls.
 */

const DATA_URL = "data:image/jpeg;base64,SGVsbG8=";

/** Read the persisted slice straight out of localStorage. */
function readPersisted() {
  const raw = localStorage.getItem(PROFILE_OVERRIDES_STORAGE_KEY);
  return raw ? JSON.parse(raw).state : null;
}

beforeEach(() => {
  // Each test starts from a clean slate: null state + empty storage.
  localStorage.clear();
  useProfileOverrides.setState({
    avatarDataUrl: null,
    displayName: null,
    _hasHydrated: false,
  });
});

describe("profileOverrides store — defaults", () => {
  it("starts with no avatar and no name override", () => {
    expect(useProfileOverrides.getState().avatarDataUrl).toBeNull();
    expect(useProfileOverrides.getState().displayName).toBeNull();
  });
});

describe("profileOverrides store — setAvatar", () => {
  it("updates state with the new data URL", () => {
    useProfileOverrides.getState().setAvatar(DATA_URL);
    expect(useProfileOverrides.getState().avatarDataUrl).toBe(DATA_URL);
  });

  it("writes the change through to localStorage", () => {
    useProfileOverrides.getState().setAvatar(DATA_URL);
    expect(readPersisted()?.avatarDataUrl).toBe(DATA_URL);
  });

  it("persists ONLY the override values, never the hydration flag/methods", () => {
    useProfileOverrides.getState().setAvatar(DATA_URL);
    const persisted = readPersisted();
    expect(persisted).toHaveProperty("avatarDataUrl", DATA_URL);
    expect(persisted).toHaveProperty("displayName", null);
    expect(persisted).not.toHaveProperty("_hasHydrated");
    expect(persisted).not.toHaveProperty("setAvatar");
  });
});

describe("profileOverrides store — clearAvatar", () => {
  it("resets the avatar back to null and persists the clear", () => {
    useProfileOverrides.getState().setAvatar(DATA_URL);
    expect(useProfileOverrides.getState().avatarDataUrl).toBe(DATA_URL);

    useProfileOverrides.getState().clearAvatar();
    expect(useProfileOverrides.getState().avatarDataUrl).toBeNull();
    expect(readPersisted()?.avatarDataUrl).toBeNull();
  });
});

describe("profileOverrides store — setDisplayName", () => {
  it("stores a non-empty name and persists it", () => {
    useProfileOverrides.getState().setDisplayName("Ana Lopez");
    expect(useProfileOverrides.getState().displayName).toBe("Ana Lopez");
    expect(readPersisted()?.displayName).toBe("Ana Lopez");
  });

  it("trims surrounding whitespace before storing", () => {
    useProfileOverrides.getState().setDisplayName("  Ana Lopez  ");
    expect(useProfileOverrides.getState().displayName).toBe("Ana Lopez");
  });

  it("collapses an empty string to null (fall back to server name)", () => {
    useProfileOverrides.getState().setDisplayName("Ana");
    useProfileOverrides.getState().setDisplayName("");
    expect(useProfileOverrides.getState().displayName).toBeNull();
  });

  it("collapses a whitespace-only string to null", () => {
    useProfileOverrides.getState().setDisplayName("Ana");
    useProfileOverrides.getState().setDisplayName("   ");
    expect(useProfileOverrides.getState().displayName).toBeNull();
  });

  it("collapses an explicit null to null", () => {
    useProfileOverrides.getState().setDisplayName("Ana");
    useProfileOverrides.getState().setDisplayName(null);
    expect(useProfileOverrides.getState().displayName).toBeNull();
  });
});

describe("profileOverrides store — hydration survives a reload", () => {
  it("rehydrate() reads the persisted values back over fresh nulls", async () => {
    // Simulate a PRIOR session's persisted slice sitting in localStorage while
    // the in-memory store is still at null (as right after a fresh page load,
    // before mount-time rehydration runs). Writing storage directly — rather
    // than via the setters — avoids the persist middleware re-writing null when
    // we reset the in-memory state.
    localStorage.setItem(
      PROFILE_OVERRIDES_STORAGE_KEY,
      JSON.stringify({
        state: { avatarDataUrl: DATA_URL, displayName: "Ana Lopez" },
        version: 0,
      }),
    );
    expect(useProfileOverrides.getState().avatarDataUrl).toBeNull();
    expect(useProfileOverrides.getState().displayName).toBeNull();
    expect(useProfileOverrides.getState()._hasHydrated).toBe(false);

    await useProfileOverrides.persist.rehydrate();

    const s = useProfileOverrides.getState();
    expect(s.avatarDataUrl).toBe(DATA_URL);
    expect(s.displayName).toBe("Ana Lopez");
    expect(s._hasHydrated).toBe(true);
  });
});
