import type { ReactNode } from "react";

export interface AuthCardProps {
  /** The form (tabs + fields + CTA) the card frames. */
  children: ReactNode;
  /** Extra classes merged onto the card container. */
  className?: string;
}

/** Join class fragments, dropping falsy ones. */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
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
 * `shadow-lg`, spacing scale for the inset.
 */
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cx(
        "bg-surface-elevated rounded-[var(--radius-xl)] shadow-lg",
        "p-[var(--space-2xl)] md:p-[var(--space-3xl)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
