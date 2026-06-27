import type { ReactNode } from "react";
import { cx } from "@/lib/utils/cx";

export interface AuthCardProps {
  /** The form (tabs + fields + CTA) the card frames. */
  children: ReactNode;
  /** Extra classes merged onto the card container. */
  className?: string;
}

/**
 * AuthCard — the white form-card container for the auth screens (Figma node
 * 1180:5212). Pure presentational shell: an elevated surface at the XL card
 * radius with the system's large soft shadow and generous padding that relaxes
 * up at `md`. It carries no semantics of its own — the form inside owns the
 * heading, fields and submit — so it is reusable across Log-in / Sign-up /
 * Forgot.
 *
 * Tokens: `bg-surface-elevated`, `rounded-[var(--radius-xl)]` (32),
 * `shadow-lg`. Padding is Figma-exact `pt-28 px-40 pb-32` at ALL breakpoints — 28
 * and 40 are off-scale arbitrary px (the accepted decorative-geometry pattern);
 * the bottom inset is the on-scale `--space-2xl` (32).
 */
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cx(
        "bg-surface-elevated rounded-[var(--radius-xl)] shadow-lg",
        "pt-[28px] px-[40px] pb-[var(--space-2xl)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
