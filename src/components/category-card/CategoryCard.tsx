import * as React from "react";
import { cx } from "@/lib/utils/cx";

/**
 * CategoryCard — the Search screen's category entry card. 1:1 with the Figma
 * "Category Card" component SET: `category` (Fables | Daily Life | Technology |
 * Travel) × `selected` (False | True).
 *
 * It renders as a real link (<a>): tapping it navigates to that category's
 * filtered Search view. "selected" means you are *currently on* that view, so
 * the selected card carries `aria-current="page"` — it is not a toggle.
 *
 * Anatomy (Figma-measured):
 *  - 44×44 rounded-SQUARE icon tile (warmth law: never a circle) holding a 22px
 *    decorative glyph;
 *  - the category label (Baloo 2 ExtraBold 22/30, `text-primary`);
 *  - the story count (Nunito SemiBold 13/18, `text-muted`);
 *  - SELECTED only: a 28px CIRCULAR check badge top-right — the one intentional
 *    circle (a status indicator, not a feature icon).
 *
 * The per-category colour contract is a typed lookup (`CATEGORY_CONFIG`); no
 * value is hardcoded — every colour/space/radius resolves to a token.
 *
 * No-reflow border: the 1px(unselected)→2px(selected) edge is painted as an
 * inset box-shadow ring (the Input precedent), composed with the card's drop
 * shadow, so selecting never shifts layout.
 */

/** The data id for a category. Drives the glyph + token set internally. */
export type CategoryId = "fables" | "daily-life" | "technology" | "travel";

export interface CategoryCardProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  /** Category data id — maps to the glyph and per-category colour set. */
  category: CategoryId;
  /** Visible label, e.g. "Daily Life". Also the card's accessible name. */
  label: string;
  /** Number of stories in the category, e.g. 4 → "4 stories". */
  storyCount: number;
  /** Whether this card is the category currently being viewed. */
  selected?: boolean;
  /** Destination of the filtered Search view this card navigates to. */
  href: string;
}

/* --- glyphs (decorative; 22px, currentColor so they flip fg→on-accent) ----- */

function StarGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.7 5.95 6.3.62-4.7 4.27 1.3 6.16L12 16.9l-5.6 2.6 1.3-6.16-4.7-4.27 6.3-.62L12 2.5z" />
    </svg>
  );
}

function CoffeeGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z" />
      <path d="M17 10h2a2.5 2.5 0 0 1 0 5h-2" />
      <path d="M8 2.5c-.6.8-.6 1.7 0 2.5M12 2.5c-.6.8-.6 1.7 0 2.5" />
    </svg>
  );
}

function GaugeGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="M12 18l4.5-5" />
      <circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PlaneGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.43 3.32a.94.94 0 0 0-1.04-.18L3.6 10.5c-.86.38-.78 1.62.12 1.88l4.7 1.38 1.38 4.7c.26.9 1.5.98 1.88.12l7.36-16.79a.94.94 0 0 0-.18-1.04l.59.57zM10.1 13.9l-.86-2.94 8.2-3.6-6.34 6.74-1 .8z" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

/* --- per-category colour + glyph contract (typed; tokens only) ------------- */

interface CategoryConfig {
  /** Unselected icon-tile tint (16% subtle). */
  tileSubtle: string;
  /** Unselected glyph colour = the category fg. */
  fgText: string;
  /** Selected icon-tile / check-badge solid background = the category fg. */
  fgBg: string;
  /** Selected card background. */
  selectedBg: string;
  /**
   * Selected inset-ring (2px) composed with the card drop shadow. Written as a
   * literal so Tailwind's JIT detects the arbitrary value. Fables/Daily use
   * their own border; Tech/Travel use navy `--feedback-info` AS MEASURED.
   */
  selectedShadow: string;
  glyph: React.ReactNode;
}

