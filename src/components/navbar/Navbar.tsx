"use client";

import { forwardRef, useCallback, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { Avatar } from "@/ui/avatar";
import { Logo } from "@/ui/logo";
import { AccountMenu, type AccountLang } from "@/components/account-menu";
import { cx } from "@/lib/utils/cx";

/**
 * Navbar — the floating, glass-effect primary navigation pill.
 * COMPOSITE (not a primitive): composes the Avatar primitive for the account
 * affordance and owns its Logo mark + nav-item pills internally (1:1 with the
 * Figma "Navbar" component, node 81:102 / instance 1272:4573).
 *
 * Zones, left → right:
 *   1. Logo (ALWAYS left — brand law) — open-book mark rotated ~13° + the
 *      "Read"(primary) "Easily"(accent) wordmark. Links to `homeHref`.
 *   2. Nav group (center) — Library / Search / Saved as icon+label items.
 *      The active item is a solid terracotta pill (`bg-accent-strong`).
 *   3. Account (right) — the Avatar wrapped in a labelled button.
 *
 * Responsive (mobile = variant, not a rebuild — user-confirmed): below `md`
 * the INACTIVE nav items collapse to icon-only square footprints (label
 * hidden), while the ACTIVE item keeps its label + pill. The Logo stays left.
 * This is a single responsive render (no duplicated interactive DOM), so each
 * item is exactly one tab stop on every breakpoint.
 *
 * Theme-agnostic: reads only semantic tokens (incl. the glass surface tokens),
 * never light/dark. Nav activation animates color over 300ms ease-out and
 * honours `prefers-reduced-motion`.
 *
 * PURELY PRESENTATIONAL — a `src/components` composite that depends only on `ui`
 * primitives + the AccountMenu composite, never on `@/features/*` or
 * `@/stores/*`. The account popover's DATA (email, saved-word count, language)
 * and SIDE-EFFECTS (sign-out, language change, profile navigation) all arrive as
 * the `account` prop + callbacks; the wiring lives in `useNavbarAccount`
 * (src/hooks), which the screens use. The popover open-state is optionally
 * controlled (`accountOpen` / `onAccountOpenChange`) so the wiring can gate the
 * saved-count fetch on the popover actually being open.
 */

export interface NavbarItem {
  /** Stable identity — matches `activeKey` and is passed to `onNavigate`. */
  key: string;
  /** Visible label (also the accessible name of the link/button). */
  label: string;
  /** Leading glyph, rendered `aria-hidden` in a 22px box. */
  icon: ReactNode;
  /** Navigation target. Used when `onNavigate` is NOT supplied (links). */
  href?: string;
  /** Optional count chip (e.g. Saved "1"); mirrors the Figma nav-badge. */
  badge?: number;
}

export interface NavbarUser {
  /** REQUIRED — Avatar alt / initials source. */
  name: string;
  /** Avatar image; falls back to initials when absent or it fails to load. */
  avatarSrc?: string;
}

/**
 * The account popover's data + side-effects, supplied by the wiring layer
 * (`useNavbarAccount`). All optional so the Navbar renders standalone (Storybook
 * / unit tests) with inert defaults — a guest with a zero count.
 */
export interface NavbarAccount {
  /** Email shown under the name; omitted for a guest → no email line. */
  email?: string;
  /** Saved-word count for the "words" stat tile. Default 0. */
  wordsSaved?: number;
  /** Stories finished — 0 until a progress store exists. Default 0. */
  finished?: number;
  /** Current translation language for the quick-switch. Default "ES". */
  translationLang?: AccountLang;
  /** Language quick-switch handler (the wiring writes the shared store). */
  onTranslationLangChange?: (lang: AccountLang) => void;
  /**
   * Sign-out handler. When omitted (a guest with no session) the popover hides
   * its Sign-out section entirely — there is nothing to sign out of.
   */
  onSignOut?: () => void;
}

export interface NavbarProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  /** Nav items, in order (Library / Search / Saved). */
  items: NavbarItem[];
  /** Key of the active item — renders it as the terracotta pill + aria-current. */
  activeKey?: string;
  /** The signed-in user (drives the account Avatar). */
  user: NavbarUser;
  /**
   * SPA navigation callback. When provided, nav items render as `<button>`s and
   * call `onNavigate(key)`; otherwise they render as `<a href>` links.
   */
  onNavigate?: (key: string) => void;
  /**
   * "View profile" handler. The avatar now OPENS the account popover
   * (`<AccountMenu>`); this fires from the popover's identity header row →
   * navigate to /profile. Kept named `onAccountClick` so existing screens pass
   * it unchanged (they already supply `() => router.push("/profile")`).
   */
  onAccountClick?: () => void;
  /** The account popover's data + side-effects (from `useNavbarAccount`). */
  account?: NavbarAccount;
  /**
   * Controlled popover open-state. When provided the Navbar is controlled and
   * the wiring owns the flag (so it can gate the saved-count fetch on it); when
   * omitted the Navbar manages the open-state internally.
   */
  accountOpen?: boolean;
  /** Fired whenever the popover open-state changes (open on avatar click, close
   *  on Esc / scrim / View-profile / Sign-out). */
  onAccountOpenChange?: (open: boolean) => void;
  /** Logo link target (the reading home — Library). Default "/library" ("/" is
   *  the marketing Landing, not the in-app home). */
  homeHref?: string;
}

