import { forwardRef } from "react";

/**
 * Chip — a single-select category filter token (Figma component set 808:14).
 *
 * It is its OWN primitive, never a restyled Button or Badge. The defining
 * property is `selected`, which mirrors the Figma `Selected` variant and is
 * surfaced to assistive tech as `aria-pressed`. Rendered as a real
 * `<button type="button">` so keyboard activation (Enter / Space) and focus
 * come for free; this also lets a category-filter row later compose chips
 * inside a Radix `ToggleGroup type="single"` without changes here.
 *
 * Geometry, type, and color are all token-bound (see src/tokens/*) — there are
 * no hardcoded visual values.
 */
export interface ChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onSelect"> {
  /**
   * Whether the chip is selected. Mirrors the Figma `Selected` property and is
   * exposed as `aria-pressed`. This is a primitive-level visual prop; the
   * single-select invariant for a row of chips is enforced by the consuming
   * group, not here.
   */
  selected?: boolean;
  /** The chip text. Maps to the Figma `Label` text layer. */
  children: React.ReactNode;
  /**
   * Fired when the chip is activated (click / keyboard) while enabled, with the
   * value `selected` would toggle to. Use this for controlled selection;
   * `onClick` still fires too and receives the raw event.
   */
  onSelect?: (next: boolean) => void;
}

// Shared box: geometry (chip padding + pill radius), Label/M type, focus law,
// and disabled affordance. Token-bound only.
const base =
  "inline-flex items-center justify-center whitespace-nowrap select-none " +
  "px-[var(--space-chip-x)] py-[var(--space-chip-y)] rounded-[var(--radius-pill)] " +
  "font-ui text-label-m font-semibold tracking-[var(--text-label-m-tracking)] " +
  // 1px border on every state (transparent when selected) keeps all states the
  // same height so a chip doesn't shift by the border width when toggled.
  "border border-transparent " +
  "transition-colors cursor-pointer outline-none " +
  "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px] " +
  "disabled:cursor-not-allowed disabled:opacity-45";

// Selected: solid accent-strong fill, on-accent text, hover darkens to accent-hover.
const selectedClasses =
  "bg-[var(--bg-accent-strong)] text-[var(--text-on-accent)] " +
  "enabled:hover:bg-[var(--bg-accent-hover)]";

// Unselected: elevated surface, default border, secondary text; hover lifts to
// subtle surface + strong border + primary text; disabled mutes the text.
const unselectedClasses =
  "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] " +
  "enabled:hover:bg-[var(--bg-subtle)] enabled:hover:border-[var(--border-strong)] enabled:hover:text-[var(--text-primary)] " +
  "disabled:text-[var(--text-muted)]";

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { selected = false, children, onSelect, onClick, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onSelect?.(!selected);
      }}
      className={[base, selected ? selectedClasses : unselectedClasses, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
});
