"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type SVGProps,
} from "react";
import { createPortal } from "react-dom";
import { Avatar } from "../../ui/avatar";
import { Button } from "../../ui/button";
import {
  SegmentedControl,
  type SegmentedOption,
} from "../../ui/segmented-control";

/**
 * AccountMenu — the navbar avatar's account popover (Figma "Overlay / UserCard"
 * 357:629, card 340:620).
 *
 * It is NOT a `role="menu"`: it holds rich, focusable controls (a profile link,
 * stat tiles, a language radiogroup, a sign-out button), so it is a focus-managed
 * NON-modal `role="dialog"` labelled "Account" — the same kind of panel as the
 * Reader's WordPopover. Over a dim scrim; outside-click (scrim) and Esc both
 * close; Tab is trapped; Esc returns focus to the trigger avatar.
 *
 * PURELY PRESENTATIONAL — a `src/components` composite that depends only on `ui`
 * primitives, never on `@/features/*` or `@/stores/*`. Identity, stats and the
 * current translation language come in as props; View-profile, Sign-out and the
 * language change are callbacks the consumer (the Navbar's wiring layer) owns.
 * Keeping the popover in sync with the Profile screen via the shared preferences
 * store is the wiring layer's job (see `useNavbarAccount`), not this component's.
 *
 * Rendering: the scrim + panel are PORTALED to <body> so the glass navbar's
 * `backdrop-filter` (which would make it a containing block for our `fixed`
 * scrim) can't trap the overlay inside the navbar box. The consumer passes
 * `triggerRef`; the desktop anchor is measured from it.
 *
 * Responsive (variant, not a rebuild): desktop = a popover anchored under the
 * avatar; below `md` it recomposes to a bottom sheet pinned to the viewport
 * bottom. Single render.
 *
 * Motion: 200ms dissolve + scrim fade (overlay law). The global reduced-motion
 * reset (`html[data-reduce-motion]`, set from the in-app preference) and the OS
 * `prefers-reduced-motion` (`motion-reduce:`) both make it instant.
 */
export interface AccountIdentity {
  /** Display name — Avatar initials source + the header's bold line. */
  name: string;
  /** Avatar image; falls back to initials when absent / it fails to load. */
  avatarSrc?: string;
  /** Email shown (truncated) under the name. Omitted for a guest → no line. */
  email?: string;
}

export interface AccountStats {
  /** The reader's saved-word count (the "words" tile). */
  words: number;
  /** Stories finished — no progress store yet, so the Navbar passes 0. */
  finished: number;
}

/**
 * The translation languages offered by the quick-switch. Mirrors the
 * preferences store's `translationLang` union; the union is restated here so the
 * presentational component stays decoupled from the store (the wiring layer maps
 * one onto the other, and the assignment is checked at that seam).
 */
export type AccountLang = "ES" | "FR" | "PT";

export interface AccountMenuProps {
  /** Controlled open state. When false the component renders nothing. */
  open: boolean;
  /** Fired on Esc, scrim outside-click — the consumer flips `open` to false. */
  onClose: () => void;
  /** Identity for the header row (the whole row is the View-profile target). */
  identity: AccountIdentity;
  /** The two stat tiles. */
  stats: AccountStats;
  /** The currently-selected translation language (drives the quick-switch). */
  translationLang: AccountLang;
  /** Fired when the language quick-switch changes — the wiring writes the store. */
  onTranslationLangChange: (lang: AccountLang) => void;
  /** Fired by the identity header row → navigate to /profile. */
  onViewProfile: () => void;
  /**
   * Fired by the Sign-out button. When omitted (a guest with no session) the
   * Sign-out section is hidden entirely — there is nothing to sign out of.
   */
  onSignOut?: () => void;
  /**
   * The trigger to restore focus to on Esc (the navbar avatar button). Focus is
   * moved back BEFORE `onClose` unmounts the panel, so the keyboard user lands
   * where they opened from. Typed read-only so any element ref (e.g. the
   * navbar's `RefObject<HTMLButtonElement>`) is assignable.
   */
  triggerRef?: { readonly current: HTMLElement | null };
  /** Extra classes merged onto the dialog card. */
  className?: string;
}

