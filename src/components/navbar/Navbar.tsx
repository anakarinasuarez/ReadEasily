"use client";

import { forwardRef, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/ui/avatar";
import { AccountMenu } from "@/components/account-menu";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { authClient } from "@/features/auth/api/authClient";
import { useSession } from "@/stores/session";

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
  /** Logo link target (the reading home — Library). Default "/library" ("/" is
   *  the marketing Landing, not the in-app home). */
  homeHref?: string;
}

/** Join class fragments, dropping falsy ones. */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Keyboard-only, AA-visible 2px focus ring (design law — shared with IconButton). */
const focusRing =
  "outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]";

/**
 * Open-book brand mark. Token-bound fills (accent for depth) with low-opacity
 * page curves. Sized via className so the Logo can scale down on mobile; the
 * ~13° tilt is applied by the wrapper, not here.
 */
function BookMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M3 5.5C7.8 4 12.4 4.3 17 6.6c1.1.5 1.8 1.6 1.8 2.8V28c0 .9-1 1.5-1.9 1.1-4.3-2.1-8.6-2.4-13.1-1.1C2.9 28.3 2 27.6 2 26.6V7.4C2 6.5 2.2 5.8 3 5.5Z"
        fill="var(--bg-accent)"
      />
      <path
        d="M37 5.5C32.2 4 27.6 4.3 23 6.6c-1.1.5-1.8 1.6-1.8 2.8V28c0 .9 1 1.5 1.9 1.1 4.3-2.1 8.6-2.4 13.1-1.1.9.3 1.8-.4 1.8-1.4V7.4C38 6.5 37.8 5.8 37 5.5Z"
        fill="var(--bg-accent-strong)"
      />
      <path
        d="M6.5 10.5c2.9 0 5.7.6 8.3 1.8M6.5 15c2.9 0 5.7.6 8.3 1.8M33.5 10.5c-2.9 0-5.7.6-8.3 1.8M33.5 15c-2.9 0-5.7.6-8.3 1.8"
        stroke="var(--text-on-accent)"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

/** Logo: book mark + wordmark, anchored left, links home. */
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
      <span className="inline-flex rotate-[13deg]">
        <BookMark className="block h-[29px] w-[33px] md:h-[32px] md:w-[40px]" />
      </span>
      {/* Decorative as a whole; the link's accessible name comes from aria-label. */}
      <span
        aria-hidden="true"
        className="font-display text-[14px] font-extrabold leading-none whitespace-nowrap md:text-[19px]"
      >
        <span className="text-primary">Read</span>
        <span className="text-accent-text">Easily</span>
      </span>
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
    // The brand logo returns to the reading home (Library at /library). `/` is
    // the marketing Landing, NOT the in-app home — see the route-swap phase.
    homeHref = "/library",
    className,
    ...rest
  },
  ref,
) {
  // The avatar opens a focus-managed account popover (Figma "Overlay/UserCard").
  const [accountOpen, setAccountOpen] = useState(false);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // AccountMenu data sourced app-globally so EVERY screen's navbar gets it for
  // free (the screens only ever pass `onAccountClick`):
  //  • identity name/avatar — the `user` prop (already merged with the device
  //    profile overrides upstream via `useNavbarUser`);
  //  • email — the persisted session (a guest has none → the email line is
  //    omitted, and Sign out is hidden: nothing to sign out of);
  //  • words — the live Saved list length (shared Query cache with the Saved
  //    screen, so it can't drift); finished — 0 until a progress store exists.
  const sessionEmail = useSession((s) => s.user?.email);
  const isGuest = useSession((s) => s.user === null);
  const sessionSignOut = useSession((s) => s.signOut);
  const saved = useSaved();
  const wordsSaved = saved.data?.words.length ?? 0;

  // Sign out — mirrors ProfileScreen: fire the (mock today) network call, clear
  // the local session, return to the landing.
  function handleSignOut() {
    void authClient.signOut();
    sessionSignOut();
    setAccountOpen(false);
    router.push("/");
  }

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
          onClick={() => setAccountOpen((open) => !open)}
          className={cx("inline-flex shrink-0 items-center rounded-pill", focusRing)}
        >
          <Avatar size="md" src={user.avatarSrc} name={user.name} />
        </button>
        <AccountMenu
          open={accountOpen}
          onClose={() => setAccountOpen(false)}
          identity={{ name: user.name, avatarSrc: user.avatarSrc, email: sessionEmail }}
          stats={{ words: wordsSaved, finished: 0 }}
          onViewProfile={() => {
            setAccountOpen(false);
            onAccountClick?.();
          }}
          onSignOut={isGuest ? undefined : handleSignOut}
          triggerRef={accountTriggerRef}
        />
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";
