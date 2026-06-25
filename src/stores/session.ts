"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Session store — the single source of truth for "who is signed in", in a
 * deliberately GUEST-FRIENDLY auth model: reading needs no account, auth is
 * optional, and there is NO route guard. A null `user` simply means "browsing
 * as a guest"; consumers light up sign-in affordances off that, they never
 * block.
 *
 * This store owns only LOCAL session state — the identity we keep on the
 * device. The actual sign-up / sign-in / reset network calls live in the
 * AuthClient (`src/features/auth/api/authClient.ts`); a screen calls the client,
 * then on success calls `signIn(user)` here. The store stays ignorant of
 * passwords on purpose — we never hold or persist a credential.
 *
 * Lives in `src/stores/` (alongside `usePreferences` / `useProfileOverrides`)
 * because session is an app-global, device-local slice many surfaces read the
 * same way (navbar, profile, future sync), not something owned by one feature.
 *
 * SSR-safe hydration — identical to `usePreferences` / `useProfileOverrides`
 * (see those stores for the full rationale): `skipHydration: true` so creation
 * ALWAYS starts from the null default on both server and client (identical
 * first paint, no mismatch), then `useHydrateSession()` rehydrates explicitly
 * AFTER mount. `_hasHydrated` (flipped in `onRehydrateStorage`) lets a consumer
 * gate on "persisted session is in" before, say, flashing a Sign-in button at a
 * user who is actually signed in. Writes always persist: `persist` saves on
 * every `set`.
 */

/** The persisted identity of a signed-in user. Never holds credentials. */
export interface SessionUser {
  /** Display name (derived from the email local part by the mock client). */
  name: string;
  /** Email the user signed in / signed up with. */
  email: string;
}

interface SessionState {
  /** The signed-in user, or null when browsing as a guest. */
  user: SessionUser | null;
  /** True once the persisted session has been read back in (post-mount). */
  _hasHydrated: boolean;
  /**
   * Set the signed-in user. The LOCAL state mutation only — the network/mock
   * call happens in the AuthClient first; on success the screen calls this.
   */
  signIn: (user: SessionUser) => void;
  /** Clear the session back to guest. */
  signOut: () => void;
  /** Internal — flipped by `onRehydrateStorage`. */
  setHasHydrated: (value: boolean) => void;
}

/** localStorage key for the persisted slice. */
export const SESSION_STORAGE_KEY = "readeasily-session";

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Never auto-rehydrate at creation — see the SSR note above.
      skipHydration: true,
      // Persist ONLY the user; never the hydration flag/methods.
      partialize: (state): Pick<SessionState, "user"> => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/**
 * Mount-time rehydration. Call once from a client component that needs the
 * persisted session (the root effects component): the effect runs after first
 * paint, so the server/client first render stays identical (null = guest) and
 * the persisted user flows in immediately afterwards. Idempotent — calling
 * `rehydrate()` again is harmless.
 */
export function useHydrateSession(): void {
  useEffect(() => {
    void useSession.persist.rehydrate();
  }, []);
}

/** Selector hook — true once the persisted session has loaded. */
export function useHasHydratedSession(): boolean {
  return useSession((state) => state._hasHydrated);
}

/**
 * Selector hook — true when a user is signed in. Derived from `user`, never a
 * stored boolean, so it can't drift out of sync with the session.
 */
export function useIsAuthenticated(): boolean {
  return useSession((state) => state.user !== null);
}