/** Join class fragments, dropping falsy ones. */
function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** ES / FR / PT — mirrors the Profile control + the `translationLang` union. */
const LANG_OPTIONS: SegmentedOption<AccountLang>[] = [
  { value: "ES", label: "ES" },
  { value: "FR", label: "FR" },
  { value: "PT", label: "PT" },
];

/* ---------------------------------------------------------------------------
 * Local glyphs. Both decorative (aria-hidden); the accessible name lives on the
 * control. 24x24 viewBox, currentColor stroke so they inherit token text.
 * ------------------------------------------------------------------------- */

/** Right chevron — the header's "go to profile" affordance (decorative). */
function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="m9.5 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Door + arrow — Sign out (matches the Profile SignOutIcon). */
function ExitIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M9 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 8l4 4-4 4M19 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Focusable descendants for the Tab trap. Excludes roving `tabindex=-1`
 *  members (the SegmentedControl's unselected radios) so the trap sees the
 *  group as the single tab stop the radiogroup pattern intends. */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (el) =>
      !el.hasAttribute("hidden") &&
      el.getAttribute("aria-hidden") !== "true" &&
      el.getAttribute("tabindex") !== "-1",
  );
}

/* ---------------------------------------------------------------------------
 * Compact stat tile (Figma 340:630 / 340:633). Deliberately NOT the Profile
 * `StatTile`: that one is a 285px card with a required icon tile and a 32px
 * text-primary numeral, whereas the popover tiles are icon-less, ~115px, and use
 * a 22px tone-coloured numeral. Reusing StatTile here would miss Figma — see the
 * report's "stat tiles" note. Token-bound throughout (radius 12→13 reconciles to
 * --radius-icon, the same 1px nudge StatTile documents).
 * ------------------------------------------------------------------------- */
function MenuStat({
  value,
  label,
  numberClassName,
}: {
  value: number;
  label: string;
  numberClassName: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-px overflow-clip rounded-icon bg-[var(--bg-subtle)] px-sm py-[10px]">
      <span
        className={cn(
          "font-display font-bold text-heading-h3 tabular-nums",
          numberClassName,
        )}
      >
        {value}
      </span>
      <span className="font-ui text-label-s font-semibold tracking-[var(--text-label-s-tracking)] text-muted">
        {label}
      </span>
    </div>
  );
}