/** Keyboard-only, AA-visible 2px focus ring (design law — shared with IconButton). */
const focusRing =
  "outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]";

/**
 * Logo: the shared `<Logo>` mark + wordmark, anchored left, links home. The
 * link's `aria-label` is the sole accessible name (the Logo internals are
 * aria-hidden).
 */
function NavbarLogo({ homeHref }: { homeHref: string }) {
  return (
    <a
      href={homeHref}
      aria-label="ReadEasily home"
      className={cx(
        "inline-flex shrink-0 items-center gap-[7px] rounded-pill no-underline",
        "pl-[var(--space-xs)] pr-[var(--space-sm)]",
        focusRing,
      )}
    >
      <Logo size="md" />
    </a>
  );
}

/** Shared item geometry + motion (icon+label, pill radius, 300ms ease-out). */
const itemBase = cx(
  "relative inline-flex items-center gap-[var(--space-sm)] rounded-pill no-underline",
  "font-display text-[16px] font-bold leading-[1.4] whitespace-nowrap",
  "transition-colors duration-300 ease-out motion-reduce:transition-none",
  focusRing,
);

/**
 * Active = solid terracotta pill. `shadow-md` is the token-bound soft lift; see
 * the missing-token flag in the report re: the Figma terracotta-tinted glow.
 */
const itemActive = cx(
  "bg-accent-strong text-on-accent shadow-accent-glow",
  // Mobile: icon-only 44×38 pill (label dropped). md: expands to the labeled pill.
  "h-[38px] w-[44px] justify-center",
  "md:h-auto md:w-auto md:justify-start md:pl-[18px] md:pr-[20px] md:py-sm",
);

/**
 * Inactive = transparent, primary ink, subtle hover. Below `md` it collapses
 * to a 40px icon-only square (label hidden); from `md` it grows to icon+label
 * with compact padding.
 */
const itemInactive = cx(
  "text-primary bg-transparent hover:bg-[var(--bg-subtle)]",
  "size-[40px] justify-center",
  "md:size-auto md:justify-start md:pl-[var(--space-sm)] md:pr-[var(--space-sm)] md:py-[6px]",
);

