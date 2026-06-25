import { describe, it, expect, beforeEach } from "vitest";
import { act, render } from "@testing-library/react";
import {
  usePreferences,
  DEFAULT_PREFERENCES,
} from "@/stores/preferences";
import { PreferencesEffects } from "./PreferencesEffects";

/**
 * PreferencesEffects — the app-root effect that reflects the in-app "Reduce
 * motion" preference onto <html data-reduce-motion="true">. The global CSS reset
 * keyed on that attribute is what actually calms motion app-wide; here we assert
 * the attribute contract (set when on, removed when off, absent by default —
 * which keeps SSR/first-render clean since it's written post-mount).
 */
beforeEach(() => {
  localStorage.clear();
  usePreferences.setState({ ...DEFAULT_PREFERENCES, _hasHydrated: false });
  document.documentElement.removeAttribute("data-reduce-motion");
});

describe("PreferencesEffects", () => {
  it("toggles html[data-reduce-motion] with store.reduceMotion", () => {
    render(<PreferencesEffects />);

    // Default off → the attribute is absent (no motion reset).
    expect(
      document.documentElement.hasAttribute("data-reduce-motion"),
    ).toBe(false);

    act(() => usePreferences.getState().setPreference("reduceMotion", true));
    expect(
      document.documentElement.getAttribute("data-reduce-motion"),
    ).toBe("true");

    act(() => usePreferences.getState().setPreference("reduceMotion", false));
    expect(
      document.documentElement.hasAttribute("data-reduce-motion"),
    ).toBe(false);
  });
});
