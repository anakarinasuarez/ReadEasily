"use client";

import { useId, useRef } from "react";

/**
 * SegmentedControl — a single-select pill group (Figma node 158:11, the control
 * inside the Profile "Translation language" and "Reading accent" settings rows).
 *
 * It is NOT a toggle-button group. Like the Chip category filter (project
 * decision), a single-select control of mutually-exclusive options reads to
 * assistive tech as a RADIO GROUP: `role="radiogroup"` wrapping `role="radio"`
 * segments with `aria-checked` — never `aria-pressed`.
 *
 * Keyboard (native radio pattern):
 *   - Exactly one tab stop for the whole group (roving tabindex): the checked
 *     segment is `tabIndex=0`, the rest `-1`.
 *   - Arrow keys (←/→ and ↑/↓) move selection AND focus together (selecting on
 *     arrow is the native radiogroup behaviour). Home/End jump to first/last.
 *   - Space/Enter select the focused segment (free via the underlying <button>).
 *
 * Generic over the value union so `SegmentedControl<"ES" | "FR" | "PT">` and
 * `SegmentedControl<"US" | "UK" | "AU" | "CA">` are both fully type-safe.
 *
 * Geometry, type, and colour are token-bound (see src/tokens/*). The control is
 * `w-full`-capable: segments are `flex-1`, so it sizes to content when placed
 * inline (desktop, trailing the row text) and distributes equally when the
 * consuming SettingsRow drops it to a full-width second row under `md`.
 */
export interface SegmentedOption<T extends string> {
  /** The value reported to `onChange` when this segment is selected. */
  value: T;
  /** The visible segment text. Maps to the Figma label layer (Meta type). */
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  /** The selectable options, left-to-right. */
  options: SegmentedOption<T>[];
  /** The currently-selected value (controlled). */
  value: T;
  /** Fired with the next value when a segment is selected (click / keyboard). */
  onChange: (value: T) => void;
  /**
   * Tone of the selected pill, matching the row it lives in:
   *   - `"accent"` (default) → `--bg-accent-strong` fill (Reading accent row)
   *   - `"info"`             → `--feedback-info` fill (Translation language row)
   */
  tone?: "info" | "accent";
  /** Accessible name for the group. Provide this or `aria-labelledby`. */
  "aria-label"?: string;
  /** Id of an element naming the group. Provide this or `aria-label`. */
  "aria-labelledby"?: string;
  /** Extra classes on the track — e.g. `w-full` for the wrapped mobile row. */
  className?: string;
}

// Track: row of segments, 4px gap (--space-xs). `inline-flex` so it shrinks to
// content inline; segments are `flex-1`, so a `w-full` track stretches them
// equally. `items-stretch` keeps every segment the same height.
const track = "inline-flex items-stretch gap-[var(--space-xs)]";

// Segment box: pill geometry (12px x via --space-md, 7px y via --space-chip-y —
// the canonical pill vertical padding), pill radius, Meta type (Baloo 2 Bold
// 13/18), AA-visible 2px focus ring. All token-bound.
const segment =
  "flex-1 inline-flex items-center justify-center whitespace-nowrap select-none cursor-pointer " +
  "px-[var(--space-md)] py-[var(--space-chip-y)] rounded-[var(--radius-pill)] " +
  "font-[family-name:var(--text-meta-family)] text-[length:var(--text-meta-size)] " +
  "leading-[var(--text-meta-line-height)] [font-weight:var(--text-meta-weight)] " +
  "tracking-[var(--text-meta-tracking)] " +
  "transition-colors outline-none " +
  "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]";

// Selected segment: tone fill + on-accent text + a soft tone-tinted glow.
//   accent → --bg-accent-strong fill + --shadow-accent-glow (terracotta glow).
//   info   → --feedback-info fill + --shadow-info-glow (sky/info glow).
const selectedByTone: Record<"info" | "accent", string> = {
  info:
    "bg-[var(--feedback-info)] text-[var(--text-on-accent)] " +
    "shadow-[var(--shadow-info-glow)]",
  accent:
    "bg-[var(--bg-accent-strong)] text-[var(--text-on-accent)] " +
    "shadow-[var(--shadow-accent-glow)]",
};

// Unselected segment: transparent track, secondary text; subtle hover lift.
const unselected =
  "bg-transparent text-[var(--text-secondary)] " +
  "hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  tone = "accent",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: SegmentedControlProps<T>) {
  const groupId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // The roving tab stop falls on the selected segment, or the first when the
  // current value isn't among the options.
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  const select = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    // Move focus with selection (native radiogroup behaviour).
    refs.current[index]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const last = options.length - 1;
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = selectedIndex === last ? 0 : selectedIndex + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = selectedIndex === 0 ? last : selectedIndex - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      onKeyDown={onKeyDown}
      className={[track, className].filter(Boolean).join(" ")}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            id={`${groupId}-${option.value}`}
            aria-checked={checked}
            tabIndex={index === selectedIndex ? 0 : -1}
            onClick={() => select(index)}
            className={[
              segment,
              checked ? selectedByTone[tone] : unselected,
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