const CATEGORY_CONFIG: Record<CategoryId, CategoryConfig> = {
  fables: {
    tileSubtle: "bg-cat-fables-subtle",
    fgText: "text-category-fables-fg",
    fgBg: "bg-category-fables-fg",
    selectedBg: "bg-category-fables-bg",
    selectedShadow:
      "shadow-[inset_0_0_0_2px_var(--category-fables-fg),var(--shadow-card)] hover:shadow-[inset_0_0_0_2px_var(--category-fables-fg),var(--shadow-md)]",
    glyph: <StarGlyph />,
  },
  "daily-life": {
    tileSubtle: "bg-cat-daily-subtle",
    fgText: "text-category-daily-fg",
    fgBg: "bg-category-daily-fg",
    selectedBg: "bg-category-daily-bg",
    selectedShadow:
      "shadow-[inset_0_0_0_2px_var(--border-accent),var(--shadow-card)] hover:shadow-[inset_0_0_0_2px_var(--border-accent),var(--shadow-md)]",
    glyph: <CoffeeGlyph />,
  },
  technology: {
    tileSubtle: "bg-cat-tech-subtle",
    fgText: "text-category-tech-fg",
    fgBg: "bg-category-tech-fg",
    selectedBg: "bg-category-tech-bg",
    selectedShadow:
      "shadow-[inset_0_0_0_2px_var(--feedback-info),var(--shadow-card)] hover:shadow-[inset_0_0_0_2px_var(--feedback-info),var(--shadow-md)]",
    glyph: <GaugeGlyph />,
  },
  travel: {
    tileSubtle: "bg-cat-travel-subtle",
    fgText: "text-category-travel-fg",
    fgBg: "bg-category-travel-fg",
    selectedBg: "bg-category-travel-bg",
    selectedShadow:
      "shadow-[inset_0_0_0_2px_var(--feedback-info),var(--shadow-card)] hover:shadow-[inset_0_0_0_2px_var(--feedback-info),var(--shadow-md)]",
    glyph: <PlaneGlyph />,
  },
};

/** Unselected: 1px border-default ring composed with the card drop shadow. */
const UNSELECTED_SHADOW =
  "shadow-[inset_0_0_0_1px_var(--border-default),var(--shadow-card)] hover:shadow-[inset_0_0_0_1px_var(--border-default),var(--shadow-md)]";

export const CategoryCard = React.forwardRef<HTMLAnchorElement, CategoryCardProps>(
  function CategoryCard(
    { category, label, storyCount, selected = false, href, className, ...rest },
    ref,
  ) {
    const config = CATEGORY_CONFIG[category];
    const countId = React.useId();
    const countLabel = `${storyCount} ${storyCount === 1 ? "story" : "stories"}`;

    return (
      <a
        ref={ref}
        href={href}
        aria-current={selected ? "page" : undefined}
        // Name = the label only (the count + decorative glyph/badge are excluded
        // from name-from-contents); the count is announced as the description.
        aria-label={label}
        aria-describedby={countId}
        className={cx(
          // card: fluid width (the grid sizes it to 202/172), fixed 160 height,
          // 20px radius, vertical stack. No CSS `border` — the edge is an inset
          // ring (see *_SHADOW) so 1px→2px never reflows.
          "group relative flex h-40 w-full flex-col gap-md-plus overflow-hidden rounded-card p-5",
          "no-underline outline-none",
          // hover lift (no Figma variant — design-lead recommendation); motion-safe only.
          "transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5",
          "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          // AA-visible focus ring.
          "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]",
          selected
            ? cx(config.selectedBg, config.selectedShadow)
            : cx("bg-surface-elevated", UNSELECTED_SHADOW),
          className,
        )}
        {...rest}
      >
        {/* rounded-SQUARE icon tile (warmth law). 44px tile, 22px glyph.
            Decorative — hidden from the a11y tree. */}
        <span
          aria-hidden="true"
          className={cx(
            "flex size-11 shrink-0 items-center justify-center rounded-icon [&>svg]:size-[22px]",
            selected
              ? cx(config.fgBg, "text-on-accent")
              : cx(config.tileSubtle, config.fgText),
          )}
        >
          {config.glyph}
        </span>

        {/* label — the card's accessible name */}
        <span className="font-display text-heading-h3 font-extrabold whitespace-nowrap text-primary">
          {label}
        </span>

        {/* story count — appended to the name via aria-describedby */}
        <span
          id={countId}
          className="font-ui text-label-m font-semibold tracking-[var(--text-label-m-tracking)] text-muted"
        >
          {countLabel}
        </span>

        {/* SELECTED-only CIRCULAR check badge — decorative status indicator */}
        {selected ? (
          <span
            aria-hidden="true"
            className={cx(
              "absolute right-md-plus top-md-plus flex size-7 items-center justify-center rounded-full text-on-accent [&>svg]:size-4",
              config.fgBg,
            )}
          >
            <CheckGlyph />
          </span>
        ) : null}
      </a>
    );
  },
);

CategoryCard.displayName = "CategoryCard";
