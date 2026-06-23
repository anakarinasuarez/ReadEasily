"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "../../ui/button";

export type WordPopoverStatus = "ready" | "loading" | "error";

export interface WordPopoverProps {
  /** The tapped word — the popover's heading and accessible name. */
  word: string;
  /** Part of speech (e.g. "noun"). Renders the POS pill only when provided. */
  pos?: string;
  /** The Spanish meaning (may be comma-joined senses). Shown when `ready`. */
  translation?: string;
  /**
   * Data lifecycle. `ready` (default) shows POS + translation; `loading`
   * swaps them for skeletons; `error` shows an inline retry affordance. The
   * header word is always shown — driven entirely by props, never fetched here.
   */
  status?: WordPopoverStatus;
  /** Whether the word is already saved. Drives the Save↔Saved button. */
  saved?: boolean;
  /** Fired by the header pronounce chip. */
  onPronounce?: () => void;
  /** Fired by the Save / Saved button (consumer flips `saved`). */
  onToggleSave?: () => void;
  /** Fired by the Practice button. */
  onPractice?: () => void;
  /** Fired by the error-state retry affordance. */
  onRetry?: () => void;
  /**
   * Fired on Esc and on the close button. The CONSUMER owns the originating
   * word token, so restoring focus to it on close is the consumer's job — this
   * primitive only signals intent.
   */
  onClose?: () => void;
  /** Extra classes merged onto the dialog root (e.g. width / positioning). */
  className?: string;
}

/** Join class fragments, dropping falsy ones. */
function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------------------------------------------------
 * Decorative glyphs. All aria-hidden — the accessible name lives on the
 * control. 24x24 viewBox, currentColor stroke/fill so they inherit token text.
 * ------------------------------------------------------------------------- */
function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 9v6h4l5 4V5L8 9H4Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

/** Outline bookmark — the unsaved state. */
function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M6 4h12v16l-6-4-6 4V4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Filled bookmark — the saved state. */
function BookmarkFilledIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M6 4h12v16l-6-4-6 4V4Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 12a8 8 0 1 1 2.3 5.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 18v-4h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tags whose elements are tabbable when not disabled. */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => !el.hasAttribute("hidden") && el.getAttribute("aria-hidden") !== "true");
}

/* ---------------------------------------------------------------------------
 * Token-bound class fragments. Every color / radius / shadow / space resolves
 * to a CSS custom property. The only literals are the header's translucent
 * white-wash alphas (rgba(255,255,255,.18–.32) on the pronounce chip + close
 * button) — the same pattern as the --scrim token, commented at each use site.
 * ------------------------------------------------------------------------- */

/** Header controls sit on --bg-accent-strong, where the terracotta --focus-ring
 *  is too low-contrast. They use a white (--text-on-accent) ring so keyboard
 *  focus is visibly AA against the accent. Body controls use the shared ring. */
const headerFocus = cn(
  "outline-none",
  "focus-visible:[outline:2px_solid_var(--text-on-accent)] focus-visible:[outline-offset:2px]",
);
const bodyFocus = cn(
  "outline-none",
  "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]",
);

const wordClasses = cn(
  "text-[color:var(--text-on-accent)] [word-break:break-word]",
  // Title/L = Baloo 2 SemiBold 24. No dedicated token in the ramp (Display/L 44
  // → Heading/H3 22 → H4 16), so the family/weight bind to tokens and the 24px
  // size is the one Figma-measured geometry literal. ASSUMPTION noted in report.
  "[font-family:var(--font-display)] [font-weight:var(--font-weight-semibold)]",
  "[font-size:24px] leading-none",
);

const posPillClasses = cn(
  "inline-flex items-start self-start rounded-[var(--radius-pill)]",
  "bg-[var(--bg-canvas)] border border-[var(--border-default)]",
  "px-[var(--space-md)] py-[5px]",
  "text-[color:var(--text-secondary)]",
  "[font-family:var(--text-label-m-family)] [font-size:var(--text-label-m-size)]",
  "[font-weight:var(--text-label-m-weight)] [line-height:var(--text-label-m-line-height)]",
  "[letter-spacing:var(--text-label-m-tracking)]",
);

const translationClasses = cn(
  "text-[color:var(--text-primary)] [word-break:break-word]",
  // Nunito Bold 20 — design-lead-measured. Family/weight bind to tokens; the
  // 20px size + 28px line-height are the measured geometry literals.
  "font-ui font-bold [font-size:20px] leading-[28px]",
);

/**
 * WordPopover — the Reader's tap-a-word panel (Figma node 1158:4019).
 *
 * PRESENTATIONAL + CONTROLLED: it renders meaning / pronunciation / actions
 * from props and emits intent via callbacks. It never fetches a translation or
 * calls an API — the feature supplies `translation`/`pos`/`status` and the
 * handlers. Reads only semantic tokens, so it is theme-agnostic.
 *
 * It is a modal-by-behaviour panel: `role="dialog" aria-modal="true"`, labelled
 * by the header word. On mount it moves focus to the first control and traps Tab
 * within itself; Esc fires `onClose`. Returning focus to the originating word
 * token on close is the CONSUMER's responsibility (it owns that token).
 *
 * Entrance is a 200ms fade (overlay motion law); under `prefers-reduced-motion`
 * the transition is removed (fade-only, no scale/slide ever).
 */
