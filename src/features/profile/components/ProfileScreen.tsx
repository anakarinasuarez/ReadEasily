"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar, type NavbarItem } from "@/components/navbar";
import { useNavbarAccount } from "@/hooks/useNavbarAccount";
import { BgDecorations } from "@/components/bg-decorations";
import { StatTile } from "@/components/stat-tile";
import { SettingsRow } from "@/components/settings-row";
import { Modal } from "@/components/modal";
import { SegmentedControl, type SegmentedOption } from "@/ui/segmented-control";
import { Button } from "@/ui/button";
import {
  usePreferences,
  useHydratePreferences,
  type Preferences,
} from "@/stores/preferences";
import {
  useProfileOverrides,
  useHydrateProfileOverrides,
} from "@/stores/profileOverrides";
import { useSession } from "@/stores/session";
import { authClient } from "@/features/auth/api/authClient";
import { useProfile } from "../hooks/useProfile";
import type { ProfileData, ProfileStats } from "../types";
import { ProfileHeader } from "./ProfileHeader";
import {
  BookmarkIcon,
  BookOpenIcon,
  CardsIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  GlobeIcon,
  LibraryIcon,
  PlayIcon,
  RefreshIcon,
  ResetIcon,
  SavedIcon,
  SearchIcon,
  SignOutIcon,
  SparkleIcon,
  TapIcon,
  TrashIcon,
  VolumeIcon,
} from "./icons";

/**
 * ProfileScreen — the Profile route (`/profile`), 1:1 with Figma "Screen /
 * Profile" (desktop 149:212, mobile 870:1117). The feature's one client
 * component: it reads the user + stats from `useProfile` (server state) and the
 * five reading preferences from the global persisted `usePreferences` store, and
 * owns the screen's interactions — editing a preference (which persists across
 * reloads) and the destructive confirm modals.
 *
 * Server/store boundary on purpose: the user identity + learning stats come
 * from the backend (Query); the preferences are device-local + shared with the
 * Reader, so they live in the store, NOT in the profile payload. The settings
 * therefore keep working even if the profile fetch fails (see the error state).
 *
 * Layout (responsive variants, not a rebuild):
 *  • Desktop — BgDecorations; sticky Navbar (NO active item); in-flow
 *    `‹ Library` breadcrumb; the header card; a row of 4 StatTiles; Settings
 *    (5 rows in a card); Account (3 nav rows in a card).
 *  • Mobile — same, but the header recomposes to a centered column, the stats
 *    become a 2×2 grid, and the segmented rows wrap their control full-width
 *    below the text.
 */

/** Primary nav — Profile has NO active destination (avatar opens it instead). */
const NAV_ITEMS: NavbarItem[] = [
  { key: "library", label: "Library", icon: <LibraryIcon />, href: "/library" },
  { key: "search", label: "Search", icon: <SearchIcon />, href: "/search" },
  { key: "saved", label: "Saved", icon: <SavedIcon />, href: "/saved" },
];

const LANG_OPTIONS: SegmentedOption<Preferences["translationLang"]>[] = [
  { value: "ES", label: "ES" },
  { value: "FR", label: "FR" },
  { value: "PT", label: "PT" },
];

const ACCENT_OPTIONS: SegmentedOption<Preferences["readingAccent"]>[] = [
  { value: "US", label: "US" },
  { value: "UK", label: "UK" },
  { value: "AU", label: "AU" },
  { value: "CA", label: "CA" },
];

/** Breadcrumb-back `‹ Library` — in-flow, non-sticky (mirrors the Saved row). */
function Breadcrumb() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-[var(--space-md)]">
      <Link
        href="/library"
        aria-label="Back to Library"
        className="gap-[var(--space-xs)] no-underline"
      >
        <span
          aria-hidden="true"
          className="inline-flex size-[16px] [&>svg]:size-full"
        >
          <ChevronLeftIcon />
        </span>
        Library
      </Link>
    </Button>
  );
}

