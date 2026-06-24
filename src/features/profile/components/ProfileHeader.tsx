"use client";

import { Avatar } from "@/ui/avatar";
import { Button } from "@/ui/button";
import type { ProfileUser } from "../types";
import { CameraIcon, PencilIcon, SignOutIcon } from "./icons";

/**
 * ProfileHeader — the Profile header card (Figma desktop 149:240 / mobile
 * 870:1237): a warm gradient banner, the 120px Avatar overlapping it with a
 * terracotta camera badge, the name + inline edit pencil, the email · joined
 * meta line, and a top-right Sign-out button.
 *
 * Responsive (variant, not a rebuild):
 *  • Desktop — banner, then a row: avatar (left, overlapping banner) · name +
 *    meta · Sign-out (pushed right).
 *  • Mobile — banner, then a centered column: avatar · name · meta · Sign-out.
 *
 * Edit affordances are REAL, focusable, active buttons (designed active, not
 * disabled) but currently no-op seams — there is no photo-upload / name-edit
 * backend yet (`TODO(profile-edit)`). Sign-out is wired to `onSignOut` (the
 * Account section's confirm flow lives in ProfileScreen; the header's button is
 * a direct affordance mirroring Figma).
 */

/** Format an ISO timestamp as the Figma "Joined June 2026" meta. */
function formatJoined(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `Joined ${date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })}`;
}

export interface ProfileHeaderProps {
  user: ProfileUser;
  /** Fires when the header Sign-out button is pressed. */
  onSignOut: () => void;
}

export function ProfileHeader({ user, onSignOut }: ProfileHeaderProps) {
  const joined = formatJoined(user.joinedAt);

  function handleChangePhoto() {
    // TODO(profile-edit): open the photo-upload flow once a backend exists.
  }
  function handleEditName() {
    // TODO(profile-edit): open the inline name editor once a backend exists.
  }

  return (
    <header className="w-full overflow-hidden rounded-2xl bg-surface-elevated shadow-profile-header">
      {/* Warm gradient banner — decorative. */}
      <div
        aria-hidden="true"
        className="h-[110px] w-full bg-[image:var(--gradient-profile-banner)] md:h-[121px]"
      />

      {/* Body — centered column on mobile, row from md. */}
      <div className="flex flex-col items-center gap-md px-lg pb-lg text-center md:flex-row md:items-start md:gap-xl md:px-[36px] md:pb-xl md:text-left">
        {/* Avatar + camera badge, pulled up to overlap the banner. */}
        <div className="relative -mt-[60px] shrink-0">
          <Avatar
            size="xl"
            src={user.avatarSrc}
            name={user.name}
            className="ring-4 ring-surface-elevated"
          />
          <button
            type="button"
            aria-label="Change photo"
            onClick={handleChangePhoto}
            className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-pill bg-accent-strong text-on-accent ring-2 ring-surface-elevated outline-none transition-colors hover:bg-accent-hover focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px] [&>svg]:size-4"
          >
            <CameraIcon />
          </button>
        </div>

        {/* Name + meta. */}
        <div className="flex min-w-0 flex-1 flex-col items-center gap-xs md:items-start md:pt-md">
          <div className="flex items-center gap-sm">
            <h1 className="font-display font-extrabold text-primary [font-size:var(--text-display-mobile-size)] [line-height:var(--text-display-mobile-line-height)]">
              {user.name}
            </h1>
            <button
              type="button"
              aria-label="Edit name"
              onClick={handleEditName}
              className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-surface-subtle text-secondary outline-none transition-colors hover:text-primary focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px] [&>svg]:size-[14px]"
            >
              <PencilIcon />
            </button>
          </div>
          <p className="font-ui text-label-m text-muted">
            {user.email}
            {joined ? ` · ${joined}` : ""}
          </p>
        </div>

        {/* Sign out — top-right on desktop, below on mobile. */}
        <div className="md:pt-md">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<SignOutIcon />}
            onClick={onSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
