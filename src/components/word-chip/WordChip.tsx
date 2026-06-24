"use client";

import {
  forwardRef,
  useId,
  useState,
  type ComponentPropsWithoutRef,
} from "react";

export interface WordChipProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onSelect"> {
  /** The English key word — the chip's front face and the default name. */
  word: string;
  /** The meaning shown on the back face once the chip is flipped. */
  translation: string;
  /** Optional part of speech (e.g. "noun") appended muted on the back face. */
  pos?: string;
  /** Whether the word is already saved. Drives the "+" → saved state. */
  saved?: boolean;
  /** Fired by the "+" / saved button. The consumer owns the saved state. */
  onSave?: () => void;
  /** Extra classes merged onto the pill container. */
  className?: string;
}

/** Join class fragments, dropping falsy ones. */
function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------------------------------------------------
 * Decorative glyphs — aria-hidden, the accessible name lives on the button.
 * 16x16 viewBox, currentColor so they inherit the button's token text color.
 * ------------------------------------------------------------------------- */
function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M8 3.5v9M3.5 8h9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Token-bound class fragments. Every color / radius resolves to a CSS custom
 * property from src/tokens/*. The only literals are the badge-internal
 * geometry (pl 14 = --space-chip-x, pr 7, py 5, gap 6) — measured from Figma
 * node 844:1159; they sit deliberately off the 4/8/12 spacing ramp, the same
 * "measured geometry literal" precedent as WordPopover's header insets.
 * ------------------------------------------------------------------------- */

/** Meta type = Baloo 2 Bold 13/18 — the Figma word-chip label style. */
const metaType = cn(
  "[font-family:var(--text-meta-family)] [font-size:var(--text-meta-size)]",
  "[font-weight:var(--text-meta-weight)] [line-height:var(--text-meta-line-height)]",
  "[letter-spacing:var(--text-meta-tracking)]",
);

/** AA-visible 2px focus ring (design law), tracking the brand accent. */
const focusRing = cn(
  "outline-none",
  "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]",
);

/**
 * WordChip — the interactive "key word you'll learn" chip on Story Detail
 * (Figma word-chips 844:1158, individual chip 844:1159).
 *
 * PRESENTATIONAL. Two NON-nested interactive parts inside one pill:
 *   1. The chip body — a `<button aria-expanded>` that flips the pill in place
 *      (front = the English word, back = its meaning). Flip state is purely
 *      visual, so it is internal `useState`. The motion is a ~200ms 3D flip
 *      (morph); under `prefers-reduced-motion` it collapses to an instant swap.
 *      Both faces are stacked in one grid cell, so the pill width is the max of
 *      the two faces — flipping never reflows the row.
 *   2. A sibling "+" `<button aria-pressed>` (NOT inside the body button — that
 *      would be the nested-interactive trap) that fires `onSave`. The consumer
 *      owns `saved`; this component only signals intent.
 *
 * Reads only semantic tokens, so it is theme-agnostic.
 */
export const WordChip = forwardRef<HTMLDivElement, WordChipProps>(
  function WordChip(
    { word, translation, pos, saved = false, onSave, className, ...rest },
    ref,
  ) {
    const [flipped, setFlipped] = useState(false);
    const backId = useId();

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-[var(--radius-pill)]",
          "border border-[var(--border-accent)] bg-[var(--bg-elevated)]",
          // Badge-internal geometry (Figma 844:1159): pl 14 (=--space-chip-x),
          // pr 7, py 5, gap 6 — off-ramp measured literals (see header note).
          "gap-[6px] pl-[var(--space-chip-x)] pr-[7px] py-[5px]",
          className,
        )}
        {...rest}
      >
        {/* Body — the flip trigger. Disclosure pattern: aria-expanded reflects
            whether the meaning (back face) is revealed. */}
        <button
          type="button"
          aria-expanded={flipped}
          aria-controls={backId}
          onClick={() => setFlipped((f) => !f)}
          className={cn(
            "inline-grid rounded-[var(--radius-sm)] text-left [perspective:600px]",
            focusRing,
          )}
        >
          <span
            className={cn(
              "inline-grid transition-transform duration-200 ease-out",
              "[transform-style:preserve-3d]",
              "motion-reduce:transition-none motion-reduce:duration-0",
            )}
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            {/* Front face — the English word. */}
            <span
              aria-hidden={flipped}
              className={cn(
                "[grid-area:1/1] whitespace-nowrap text-[color:var(--text-accent)]",
                "[backface-visibility:hidden] [-webkit-backface-visibility:hidden]",
                metaType,
              )}
            >
              {word}
            </span>
            {/* Back face — the meaning (pre-rotated so it reads correctly once
                the wrapper flips). */}
            <span
              id={backId}
              aria-hidden={!flipped}
              className={cn(
                "[grid-area:1/1] whitespace-nowrap text-[color:var(--text-primary)]",
                "[backface-visibility:hidden] [-webkit-backface-visibility:hidden]",
                "[transform:rotateY(180deg)]",
                metaType,
              )}
            >
              {translation}
              {pos != null && pos !== "" && (
                <span className="ml-[var(--space-xs)] text-[color:var(--text-muted)]">
                  {pos}
                </span>
              )}
            </span>
          </span>
        </button>

        {/* Save — a SIBLING button (never nested in the body). */}
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? `Saved ${word}` : `Save ${word}`}
          onClick={onSave}
          className={cn(
            "inline-flex size-[24px] shrink-0 items-center justify-center rounded-[var(--radius-pill)]",
            "transition-colors",
            saved
              ? "bg-[var(--bg-accent-strong)] text-[color:var(--text-on-accent)]"
              : cn(
                  "bg-[var(--bg-subtle)] text-[color:var(--text-muted)]",
                  "hover:bg-[var(--bg-accent-subtle)] hover:text-[color:var(--text-accent)]",
                ),
            focusRing,
          )}
        >
          <span
            aria-hidden="true"
            className="inline-flex size-[12px] items-center justify-center [&>svg]:size-full"
          >
            {saved ? <CheckIcon /> : <PlusIcon />}
          </span>
        </button>
      </div>
    );
  },
);
