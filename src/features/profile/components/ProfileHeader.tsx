"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/ui/avatar";
import { Button } from "@/ui/button";
import type { ProfileUser } from "../types";
import {
  CameraIcon,
  CheckIcon,
  CloseIcon,
  PencilIcon,
  SignOutIcon,
} from "./icons";

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
 * The Change-photo affordance is REAL and local-only: the camera button opens a
 * hidden file picker; on pick we downscale the image to a small square data URL
 * (see `fileToAvatarDataUrl`) and emit it via `onAvatarChange` — the screen owns
 * persistence (localStorage, no backend, bytes never leave the device). The
 * name-edit pencil is REAL and local-only too: clicking it swaps the `<h1>` for
 * an inline input pre-filled with the current name (Enter / Save commits,
 * Escape / Cancel discards, blur commits); on commit we emit the trimmed value
 * via `onNameChange` (empty = "clear override") and the screen persists it. This
 * inline-edit interaction is NOT in Figma — it activates a designed seam under
 * an agreed pattern. Sign-out is wired to `onSignOut` (the Account section's
 * confirm flow lives in ProfileScreen; the header's button is a direct
 * affordance mirroring Figma).
 */

/** Longest edge of the downscaled square avatar, in CSS pixels. */
const AVATAR_MAX_PX = 256;
/** JPEG quality for the exported data URL — small file, still crisp at 120px. */
const AVATAR_JPEG_QUALITY = 0.85;

/** Read a File to a raw data URL via FileReader (the graceful-degrade path). */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Unexpected FileReader result"));
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
}

/** Load a data URL into an HTMLImageElement (rejects on decode failure). */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image decode failed"));
    img.src = dataUrl;
  });
}

/**
 * Turn a picked image File into a SQUARE, downscaled JPEG data URL: cover-crop
 * the centre of the source into a canvas at most {@link AVATAR_MAX_PX} per side,
 * then export. The whole canvas path is best-effort — if `Image`/`canvas` is
 * unavailable (jsdom) or anything throws, we fall back to the RAW FileReader
 * data URL so the feature degrades gracefully and stays unit-testable.
 */
async function fileToAvatarDataUrl(file: File): Promise<string> {
  const rawDataUrl = await readFileAsDataUrl(file);
  try {
    // Probe canvas support BEFORE decoding the image: jsdom returns no 2d
    // context, and crucially never fires image-load events, so bailing here
    // avoids awaiting a load that would hang under test. Real browsers continue.
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return rawDataUrl;

    const img = await loadImage(rawDataUrl);
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    if (!side) return rawDataUrl;
    const target = Math.min(side, AVATAR_MAX_PX);

    canvas.width = target;
    canvas.height = target;

    // Centre cover-crop: draw the largest centred square of the source.
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, target, target);

    const out = canvas.toDataURL("image/jpeg", AVATAR_JPEG_QUALITY);
    return out && out.startsWith("data:") ? out : rawDataUrl;
  } catch {
    return rawDataUrl;
  }
}

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
  /** Fires with the final (downscaled, local-only) avatar data URL after a pick. */
  onAvatarChange: (dataUrl: string) => void;
  /**
   * Fires with the committed (trimmed) display name. An empty string means
   * "clear the override" (fall back to the server name) — the store nullifies
   * it. The header owns the edit-mode UI; the screen owns persistence.
   */
  onNameChange: (name: string) => void;
}

export function ProfileHeader({
  user,
  onSignOut,
  onAvatarChange,
  onNameChange,
}: ProfileHeaderProps) {
  const joined = formatJoined(user.joinedAt);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline name-edit UI state (local to the header). `draft` holds the in-flight
  // text; `editing` swaps the h1 for the input. Refs drive focus management:
  // focus moves INTO the input when editing opens and back to the pencil when it
  // closes (save OR cancel).
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user.name);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const pencilRef = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const wasEditingRef = useRef(false);

  useEffect(() => {
    if (editing && !wasEditingRef.current) {
      // Opening: focus + select so a quick retype replaces the whole name.
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    } else if (!editing && wasEditingRef.current) {
      // Closing: return focus to the pencil that opened the editor.
      pencilRef.current?.focus();
    }
    wasEditingRef.current = editing;
  }, [editing]);

  function openEditor() {
    setDraft(user.name);
    setEditing(true);
  }

  function commitName() {
    const trimmed = draft.trim();
    // Empty → clear override (""); non-empty + changed → emit; unchanged → no-op.
    if (trimmed === "") {
      onNameChange("");
    } else if (trimmed !== user.name) {
      onNameChange(trimmed);
    }
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function handleNameKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitName();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  }

  function handleNameBlur(event: React.FocusEvent<HTMLInputElement>) {
    // Blur = save — UNLESS focus is moving to the Save/Cancel buttons inside the
    // editor, in which case their own handlers run (avoids a double-commit).
    if (editorRef.current?.contains(event.relatedTarget as Node | null)) return;
    commitName();
  }

  function handleChangePhoto() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    // Ignore non-image picks; reset so re-selecting the same file fires change.
    if (file && file.type.startsWith("image/")) {
      const dataUrl = await fileToAvatarDataUrl(file);
      onAvatarChange(dataUrl);
    }
    input.value = "";
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
          {/* Hidden picker — the visible affordance stays the camera button. */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* Name + meta. */}
        <div className="flex min-w-0 flex-1 flex-col items-center gap-xs md:items-start md:pt-md">
          {editing ? (
            <div
              ref={editorRef}
              className="flex items-center gap-sm"
              onBlur={handleNameBlur}
            >
              <input
                ref={nameInputRef}
                type="text"
                aria-label="Your name"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleNameKeyDown}
                className="min-w-0 max-w-full rounded-md border border-border-default bg-surface-elevated px-sm py-[2px] font-display font-extrabold text-primary outline-none [font-size:var(--text-display-mobile-size)] [line-height:var(--text-display-mobile-line-height)] focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]"
              />
              <button
                type="button"
                aria-label="Save name"
                onClick={commitName}
                className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-accent-strong text-on-accent outline-none transition-colors hover:bg-accent-hover focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px] [&>svg]:size-[14px]"
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                aria-label="Cancel editing name"
                onClick={cancelEdit}
                className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-surface-subtle text-secondary outline-none transition-colors hover:text-primary focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px] [&>svg]:size-[14px]"
              >
                <CloseIcon />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-sm">
              <h1 className="font-display font-extrabold text-primary [font-size:var(--text-display-mobile-size)] [line-height:var(--text-display-mobile-line-height)]">
                {user.name}
              </h1>
              <button
                ref={pencilRef}
                type="button"
                aria-label="Edit name"
                onClick={openEditor}
                className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-surface-subtle text-secondary outline-none transition-colors hover:text-primary focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px] [&>svg]:size-[14px]"
              >
                <PencilIcon />
              </button>
            </div>
          )}
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
