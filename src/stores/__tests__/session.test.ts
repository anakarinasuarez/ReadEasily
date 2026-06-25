import { describe, it, expect, beforeEach } from "vitest";
import {
  useSession,
  SESSION_STORAGE_KEY,
  type SessionUser,
} from "../session";

/**
 * Session store behavior tests — the persisted session is local-only state in a
 * guest-friendly model, so it gets tested directly. We assert the default
 * (null = guest, not authenticated), that signIn sets the user (and that the
 * derived authenticated check flips), that signOut clears back to guest, that
 * writes pass through to localStorage carrying ONLY the user, and that a fresh
 * rehydrate reads the persisted session back over a fresh null.
 */

const USER: SessionUser = { name: "Ana Lopez", email: "ana.lopez@x.com" };

/** Read the persisted slice straight out of localStorage. */
function readPersisted() {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  return raw ? JSON.parse(raw).state : null;
}

beforeEach(() => {
  // Each test starts from a clean slate: guest state + empty storage.
  localStorage.clear();
  useSession.setState({ user: null, _hasHydrated: false });
});

describe("session store — defaults", () => {
  it("starts as a guest with no user", () => {
    expect(useSession.getState().user).toBeNull();
  });

  it("is not authenticated when there is no user", () => {
    expect(useSession.getState().user !== null).toBe(false);
  });
});

describe("session store — signIn", () => {
  it("sets the user", () => {
    useSession.getState().signIn(USER);
    expect(useSession.getState().user).toEqual(USER);
  });

  it("makes the session authenticated", () => {
    useSession.getState().signIn(USER);
    expect(useSession.getState().user !== null).toBe(true);
  });

  it("writes the user through to localStorage", () => {
    useSession.getState().signIn(USER);
    expect(readPersisted()?.user).toEqual(USER);
  });

  it("persists ONLY the user, never the hydration flag/methods", () => {
    useSession.getState().signIn(USER);
    const persisted = readPersisted();
    expect(persisted).toHaveProperty("user");
    expect(persisted).not.toHaveProperty("_hasHydrated");
    expect(persisted).not.toHaveProperty("signIn");
    expect(persisted).not.toHaveProperty("signOut");
  });
});

describe("session store — signOut", () => {
  it("clears the user back to guest and persists the clear", () => {
    useSession.getState().signIn(USER);
    expect(useSession.getState().user).toEqual(USER);

    useSession.getState().signOut();
    expect(useSession.getState().user).toBeNull();
    expect(useSession.getState().user !== null).toBe(false);
    expect(readPersisted()?.user).toBeNull();
  });
});

describe("session store — hydration survives a reload", () => {
  it("rehydrate() reads the persisted user back over a fresh null", async () => {
    // Simulate a PRIOR session's persisted slice sitting in localStorage while
    // the in-memory store is still null (as right after a fresh page load,
    // before mount-time rehydration runs). Writing storage directly avoids the
    // persist middleware re-writing null when we reset the in-memory state.
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ state: { user: USER }, version: 0 }),
    );
    expect(useSession.getState().user).toBeNull();
    expect(useSession.getState()._hasHydrated).toBe(false);

    await useSession.persist.rehydrate();

    const s = useSession.getState();
    expect(s.user).toEqual(USER);
    expect(s._hasHydrated).toBe(true);
  });
});
