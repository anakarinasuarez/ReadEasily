"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Profile-avatar store — the single source of truth for the user's LOCAL avatar
 * override. The Profile screen lets a user pick a local image for their photo;
 * we downscale it to a small data URL (see ProfileHeader) and keep it here,
 * persisted to localStorage so it survives a reload. This is deliberately
 * LOCAL-ONLY: there is no avatar backend yet, the bytes never leave the device.
 *
 * Lives in `src/stores/` (not inside `features/profile/`) to match the
 * `usePreferences` precedent: it's a device-local, app-global slice that other
 * surfaces (the cross-screen navbar avatar, a deliberate follow-up) will read
 * the SAME way.
 *
 * SSR-safe hydration — identical to `usePreferences` (see that store for the
 * full rationale): `skipHydration: true` so creation ALWAYS starts from `null`
 * on both server and client (identical first paint, no mismatch), then
 * `useHydrateProfileAvatar()` rehydrates explicitly AFTER mount. `_hasHydrated`
 * (flipped in `onRehydrateStorage`) lets a consumer gate on "persisted value is
 * in". Writes always persist: `persist` saves on every `set`.
 */

interface ProfileAvatarState {
  /** The user's locally-picked avatar as a downscaled data URL, or null. */
  avatarDataUrl: string | null;
  /** True once the persisted value has been read back in (post-mount). */
  _hasHydrated: boolean;
  /** Set the avatar to a new data URL (persists immediately). */
  setAvatar: (dataUrl: string) => void;
  /** Clear the local override, falling back to the server avatar/initials. */
  clearAvatar: () => void;
  /** Internal — flipped by `onRehydrateStorage`. */
  setHasHydrated: (value: boolean) => void;
}

/** localStorage key for the persisted slice. */
export const PROFILE_AVATAR_STORAGE_KEY = "readeasily-profile-avatar";

export const useProfileAvatar = create<ProfileAvatarState>()(
  persist(
    (set) => ({
      avatarDataUrl: null,
      _hasHydrated: false,
      setAvatar: (dataUrl) => set({ avatarDataUrl: dataUrl }),
      clearAvatar: () => set({ avatarDataUrl: null }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: PROFILE_AVATAR_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Never auto-rehydrate at creation — see the SSR note above.
      skipHydration: true,
      // Persist ONLY the avatar value; never the hydration flag/methods.
      partialize: (state): Pick<ProfileAvatarState, "avatarDataUrl"> => ({
        avatarDataUrl: state.avatarDataUrl,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/**
 * Mount-time rehydration. Call once from a client component that needs the
 * persisted avatar (the Profile screen): the effect runs after first paint, so
 * the server/client first render stays identical (null) and the persisted value
 * flows in immediately afterwards. Idempotent — calling `rehydrate()` again is
 * harmless.
 */
export function useHydrateProfileAvatar(): void {
  useEffect(() => {
    void useProfileAvatar.persist.rehydrate();
  }, []);
}

/** Selector hook — true once the persisted avatar has loaded. */
export function useHasHydratedProfileAvatar(): boolean {
  return useProfileAvatar((state) => state._hasHydrated);
}