function NavItem({
  item,
  isActive,
  onNavigate,
}: {
  item: NavbarItem;
  isActive: boolean;
  onNavigate?: (key: string) => void;
}) {
  const { key, label, icon, href, badge } = item;
  const className = cx(itemBase, isActive ? itemActive : itemInactive);
  const ariaCurrent = isActive ? ("page" as const) : undefined;

  const content = (
    <>
      <span
        aria-hidden="true"
        className="inline-flex size-[22px] shrink-0 items-center justify-center [&>svg]:size-full"
      >
        {icon}
      </span>
      <span className="hidden md:inline">{label}</span>
      {badge != null && (
        <span
          className={cx(
            "items-center justify-center rounded-pill bg-[var(--bg-subtle)] px-[7px] py-[2px]",
            "font-display text-[11px] font-bold leading-none text-primary",
            "hidden md:inline-flex",
          )}
        >
          {badge}
        </span>
      )}
    </>
  );

  if (onNavigate) {
    return (
      <button
        type="button"
        // aria-label keeps the name when the label span is hidden (mobile
        // inactive items collapse to icon-only); equals the visible text when
        // shown, so it satisfies label-in-name. The icon span is aria-hidden.
        aria-label={label}
        aria-current={ariaCurrent}
        onClick={() => onNavigate(key)}
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={href}
      aria-label={label}
      aria-current={ariaCurrent}
      className={className}
    >
      {content}
    </a>
  );
}

export const Navbar = forwardRef<HTMLElement, NavbarProps>(function Navbar(
  {
    items,
    activeKey,
    user,
    onNavigate,
    onAccountClick,
    account,
    accountOpen: controlledOpen,
    onAccountOpenChange,
    // The brand logo returns to the reading home (Library at /library). `/` is
    // the marketing Landing, NOT the in-app home — see the route-swap phase.
    homeHref = "/library",
    className,
    ...rest
  },
  ref,
) {
  // The avatar opens a focus-managed account popover (Figma "Overlay/UserCard").
  // Open-state is OPTIONALLY CONTROLLED: when the wiring passes `accountOpen` it
  // owns the flag (and gates the saved-count fetch on it); otherwise the Navbar
  // keeps it internally so it still works standalone.
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen != null;
  const accountOpen = isControlled ? controlledOpen : internalOpen;
  const accountTriggerRef = useRef<HTMLButtonElement>(null);

  const setAccountOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onAccountOpenChange?.(next);
    },
    [isControlled, onAccountOpenChange],
  );

  // All account-popover data + side-effects arrive via the `account` prop (from
  // `useNavbarAccount`); a standalone Navbar (Storybook / unit tests) gets inert
  // defaults — a guest with a zero count and no sign-out.
  const onSignOut = account?.onSignOut;

  return (
    <nav
      ref={ref}
      aria-label="Primary"
      className={cx(
        "flex h-[64px] w-full items-center justify-between gap-[var(--space-md)] md:h-[57px]",
        "rounded-pill border border-[var(--surface-glass-border)]",
        "bg-[linear-gradient(var(--surface-glass-from),var(--surface-glass-to))]",
        "backdrop-blur-[var(--surface-glass-blur)] shadow-glass",
        // Off-scale pad (pr 10 / py 7) — geometry the ramp doesn't tokenize,
        // matching the established Avatar/IconButton arbitrary-px pattern.
        "pl-[var(--space-lg)] pr-[10px] py-[7px]",
        className,
      )}
      {...rest}
    >
      <NavbarLogo homeHref={homeHref} />

      <ul className="flex items-center gap-[var(--space-md)] md:gap-[var(--space-xl)] list-none p-0 m-0">
        {items.map((item) => (
          <li key={item.key} className="flex">
            <NavItem
              item={item}
              isActive={item.key === activeKey}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>

      <div className="relative shrink-0">
        <button
          ref={accountTriggerRef}
          type="button"
          aria-label="Account"
          aria-haspopup="dialog"
          aria-expanded={accountOpen}
          onClick={() => setAccountOpen(!accountOpen)}
          className={cx("inline-flex shrink-0 items-center rounded-pill", focusRing)}
        >
          <Avatar size="md" src={user.avatarSrc} name={user.name} />
        </button>
        <AccountMenu
          open={accountOpen}
          onClose={() => setAccountOpen(false)}
          identity={{ name: user.name, avatarSrc: user.avatarSrc, email: account?.email }}
          stats={{ words: account?.wordsSaved ?? 0, finished: account?.finished ?? 0 }}
          translationLang={account?.translationLang ?? "ES"}
          onTranslationLangChange={(lang) =>
            account?.onTranslationLangChange?.(lang)
          }
          onViewProfile={() => {
            setAccountOpen(false);
            onAccountClick?.();
          }}
          onSignOut={
            onSignOut
              ? () => {
                  setAccountOpen(false);
                  onSignOut();
                }
              : undefined
          }
          triggerRef={accountTriggerRef}
        />
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";
