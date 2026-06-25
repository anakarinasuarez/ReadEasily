"use client";

import { useEffect } from "react";
import {
  usePreferences,
  useHydratePreferences,
} from "@/stores/preferences";
import { useHydrateProfileOverrides } from "@/stores/profileOverrides";

/**
 * PreferencesEffects — app-root side effects for the global device-local stores.
 * Renders nothing; mounted once inside the client providers so the persisted
 * preferences AND profile overrides are live before any feature (Reader,
 * Profile, every screen's navbar) reads them.
 *
 * Responsibilities:
 *  1. **Hydrate once.** `useHydratePreferences()` + `useHydrateProfileOverrides()`
 *     run the post-mount rehydrate so localStorage values flow in after the
 *     first paint (SSR-safe — the server and the first client render both use
 *     defaults, see the stores). The Profile screen also calls the overrides
 *     hydrate; it is idempotent.
 *  2. **Reflect `reduceMotion` app-wide.** It writes `data-reduce-motion="true"`
 *     onto `<html>` when the in-app toggle is on (removes the attr when off). A
 *     global CSS rule keyed on that attribute applies the standard reduced-motion
 *     reset, so the in-app toggle calms motion exactly as the OS
 *     `prefers-reduced-motion` setting would — the two pair, they don't replace
 *     each other. The attribute is set in a post-mount effect (never during
 *     render), so it can't cause a hydration mismatch.
 */
export function PreferencesEffects() {
  useHydratePreferences();
  useHydrateProfileOverrides();
  const reduceMotion = usePreferences((s) => s.reduceMotion);

  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) {
      root.setAttribute("data-reduce-motion", "true");
    } else {
      root.removeAttribute("data-reduce-motion");
    }
  }, [reduceMotion]);

  return null;
}
