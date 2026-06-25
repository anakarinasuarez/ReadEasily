import type { ReactNode } from "react";

export interface FeatureRowProps {
  /** Decorative glyph (~24px, `currentColor`) shown in the icon tile. */
  icon: ReactNode;
  /** Title/M heading — the feature name. */
  title: string;
  /** Muted supporting line beneath the title. */
  description: string;
}

/**
 * FeatureRow — a Landing feature row (Figma rows 171:378 / 171:387 / 171:397).
 *
 * A 56px rounded-SQUARE icon tile (project law: feature icons live in rounded
 * SQUARES, never circles) holding a 24px glyph, followed by a Title/M heading
 * and a muted subtitle. The tile is the softest elevation in the system
 * (`shadow-feature-icon`) on an elevated surface with a hairline border.
 *
 * Tokens: tile `bg-surface-elevated` + `border-default` + `rounded-[var(--radius-md)]`
 * (16) + `shadow-feature-icon`; glyph `text-accent`; `text-primary` title /
 * `text-muted` description.
 */
export function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <div className="flex items-center gap-[var(--space-md-plus)]">
      <span
        aria-hidden="true"
        className={[
          "flex size-[56px] shrink-0 items-center justify-center",
          "rounded-[var(--radius-md)] border border-default bg-surface-elevated",
          "shadow-feature-icon text-accent-text",
          "[&>svg]:size-[24px]",
        ].join(" ")}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-[var(--space-xs)]">
        <h3 className="font-display text-[length:var(--text-title-m-size)] font-bold leading-[var(--text-title-m-line-height)] tracking-[var(--text-title-m-tracking)] text-primary">
          {title}
        </h3>
        <p className="font-ui text-[length:var(--text-ui-m-size)] leading-[var(--text-ui-m-line-height)] text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}
