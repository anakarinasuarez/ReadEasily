"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Global reading-preferences store — the single source of truth for the five
 * reader settings the Profile screen edits. Persisted to localStorage so a
 * change survives a reload (user decision). App-global on purpose: other
 * features (the Reader next pass) will consume the SAME store, which is why it
 * lives in `src/stores/`, not inside `features/profile/`.
 *
 * SSR-safe hydration (the App Router gotcha):
 *   localStorage does not exist on the server, and zustand's `persist` with a
 *   SYNC storage normally rehydrates during store creation — which on the
 *   client would make the first render use persisted values while the server
 *   rendered defaults, producing a hydration mismatch. We therefore set
 *   `skipHydration: true` so creation ALWAYS starts from `DEFAULT_PREFERENCES`
 *   on both server and client (identical first paint, no mismatch), then
 *   rehydrate explicitly AFTER mount via `useHydratePreferences()`. A
 *   `_hasHydrated` flag (flipped in `onRehydrateStorage`) lets a consumer gate
 *   UI on "persisted values are in" if it wants to avoid the brief default →
 *   persisted snap; the Profile controls don't need to (the snap is invisible
 *   for a fresh user and a one-frame correction otherwise).
 *
 * Writes always persist: `persist` saves on every `set`, hydrated or not, so
 * `setPreference` updates state AND localStorage immediately.
 */

/** The five persisted reading preferences. */
export interface Preferences {
  /** Word-meaning language shown while reading. */
  translationLang: "ES" | "FR" | "PT";
  /** Voice/accent used to narrate stories. */
  readingAccent: "US" | "UK" | "AU" | "CA";
  /** Start reading aloud automatically on open. */
  autoplay: boolean;
  /** Speak each word when the reader taps it. */
  pronounceOnTap: boolean;
  /** Calm down page turns and effects. */
  reduceMotion: boolean;
}

/** Factory defaults — the value contract for a brand-new user. */
export const DEFAULT_PREFERENCES: Preferences = {
  translationLang: "ES",
  readingAccent: "US",
  autoplay: false,
  pronounceOnTap: true,
  reduceMotion: false,
};

interface PreferencesState extends Preferences {
  /** True once the persisted values have been read back in (post-mount). */
  _hasHydrated: boolean;
  /** Generic typed setter — `setPreference("autoplay", true)`. */
  setPreference: <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) => void;
  /** Restore every preference to its factory default (Reset learning data). */
  reset: () => void;
  /** Internal — flipped by `onRehydrateStorage`. */
  setHasHydrated: (value: boolean) => void;
}

/** localStorage key for the persisted slice. */
export const PREFERENCES_STORAGE_KEY = "readeasily-preferences";

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      _hasHydrated: false,
      setPreference: (key, value) =>
        set({ [key]: value } as unknown as Partial<PreferencesState>),
      reset: () => set({ ...DEFAULT_PREFERENCES }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Never auto-rehydrate at creation — see the SSR note above.
      skipHydration: true,
      // Persist ONLY the preference values; never the hydration flag/methods.
      partialize: (state): Preferences => ({
        translationLang: state.translationLang,
        readingAccent: state.readingAccent,
        autoplay: state.autoplay,
        pronounceOnTap: state.pronounceOnTap,
        reduceMotion: state.reduceMotion,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/**
 * Mount-time rehydration. Call once from a client component that needs the
 * persisted values (e.g. the Profile screen): the effect runs after the first
 * paint, so the server/client first render stays identical (defaults) and the
 * persisted values flow in immediately afterwards. Idempotent — calling
 * `rehydrate()` again is harmless.
 */
export function useHydratePreferences(): void {
  useEffect(() => {
    void usePreferences.persist.rehydrate();
  }, []);
}

/** Selector hook — true once persisted values have loaded. */
export function useHasHydratedPreferences(): boolean {
  return usePreferences((state) => state._hasHydrated);
}
