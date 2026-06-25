"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Profile-overrides store — the single source of truth for the user's LOCAL
 * profile overrides: a custom avatar AND a custom display name. The Profile
 * screen lets a user pick a local image for their photo (downscaled to a small
 * data URL, see ProfileHeader) and rename themselves inline; we keep both here,
 * persisted to localStorage so they survive a reload. This is deliberately
 * LOCAL-ONLY: there is no profile-edit backend yet, the values never leave the
 * device.
 *
 * Lives in `src/stores/` (not inside `features/profile/`) to match the
 * `usePreferences` precedent: it's a device-local, app-global slice that other
 * surfaces (the cross-screen navbar avatar + name, via `useNavbarUser`) read the
 * SAME way.
 *
 * SSR-safe hydration — identical to `usePreferences` (see that store for the
 * full rationale): `skipHydration: true` so creation ALWAYS starts from the
 * null defaults on both server and client (identical first paint, no mismatch),
 * then `useHydrateProfileOverrides()` rehydrates explicitly AFTER mount.
 * `_hasHydrated` (flipped in `onRehydrateStorage`) lets a consumer gate on
 * "persisted values are in". Writes always persist: `persist` saves on every
 * `set`.
 */

interface ProfileOverridesState {
  /** The user's locally-picked avatar as a downscaled data URL, or null. */
  avatarDataUrl: string | null;
  /** The user's locally-set display name, or null to fall back to the server name. */
  displayName: string | null;
  /** True once the persisted values have been read back in (post-mount). */
  _hasHydrated: boolean;
  /** Set the avatar to a new data URL (persists immediately). */
  setAvatar: (dataUrl: string) => void;
  /** Clear the local avatar override, falling back to the server avatar/initials. */
  clearAvatar: () => void;
  /**
   * Set the display-name override. Empty / whitespace-only collapses to `null`
   * (= clear the override, fall back to the server name), so callers can pass a
   * raw input value or "" to clear without special-casing.
   */
  setDisplayName: (name: string | null) => void;
  /** Internal — flipped by `onRehydrateStorage`. */
  setHasHydrated: (value: boolean) => void;
}

/** localStorage key for the persisted slice. */
export const PROFILE_OVERRIDES_STORAGE_KEY = "readeasily-profile-overrides";

export const useProfileOverrides = create<ProfileOverridesState>()(
  persist(
    (set) => ({
      avatarDataUrl: null,
      displayName: null,
      _hasHydrated: false,
      setAvatar: (dataUrl) => set({ avatarDataUrl: dataUrl }),
      clearAvatar: () => set({ avatarDataUrl: null }),
      setDisplayName: (name) => {
        const trimmed = name?.trim();
        set({ displayName: trimmed ? trimmed : null });
      },
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: PROFILE_OVERRIDES_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Never auto-rehydrate at creation — see the SSR note above.
      skipHydration: true,
      // Persist ONLY the override values; never the hydration flag/methods.
      partialize: (
        state,
      ): Pick<ProfileOverridesState, "avatarDataUrl" | "displayName"> => ({
        avatarDataUrl: state.avatarDataUrl,
        displayName: state.displayName,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/**
 * Mount-time rehydration. Call once from a client component that needs the
 * persisted overrides (the root effects component + the Profile screen): the
 * effect runs after first paint, so the server/client first render stays
 * identical (null) and the persisted values flow in immediately afterwards.
 * Idempotent — calling `rehydrate()` again is harmless.
 */
export function useHydrateProfileOverrides(): void {
  useEffect(() => {
    void useProfileOverrides.persist.rehydrate();
  }, []);
}

/** Selector hook — true once the persisted overrides have loaded. */
export function useHasHydratedProfileOverrides(): boolean {
  return useProfileOverrides((state) => state._hasHydrated);
}