/** A section heading ("Settings" / "Account"). */
function SectionHeading({ id, children }: { id?: string; children: string }) {
  return (
    <h2 id={id} className="font-display text-heading-h3 font-bold text-primary">
      {children}
    </h2>
  );
}

/** The elevated, rounded card that groups a list of rows. */
function ListCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-surface-elevated shadow-card">
      {children}
    </div>
  );
}

/** Tile tones for the two segmented rows — token-bound (mirrors SettingsRow). */
const SEG_TILE_TONE = {
  info: "bg-info-subtle text-info",
  accent: "bg-accent-subtle text-accent-text",
} as const;

/**
 * A settings row whose control is a SegmentedControl. SettingsRow's `custom`
 * slot is inline-only, but Figma's structured segmented row (1434:4287) wraps
 * the control full-width BELOW the text under `md` — so this feature-local row
 * reproduces that responsive layout while reusing the same tile/text treatment
 * and the SegmentedControl primitive. (A structured `segmented` variant on
 * SettingsRow itself is flagged for the orchestrator.)
 */
function SegmentedSettingRow<T extends string>({
  icon,
  tone,
  label,
  description,
  options,
  value,
  onChange,
  segmentTone,
  divider,
}: {
  icon: React.ReactNode;
  tone: keyof typeof SEG_TILE_TONE;
  label: string;
  description: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  segmentTone: "info" | "accent";
  divider?: boolean;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  return (
    <div
      className={`flex flex-col gap-md bg-surface-elevated px-lg py-md md:flex-row md:items-center ${
        divider ? "border-b border-border-default" : ""
      }`}
    >
      <div className="flex items-center gap-md">
        <span
          aria-hidden="true"
          className={`flex size-10 shrink-0 items-center justify-center rounded-md [&>svg]:size-5 ${SEG_TILE_TONE[tone]}`}
        >
          {icon}
        </span>
        <div className="flex min-w-0 flex-col gap-[2px]">
          <span
            id={labelId}
            className="font-display text-heading-h4 font-semibold text-primary"
          >
            {label}
          </span>
          <span className="text-caption text-muted">{description}</span>
        </div>
      </div>
      <div className="md:ml-auto">
        <SegmentedControl
          options={options}
          value={value}
          onChange={onChange}
          tone={segmentTone}
          aria-labelledby={labelId}
          className="w-full md:w-auto"
        />
      </div>
    </div>
  );
}

/** The Settings section — the 5 preference rows, wired to the store. */
function SettingsSection() {
  const translationLang = usePreferences((s) => s.translationLang);
  const readingAccent = usePreferences((s) => s.readingAccent);
  const autoplay = usePreferences((s) => s.autoplay);
  const pronounceOnTap = usePreferences((s) => s.pronounceOnTap);
  const reduceMotion = usePreferences((s) => s.reduceMotion);
  const setPreference = usePreferences((s) => s.setPreference);

  return (
    <section className="flex w-full flex-col gap-lg" aria-labelledby="settings-heading">
      <SectionHeading id="settings-heading">Settings</SectionHeading>
      <ListCard>
        <SegmentedSettingRow
          divider
          icon={<GlobeIcon />}
          tone="info"
          label="Translation language"
          description="Word meanings while you read"
          options={LANG_OPTIONS}
          value={translationLang}
          onChange={(v) => setPreference("translationLang", v)}
          segmentTone="info"
        />
        <SegmentedSettingRow
          divider
          icon={<VolumeIcon />}
          tone="accent"
          label="Reading accent"
          description="Voice used to narrate stories"
          options={ACCENT_OPTIONS}
          value={readingAccent}
          onChange={(v) => setPreference("readingAccent", v)}
          segmentTone="accent"
        />
        <SettingsRow
          variant="toggle"
          divider
          icon={<PlayIcon />}
          iconTone="success"
          label="Autoplay narration"
          description="Start reading aloud automatically"
          checked={autoplay}
          onCheckedChange={(v) => setPreference("autoplay", v)}
        />
        <SettingsRow
          variant="toggle"
          divider
          icon={<TapIcon />}
          iconTone="warning"
          label="Pronounce on tap"
          description="Say each word when you tap it"
          checked={pronounceOnTap}
          onCheckedChange={(v) => setPreference("pronounceOnTap", v)}
        />
        <SettingsRow
          variant="toggle"
          icon={<SparkleIcon />}
          iconTone="plum"
          label="Reduce motion"
          description="Calm down page turns and effects"
          checked={reduceMotion}
          onCheckedChange={(v) => setPreference("reduceMotion", v)}
        />
      </ListCard>
    </section>
  );
}

/** Which destructive confirm dialog is open. */
type ConfirmKind = "reset" | "delete" | null;

/** The Account section — 3 nav rows; two open a destructive confirm modal. */
function AccountSection({ onSignOut }: { onSignOut: () => void }) {
  const [confirm, setConfirm] = useState<ConfirmKind>(null);

  function handleConfirm() {
    // TODO(auth): perform the real reset / deletion once an auth + data backend
    // exists. Today the destructive action is a no-op seam — only the confirm
    // choreography (focus-trap / Esc / 200ms) is real.
    setConfirm(null);
  }

  const dialog =
    confirm === "reset"
      ? {
          eyebrow: "RESET",
          title: "Reset learning data?",
          body: "This clears your saved words, practice sets and reading progress on this device. This can't be undone.",
          cta: "Reset data",
          icon: <ResetIcon />,
        }
      : confirm === "delete"
        ? {
            eyebrow: "DELETE ACCOUNT",
            title: "Delete account?",
            body: "This permanently removes your profile and all of your data. This can't be undone.",
            cta: "Delete account",
            icon: <TrashIcon />,
          }
        : null;

  return (
    <section className="flex w-full flex-col gap-lg" aria-labelledby="account-heading">
      <SectionHeading id="account-heading">Account</SectionHeading>
      <ListCard>
        <SettingsRow
          variant="nav"
          divider
          icon={<SignOutIcon />}
          iconTone="accent"
          label="Sign out"
          description="Your progress stays saved on this device"
          onClick={onSignOut}
        />
        <SettingsRow
          variant="nav"
          divider
          icon={<ResetIcon />}
          iconTone="warning"
          label="Reset learning data"
          description="Clear saved words, practice sets & progress"
          onClick={() => setConfirm("reset")}
        />
        <SettingsRow
          variant="nav"
          icon={<TrashIcon />}
          iconTone="danger"
          titleTone="danger"
          label="Delete account"
          description="Remove your profile and all data"
          onClick={() => setConfirm("delete")}
        />
      </ListCard>

      <Modal
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        size="sm"
        eyebrow={dialog?.eyebrow}
        title={dialog?.title ?? ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              leftIcon={dialog?.icon}
              onClick={handleConfirm}
            >
              {dialog?.cta ?? "Confirm"}
            </Button>
          </>
        }
      >
        <p className="text-body-l text-secondary">{dialog?.body}</p>
      </Modal>
    </section>
  );
}

/** The 4 stat tiles — desktop row of 4, mobile 2×2 grid. */
function StatsRow({ stats }: { stats: ProfileStats }) {
  return (
    <div className="grid w-full grid-cols-2 gap-md-plus md:grid-cols-4">
      <StatTile
        className="w-full!"
        tone="accent"
        icon={<BookmarkIcon />}
        value={stats.wordsSaved}
        label="Words saved"
      />
      <StatTile
        className="w-full!"
        tone="warning"
        icon={<CardsIcon />}
        value={stats.practiceSets}
        label="Practice sets"
      />
      <StatTile
        className="w-full!"
        tone="info"
        icon={<BookOpenIcon />}
        value={stats.inProgress}
        label="In progress"
      />
      <StatTile
        className="w-full!"
        tone="success"
        icon={<CheckCircleIcon />}
        value={stats.finished}
        label="Finished"
      />
    </div>
  );
}

/** Header skeleton — same height as ProfileHeader, no layout shift on data. */
function HeaderSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-[228px] w-full animate-pulse rounded-2xl bg-surface-subtle motion-reduce:animate-none md:h-[240px]"
    />
  );
}

