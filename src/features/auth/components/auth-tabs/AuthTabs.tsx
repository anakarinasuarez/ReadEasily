import Link from "next/link";

export type AuthTab = "login" | "signup";

export interface AuthTabsProps {
  /** Which screen is currently shown — drives the active visual + `aria-current`. */
  active: AuthTab;
  /** Destination for the "Log in" tab. @default "/login" */
  loginHref?: string;
  /** Destination for the "Sign up" tab. @default "/signup" */
  signupHref?: string;
}

/** Join class fragments, dropping falsy ones. */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Title/M (Baloo 2 Bold 16/22) — the pill label ramp. */
const labelType =
  "font-display text-[length:var(--text-title-m-size)] font-bold leading-[var(--text-title-m-line-height)] tracking-[var(--text-title-m-tracking)]";

const tabBase = cx(
  "inline-flex min-h-[44px] items-center justify-center rounded-pill no-underline",
  labelType,
  "transition-colors duration-200 ease-out motion-reduce:transition-none",
  // Keyboard-only AA-visible 2px focus ring (design law).
  "outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]",
);

/** Active = solid terracotta fill + on-accent label. */
const tabActive = "bg-accent-strong text-on-accent";
/** Inactive = transparent over the track, primary ink, subtle hover. */
const tabInactive = "bg-transparent text-primary hover:text-accent-text";

/**
 * AuthTabs — the "Sign up / Log in" pill pair at the top of the AuthCard
 * (Figma top of node 1180:5212).
 *
 * A11y + design intent: these switch between TWO ROUTES, so they are real
 * navigation — rendered as two `next/link` `<Link>`s, NOT a radiogroup and NOT
 * SegmentedControl. The current screen's tab carries `aria-current="page"` and
 * the solid-terracotta active visual; the other is a plain link styled over the
 * `bg-surface-subtle` track. Each is a normal link tab-stop, so the pair works
 * with a screen reader and keyboard without any roving-tabindex machinery.
 *
 * Tokens: track `bg-surface-subtle`, active `bg-accent-strong` + `text-on-accent`,
 * inactive `text-primary` / `text-accent` (hover), pill radius, Title/M ramp.
 */
export function AuthTabs({
  active,
  loginHref = "/login",
  signupHref = "/signup",
}: AuthTabsProps) {
  const isSignup = active === "signup";
  const isLogin = active === "login";

  return (
    <div className="grid grid-cols-2 gap-[var(--space-xs)] rounded-pill bg-surface-subtle p-[var(--space-xs)]">
      <Link
        href={signupHref}
        aria-current={isSignup ? "page" : undefined}
        className={cx(tabBase, isSignup ? tabActive : tabInactive)}
      >
        Sign up
      </Link>
      <Link
        href={loginHref}
        aria-current={isLogin ? "page" : undefined}
        className={cx(tabBase, isLogin ? tabActive : tabInactive)}
      >
        Log in
      </Link>
    </div>
  );
}
