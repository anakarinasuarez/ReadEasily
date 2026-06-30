"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { NavbarAccount, NavbarUser } from "@/components/navbar";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { authClient } from "@/features/auth/api/authClient";
import { useSession } from "@/stores/session";
import { useProfileOverrides } from "@/stores/profileOverrides";
import { usePreferences } from "@/stores/preferences";

/**
 * useNavbarAccount — the navbar account-popover's WIRING, kept out of the
 * presentational `src/components/navbar`.
 *
 * `src/components` composites must not reach into `@/features/*` or `@/stores/*`
 * (that inverts the dependency direction). The `<Navbar>` is therefore purely
 * presentational and takes the popover's data + side-effects as props; this hook
 * — living in the app's shared `src/hooks` layer, which IS allowed those
 * dependencies — assembles them and returns props the screens spread onto the
 * Navbar:
 *
 *   const navbar = useNavbarAccount(BASE_USER);
 *   <Navbar items={NAV_ITEMS} activeKey="library" {...navbar} />
 *
 * What it composes:
 *  • **Identity** — overlays the device-local profile overrides (display name +
 *    avatar, from `useProfileOverrides`) onto the screen's BASE user, so a name/
 *    photo set on Profile reflects in the navbar avatar everywhere. (This
 *    replaces the old `useNavbarUser`.)
 *  • **Email + guest** — from the persisted session. A guest has no email (the
 *    line is omitted) and no `onSignOut` (Sign out is hidden).
 *  • **Saved count — GATED.** `useSaved` runs ONLY while the popover is open, so
 *    rendering the navbar on Library/Search/Profile/Story no longer fires
 *    `GET /api/saved` eagerly; opening the popover triggers the count fetch.
 *  • **Language** — reads/writes the SAME shared preferences store the Profile
 *    screen edits, so the quick-switch stays in sync with Profile.
 *  • **Sign out** — fires the (mock today) network call, clears the local
 *    session, and returns to the Landing.
 */
export interface NavbarAccountWiring {
  /** Identity for the navbar avatar (base merged with device overrides). */
  user: NavbarUser;
  /** Popover data + side-effects for `<Navbar account={...} />`. */
  account: NavbarAccount;
  /** Controlled popover open-state (gates the saved-count fetch). */
  accountOpen: boolean;
  /** Open-state setter the Navbar drives. */
  onAccountOpenChange: (open: boolean) => void;
  /** "View profile" → /profile. */
  onAccountClick: () => void;
}

export function useNavbarAccount(base: NavbarUser): NavbarAccountWiring {
  const router = useRouter();

  // Open-state lives HERE so the saved-count fetch can be gated on it.
  const [accountOpen, setAccountOpen] = useState(false);

  // Identity overrides (device-local, SSR-safe — both default null).
  const avatarDataUrl = useProfileOverrides((s) => s.avatarDataUrl);
  const displayName = useProfileOverrides((s) => s.displayName);

  // Session — email + guest flag + the local sign-out.
  const sessionEmail = useSession((s) => s.user?.email);
  const isGuest = useSession((s) => s.user === null);
  const sessionSignOut = useSession((s) => s.signOut);

  // Shared translation-language preference (same store Profile edits).
  const translationLang = usePreferences((s) => s.translationLang);
  const setPreference = usePreferences((s) => s.setPreference);

  // Saved-word count — fetched ONLY while the popover is open (Finding 2).
  const saved = useSaved({ enabled: accountOpen });
  const wordsSaved = saved.data?.words.length ?? 0;

  const handleSignOut = useCallback(() => {
    void authClient.signOut();
    sessionSignOut();
    setAccountOpen(false);
    router.push("/");
  }, [router, sessionSignOut]);

  const onAccountClick = useCallback(() => {
    router.push("/profile");
  }, [router]);

  const onTranslationLangChange = useCallback(
    (lang: NavbarAccount["translationLang"]) => {
      if (lang) setPreference("translationLang", lang);
    },
    [setPreference],
  );

  return {
    user: {
      name: displayName ?? base.name,
      avatarSrc: avatarDataUrl ?? base.avatarSrc,
    },
    account: {
      email: sessionEmail,
      wordsSaved,
      finished: 0,
      // The navbar quick-switch is an ES/FR/PT picker; the reader's "translation
      // OFF" isn't one of its options, so it reads as "no active language" here
      // (the Reader header owns turning translation off/on).
      translationLang: translationLang === "OFF" ? undefined : translationLang,
      onTranslationLangChange,
      onSignOut: isGuest ? undefined : handleSignOut,
    },
    accountOpen,
    onAccountOpenChange: setAccountOpen,
    onAccountClick,
  };
}