/** Stats skeleton — four tile-shaped placeholders. */
function StatsSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid w-full grid-cols-2 gap-md-plus md:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[162px] w-full animate-pulse rounded-card bg-surface-subtle motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

/** Error block for the header + stats region (settings still work below). */
function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex w-full flex-col items-center gap-md rounded-2xl bg-surface-elevated px-lg py-2xl text-center shadow-card"
    >
      <p className="font-display text-heading-h4 font-semibold text-primary">
        We couldn&apos;t load your profile
      </p>
      <p className="text-caption text-muted">
        Your settings below still work. Check your connection and try again.
      </p>
      <Button variant="secondary" leftIcon={<RefreshIcon />} onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const signOut = useSession((s) => s.signOut);
  const { data, isPending, isError, refetch } = useProfile();

  // Pull the persisted preferences + overrides in after mount (SSR-safe — stores).
  useHydratePreferences();
  useHydrateProfileOverrides();

  // Local overrides (device-local, no backend) win over the server values.
  const avatarDataUrl = useProfileOverrides((s) => s.avatarDataUrl);
  const setAvatar = useProfileOverrides((s) => s.setAvatar);
  const displayName = useProfileOverrides((s) => s.displayName);
  const effectiveAvatar = avatarDataUrl ?? data?.user.avatarSrc;
  const effectiveName = displayName ?? data?.user.name;

  // Navbar account wiring — the hook re-applies the same device overrides onto
  // the base server identity, so the navbar avatar matches the header.
  const navbar = useNavbarAccount({
    name: data?.user.name ?? "You",
    avatarSrc: data?.user.avatarSrc,
  });

  function handleSignOut() {
    // Clear the local session immediately and return to the Landing. The
    // network seam (authClient.signOut) fires in the background — today it's the
    // mock; later it ends the real Supabase session. Reading stays guest-open,
    // so there is nothing to gate after sign-out.
    void authClient.signOut();
    signOut();
    router.push("/");
  }

  function handleNameChange(name: string) {
    // "" / whitespace collapses to null in the setter (clear the override).
    useProfileOverrides.getState().setDisplayName(name || null);
  }

  return (
    <main className="relative flex min-h-full flex-1 flex-col bg-canvas">
      <BgDecorations fixed />

      {/* Sticky navbar — Profile has NO active item; the account avatar opens
          this very screen (and does so from every other screen too). */}
      <div className="sticky top-0 z-50 mx-auto w-full max-w-7xl px-lg pt-lg">
        <Navbar items={NAV_ITEMS} {...navbar} />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-start gap-2xl px-lg py-2xl">
        <Breadcrumb />

        {isError ? (
          <ProfileError onRetry={() => void refetch()} />
        ) : isPending ? (
          <>
            <HeaderSkeleton />
            <StatsSkeleton />
          </>
        ) : (
          <>
            <ProfileHeader
              user={{
                ...(data as ProfileData).user,
                name: effectiveName ?? (data as ProfileData).user.name,
                avatarSrc: effectiveAvatar,
              }}
              onSignOut={handleSignOut}
              onAvatarChange={setAvatar}
              onNameChange={handleNameChange}
            />
            <StatsRow stats={(data as ProfileData).stats} />
          </>
        )}

        {/* Settings + Account are store/local-driven — always available, even
            when the profile fetch is pending or failed. */}
        <SettingsSection />
        <AccountSection onSignOut={handleSignOut} />
      </div>
    </main>
  );
}
