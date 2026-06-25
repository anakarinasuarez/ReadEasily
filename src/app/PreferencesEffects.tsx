"use client";

import { useEffect } from "react";
import {
  usePreferences,
  useHydratePreferences,
} from "@/stores/preferences";

/**
 * PreferencesEffects — app-root side effects for the global preferences store.
 * Renders nothing; mounted once inside the client providers so the persisted
 * preferences are live before any feature (Reader, Profile) reads them.
 *
 * Two responsibilities:
 *  1. **Hydrate once.** `useHydratePreferences()` runs the post-mount rehydrate
 *     so localStorage values flow in after the first paint (SSR-safe — the
 *     server and the first client render both use defaults, see the store).
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