export const AccountMenu = forwardRef<HTMLDivElement, AccountMenuProps>(
  function AccountMenu(
    {
      open,
      onClose,
      identity,
      stats,
      translationLang,
      onTranslationLangChange,
      onViewProfile,
      onSignOut,
      triggerRef,
      className,
    },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

    const viewProfileRef = useRef<HTMLButtonElement>(null);
    const labelId = useId();

    // Desktop anchor coordinates, measured from the trigger. The panel is
    // PORTALED to <body> (the glass navbar's `backdrop-filter` would otherwise
    // make it a containing block for our `fixed` scrim, trapping it inside the
    // navbar box), so it can't anchor with `position:absolute` to the trigger —
    // we measure instead. Exposed as CSS vars consumed only by the `md:` classes,
    // so the mobile bottom-sheet layout is untouched.
    const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(
      null,
    );
    useLayoutEffect(() => {
      if (!open) return;
      const trigger = triggerRef?.current;
      if (!trigger) return;
      const measure = () => {
        const rect = trigger.getBoundingClientRect();
        setAnchor({
          top: rect.bottom + 8,
          right: Math.max(0, window.innerWidth - rect.right),
        });
      };
      measure();
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }, [open, triggerRef]);

    // On open: move focus to the first control — the View-profile header row.
    useEffect(() => {
      if (!open) return;
      viewProfileRef.current?.focus();
    }, [open]);

    // Esc → return focus to the trigger, then close. Tab/Shift+Tab cycle within
    // the panel (focus trap).
    const handleKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
          event.preventDefault();
          triggerRef?.current?.focus();
          onClose();
          return;
        }
        if (event.key !== "Tab") return;

        const root = rootRef.current;
        if (!root) return;
        const focusables = getFocusable(root);
        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (event.shiftKey) {
          if (active === first || !root.contains(active)) {
            event.preventDefault();
            last.focus();
          }
        } else if (active === last || !root.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      },
      [onClose, triggerRef],
    );

    if (!open) return null;

    const anchorStyle = anchor
      ? ({ "--am-top": `${anchor.top}px`, "--am-right": `${anchor.right}px` } as CSSProperties)
      : undefined;

    return createPortal(
      <>
        {/* Scrim — dim + click-to-close. Decorative (aria-hidden): keyboard users
            dismiss with Esc, so it needs no role/name. */}
        <div
          aria-hidden="true"
          onClick={onClose}
          className={cn(
            "fixed inset-0 z-50 bg-[var(--scrim)]",
            "transition-opacity duration-200 ease-out opacity-100",
            "motion-safe:starting:opacity-0 motion-reduce:transition-none",
          )}
        />

        <div
          ref={rootRef}
          role="dialog"
          aria-label="Account"
          onKeyDown={handleKeyDown}
          style={anchorStyle}
          className={cn(
            // Mobile = bottom sheet pinned to the viewport bottom; md+ = a popover
            // anchored under the trigger via the measured --am-* coordinates (see
            // the anchor effect). Single responsive render, not a rebuild.
            "fixed z-[60] inset-x-[var(--space-md)] bottom-[var(--space-md)]",
            "md:inset-x-auto md:bottom-auto md:left-auto md:top-[var(--am-top)] md:right-[var(--am-right)] md:w-[274px]",
            // Card surface.
            "flex flex-col overflow-clip rounded-[var(--radius-md)]",
            "border border-[var(--border-faint)] bg-[var(--bg-elevated)] shadow-[var(--shadow-popover)]",
            // Overlay motion law: 200ms dissolve. Reduced-motion (OS or in-app)
            // makes it instant; we never slide or scale.
            "transition-opacity duration-200 ease-out opacity-100",
            "motion-safe:starting:opacity-0 motion-reduce:transition-none",
            className,
          )}
        >
          {/* Identity header — the WHOLE row navigates to /profile. */}
          <button
            ref={viewProfileRef}
            type="button"
            onClick={onViewProfile}
            aria-label={`View profile, ${identity.name}`}
            className={cn(
              "flex w-full items-center gap-[var(--space-md)] px-md-plus pb-md pt-md-plus text-left",
              "transition-colors hover:bg-[var(--bg-subtle)]",
              "outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:-2px]",
            )}
          >
            <Avatar size="md" src={identity.avatarSrc} name={identity.name} />
            <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <span className="truncate [font-family:var(--text-meta-family)] text-[length:var(--text-meta-size)] leading-[var(--text-meta-line-height)] [font-weight:var(--text-meta-weight)] text-primary">
                {identity.name}
              </span>
              {identity.email != null && identity.email !== "" && (
                <span className="truncate font-ui text-caption text-muted">
                  {identity.email}
                </span>
              )}
            </span>
            <span
              aria-hidden="true"
              className="inline-flex size-[16px] shrink-0 items-center justify-center text-muted [&>svg]:size-full"
            >
              <ChevronRightIcon />
            </span>
          </button>

          <div className="h-px w-full shrink-0 bg-[var(--border-default)]" />

          {/* Stats — two equal tiles. `finished` is 0 until a progress store
              exists (the Navbar passes it). */}
          <div className="flex gap-[var(--space-sm)] p-md">
            <MenuStat
              value={stats.words}
              label="words"
              numberClassName="text-accent-text"
            />
            <MenuStat
              value={stats.finished}
              label="finished"
              numberClassName="text-success"
            />
          </div>

          {/* Language quick-switch — bound to the shared preference store. */}
          <div className="flex flex-col gap-[var(--space-sm)] px-md-plus py-md">
            <p
              id={labelId}
              className="font-ui text-label-s font-semibold uppercase tracking-[var(--text-label-s-tracking)] text-muted"
            >
              Translate words to
            </p>
            <SegmentedControl
              options={LANG_OPTIONS}
              value={translationLang}
              onChange={onTranslationLangChange}
              tone="info"
              aria-labelledby={labelId}
              className="w-full"
            />
          </div>

          {/* Sign out — hidden for a guest (no onSignOut). Neutral, never red. */}
          {onSignOut && (
            <>
              <div className="h-px w-full shrink-0 bg-[var(--border-default)]" />
              <div className="flex px-md pb-md-plus pt-md">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<ExitIcon />}
                  onClick={onSignOut}
                  className="w-full"
                >
                  Sign out
                </Button>
              </div>
            </>
          )}
        </div>
      </>,
      document.body,
    );
  },
);

AccountMenu.displayName = "AccountMenu";