export const WordPopover = forwardRef<HTMLDivElement, WordPopoverProps>(
  function WordPopover(
    {
      word,
      pos,
      translation,
      status = "ready",
      saved = false,
      onPronounce,
      onToggleSave,
      onPractice,
      onRetry,
      onClose,
      className,
    },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

    const titleId = useId();

    // On mount: move focus to the first actionable control inside the panel.
    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const focusables = getFocusable(root);
      focusables[0]?.focus();
    }, []);

    // Esc → onClose; Tab/Shift+Tab cycle within the panel (focus trap).
    const handleKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose?.();
          return;
        }
        if (event.key !== "Tab") return;

        const root = rootRef.current;
        if (!root) return;
        const focusables = getFocusable(root);
        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (event.shiftKey) {
          if (active === first || !root.contains(active)) {
            event.preventDefault();
            last.focus();
          }
        } else if (active === last || !root.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      },
      [onClose],
    );

    const showSkeleton = status === "loading";
    const showError = status === "error";
    const showContent = status === "ready";

    return (
      <div
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        // Tell AT the panel is fetching its meaning so an SR user who opens
        // during load hears "busy" rather than the word followed by silence.
        aria-busy={status === "loading" || undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-[320px] max-w-full flex-col overflow-clip",
          "rounded-[var(--radius-card)] bg-[var(--bg-elevated)] shadow-[var(--shadow-popover)]",
          // Overlay motion law: 200ms fade in. Reduced-motion removes it; we
          // never scale or slide, so reduce just drops the opacity transition.
          "transition-opacity duration-200 ease-out opacity-100",
          "motion-safe:starting:opacity-0 motion-reduce:transition-none",
          className,
        )}
      >
        {/* Header — accent bar: word + pronounce chip on the left, close right */}
        <div className="flex items-center justify-between bg-[var(--bg-accent-strong)] pl-[22px] pr-[18px] py-[var(--space-md)]">
          <div className="flex items-center gap-[var(--space-md)]">
            <p id={titleId} className={wordClasses}>
              {word}
            </p>
            <button
              type="button"
              onClick={onPronounce}
              aria-label={`Pronounce ${word}`}
              className={cn(
                "inline-flex size-[30px] shrink-0 items-center justify-center rounded-[var(--radius-pill)]",
                // Allowed literal: translucent-white wash over the accent header,
                // same pattern as the --scrim token. Not a themable surface.
                "bg-[rgba(255,255,255,0.22)] hover:bg-[rgba(255,255,255,0.32)] transition-colors",
                "text-[color:var(--text-on-accent)]",
                headerFocus,
              )}
            >
              <span
                aria-hidden="true"
                className="inline-flex size-[16px] items-center justify-center [&>svg]:size-full"
              >
                <SpeakerIcon />
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            // -m-1 p-1 grows the hit target past the 20px glyph (AA 2.5.8)
            // while keeping the glyph visually 20px and right-aligned.
            className={cn(
              "-m-1 inline-flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] p-1",
              "text-[color:var(--text-on-accent)]",
              "hover:bg-[rgba(255,255,255,0.18)] transition-colors",
              headerFocus,
            )}
          >
            <span
              aria-hidden="true"
              className="inline-flex size-[20px] items-center justify-center [&>svg]:size-full"
            >
              <XIcon />
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-[var(--space-md-plus)] bg-[var(--bg-elevated)] px-[22px] pb-[var(--space-xl)] pt-[18px]">
          {showContent && pos != null && pos !== "" && (
            <span className={posPillClasses}>{pos}</span>
          )}

          {showContent && (
            <div className="flex items-center gap-[10px]">
              <span
                aria-hidden="true"
                className="inline-flex size-[18px] shrink-0 items-center justify-center text-[color:var(--color-sky-500)] [&>svg]:size-full"
              >
                <GlobeIcon />
              </span>
              <p className={translationClasses}>{translation}</p>
            </div>
          )}

          {showSkeleton && <Skeleton />}

          {showError && (
            <div
              role="alert"
              className="flex items-center gap-[var(--space-sm)]"
            >
              <p className="text-[color:var(--feedback-danger)] [font-family:var(--text-ui-m-family)] [font-size:var(--text-ui-m-size)] [line-height:var(--text-ui-m-line-height)]">
                Couldn&rsquo;t load
              </p>
              <button
                type="button"
                onClick={onRetry}
                className={cn(
                  "inline-flex items-center gap-[var(--space-xs)] rounded-[var(--radius-sm)] px-[var(--space-xs)] py-[2px]",
                  "text-[color:var(--text-accent)] underline underline-offset-2",
                  "[font-family:var(--text-ui-m-family)] [font-size:var(--text-ui-m-size)] [font-weight:var(--font-weight-bold)] [line-height:var(--text-ui-m-line-height)]",
                  "hover:bg-[var(--bg-accent-subtle)] transition-colors",
                  bodyFocus,
                )}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-[14px] items-center justify-center [&>svg]:size-full"
                >
                  <RetryIcon />
                </span>
                Retry
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-start gap-[var(--space-md)] pt-1">
            <Button
              variant="secondary"
              size="md"
              leftIcon={saved ? <BookmarkFilledIcon /> : <BookmarkIcon />}
              aria-pressed={saved}
              onClick={onToggleSave}
            >
              {saved ? "Saved" : "Save word"}
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              leftIcon={<SparkleIcon />}
              onClick={onPractice}
            >
              Practice
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

/** Loading placeholder — token-bound shimmer rows standing in for POS +
 *  translation. aria-hidden: the dialog stays announced via its label. */
function Skeleton(): ReactNode {
  return (
    <div
      aria-hidden="true"
      data-testid="word-popover-skeleton"
      className="flex flex-col gap-[var(--space-md-plus)]"
    >
      <div className="h-[28px] w-[64px] rounded-[var(--radius-pill)] bg-[var(--bg-subtle)] motion-safe:animate-pulse" />
      <div className="h-[24px] w-[180px] rounded-[var(--radius-sm)] bg-[var(--bg-subtle)] motion-safe:animate-pulse" />
    </div>
  );
}
