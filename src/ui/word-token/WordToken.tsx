import { forwardRef } from "react";

/**
 * WordToken — one tappable word inside the reading passage (Reader, Phase 2).
 *
 * The passage (Reading Card, Figma node 1157:3132 — Lora 28/44, `--text-secondary`)
 * is rendered as a sequence of WordTokens interleaved with plain separator text.
 * Activating a word asks the consumer to open a meaning popover; that popover is a
 * SEPARATE component. WordToken only:
 *   - emits `onActivate` (tap / Enter / Space), and
 *   - reflects the `selected` (popover open) and `speaking` (TTS voicing) states.
 *
 * Design intent:
 *   - It is a real, inline `<button>` so it FLOWS inside the paragraph and stays
 *     keyboard-operable for free (Enter/Space). It inherits the paragraph's font,
 *     size, line-height and color (`[font:inherit] [color:inherit]`) so it never
 *     re-declares the reading type — it sits in a `text-reading-xl` paragraph and
 *     only adds the interactive affordances.
 *   - No state changes layout: the affordances are a background tint + a text
 *     underline + a focus outline, none of which reflow the line or change the
 *     44px line-height. So toggling selected/speaking/hover never shifts the
 *     surrounding words.
 *
 * Roving tabindex is NOT this component's job. The parent ReadingParagraph owns
 * arrow-key navigation and sets `tabIndex` (0 for the active word, -1 for the
 * rest). WordToken honors whatever `tabIndex` it is given and defaults to 0 only
 * when the parent passes nothing (a lone, standalone word is reachable).
 *
 * All visual values are token-bound (see src/tokens/*); there are no hardcoded
 * colors or spacing.
 */
export interface WordTokenProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> {
  /** The surface text shown — also the button's accessible name. */
  word: string;
  /**
   * The word's meaning popover is open. Exposed to assistive tech as
   * `aria-current="true"` (this word is the "current" one in the passage the
   * reader is acting on), and shown as a terracotta underline + subtle tint.
   */
  selected?: boolean;
  /**
   * TTS is currently voicing this word. This is a VISUAL-ONLY state used to
   * track the audio (karaoke-style). It is intentionally NOT announced to
   * assistive tech: a screen-reader user is not listening to the TTS track, and
   * flipping an ARIA state on every word as audio sweeps the passage would spam
   * the AT with dozens of announcements per sentence. So `speaking` adds no
   * ARIA — only a stronger highlight.
   */
  speaking?: boolean;
  /** Fired on tap / Enter / Space. The consumer opens the popover. */
  onActivate?: () => void;
}

// Reset the native button to flow as inline reading text: inherit the
// paragraph's font/color, drop chrome and padding, keep it tappable. A small
// radius rounds the highlight tint and the focus outline. AA focus ring is
// always visible (never removed), offset so it doesn't clip neighbour words.
const base =
  "appearance-none m-0 p-0 inline border-0 bg-transparent cursor-pointer text-left " +
  "[font:inherit] [color:inherit] [letter-spacing:inherit] " +
  "rounded-[var(--radius-sm)] underline-offset-2 " +
  "outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px] " +
  "motion-safe:transition-colors " +
  "disabled:cursor-default";

// speaking ▸ selected ▸ hover ▸ default. None of these affect layout.
// - speaking: strongest — subtle tint + a thicker `--bg-accent-strong` (AA) underline.
// - selected: subtle tint + a `--border-accent` underline.
// - default: looks like plain reading text; the warm affordance appears on hover.
const speakingClasses =
  "bg-[var(--bg-accent-subtle)] underline decoration-2 decoration-[var(--bg-accent-strong)]";
const selectedClasses =
  "bg-[var(--bg-accent-subtle)] underline decoration-[var(--border-accent)]";
const interactiveClasses =
  "enabled:hover:bg-[var(--bg-accent-subtle)] enabled:hover:underline enabled:hover:decoration-[var(--border-accent)]";

export const WordToken = forwardRef<HTMLButtonElement, WordTokenProps>(function WordToken(
  { word, selected = false, speaking = false, tabIndex = 0, onActivate, onClick, className, ...rest },
  ref,
) {
  const stateClasses = speaking ? speakingClasses : selected ? selectedClasses : interactiveClasses;

  return (
    <button
      ref={ref}
      type="button"
      // The word itself is the accessible name (button text content) — no
      // aria-label that could duplicate or drift from the surface text.
      aria-current={selected ? "true" : undefined}
      tabIndex={tabIndex}
      onClick={(event) => {
        onClick?.(event);
        // Native <button> turns Enter/Space into a click, so wiring onClick alone
        // covers keyboard activation without double-firing.
        if (!event.defaultPrevented) onActivate?.();
      }}
      className={[base, stateClasses, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {word}
    </button>
  );
});
