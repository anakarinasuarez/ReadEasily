"use client";

import { useProfileOverrides } from "@/stores/profileOverrides";
import type { NavbarUser } from "./Navbar";

/**
 * useNavbarUser — overlays the device-local profile overrides (avatar + display
 * name, from `useProfileOverrides`) onto a screen's BASE navbar user. Every
 * screen that renders the `<Navbar>` runs its base user through this hook so a
 * name/photo the user set on the Profile screen reflects in the account
 * affordance everywhere, without each screen reaching into the store itself.
 *
 * Both overrides default to null (the store is SSR-safe, `skipHydration`), so on
 * first paint / a fresh user this returns the base values unchanged — existing
 * screens behave exactly as before until an override exists.
 */
export function useNavbarUser(base: NavbarUser): NavbarUser {
  const avatarDataUrl = useProfileOverrides((s) => s.avatarDataUrl);
  const displayName = useProfileOverrides((s) => s.displayName);
  return {
    name: displayName ?? base.name,
    avatarSrc: avatarDataUrl ?? base.avatarSrc,
  };
}
