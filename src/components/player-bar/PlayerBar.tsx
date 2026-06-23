"use client";

import {
  forwardRef,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { IconButton } from "../../ui/icon-button";

/** Discrete audio readiness. `disabled` = no audio for this story → every
 * transport control is inert so the Reader never shows a dead play button. */
export type PlayerBarStatus = "ready" | "loading" | "disabled";

export interface PlayerBarProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "role" | "aria-label" | "children"
  > {
  /** Whether audio is currently playing (controlled). Drives the play↔pause glyph. */
  playing?: boolean;
  /** Audio readiness. `disabled` means no audio is available. */
  status?: PlayerBarStatus;
  /** Playback position as a fraction, 0..1. Clamped internally. */
  progress?: number;
  /** Elapsed time label, e.g. "0:42". */
  elapsedLabel?: string;
  /** Total duration label, e.g. "3:10". */
  totalLabel?: string;
  /** Number of sentences → renders one tick per internal sentence boundary and
   * sets the keyboard seek step to one sentence. */
  sentenceCount?: number;
  /** Current playback speed (the feature owns the value; clicking cycles it). */
  speed?: number;
  /** Story CEFR level shown in the trailing chip, e.g. "A2". Hidden when unset. */
  level?: string;
  /** Toggle play/pause. */
  onTogglePlay?: () => void;
  /** Seek to a fraction (0..1) — from keyboard, pointer drag or track click. */
  onSeek?: (fraction: number) => void;
  /** Step to the previous sentence. */
  onPrevSentence?: () => void;
  /** Step to the next sentence. */
  onNextSentence?: () => void;
  /** Restart from the beginning. */
  onRestart?: () => void;
  /** Skip to the end. */
  onSkipEnd?: () => void;
  /** Cycle the playback speed (0.75 → 1 → 1.25 → 1.5 → 0.75). */
  onCycleSpeed?: () => void;
  /** Open the reader settings panel (font size, etc.). */
  onOpenSettings?: () => void;
}

/** Join class fragments, dropping falsy ones. */
function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Clamp to the unit interval. */
function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/* ---------------------------------------------------------------------------
 * Token-bound class fragments. Every color / radius / shadow / space resolves
 * to a CSS custom property from src/tokens/*. The only literals are the
 * geometry the design system does not tokenize and which the spec explicitly
 * allows: the 0.92 frame opacity, the 14px knob, the 4px rail/fill height, the
 * 3px ticks, the 56px primary footprint, and the off-scale 22px/30px padding.
 * Each is commented at its use site.
 *
 * NOTE on the 16px values: the design-lead spec calls the vertical gap / top
 * padding "--space-md (16)", but in our tokens --space-md resolves to 12px and
 * --space-lg to 16px. Figma (node 1128:2573) measures 16px, so — Figma being
 * the source of truth — these bind to --space-lg (16px). Flagged in the report.
 * ------------------------------------------------------------------------- */

const rootClasses = cn(
  "flex w-full flex-col gap-[var(--space-lg)]", // 16px gap (Figma) = --space-lg
  "rounded-t-[var(--radius-xl)] bg-[var(--bg-elevated)]",
  "overflow-hidden",
  "pt-[var(--space-lg)] pb-[22px] px-[30px]", // 16 / 22 / 30 — 22+30 off-scale literals (Figma)
);

/** Elapsed / total time — Heading/H4 (Baloo 2 SemiBold 16/26), secondary ink. */
const timeClasses = cn(
  "shrink-0 whitespace-nowrap tabular-nums text-[var(--text-secondary)]",
  "[font-family:var(--text-heading-h4-family)] [font-size:var(--text-heading-h4-size)]",
  "[font-weight:var(--text-heading-h4-weight)] [line-height:var(--text-heading-h4-line-height)]",
);

/** Meta type (Baloo 2 Bold 13/18) — shared by the speed pill and level chip. */
const metaTypeClasses = cn(
  "[font-family:var(--text-meta-family)] [font-size:var(--text-meta-size)]",
  "[font-weight:var(--text-meta-weight)] [line-height:var(--text-meta-line-height)]",
);

/** Shared AA-visible keyboard focus ring (design law: 2px, never removed). */
const focusRing = cn(
  "outline-none",
  "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]",
);

/**
 * Round 40px transport frame override for IconButton. Figma renders these as
 * bg/elevated at 92% opacity; Tailwind can't apply an alpha to a CSS-var color,
 * so — matching Figma, which sets opacity on the whole frame — we dim the entire
 * control with `opacity-[0.92]`. Hover restores full opacity and tints. The
 * bg/hover here win over IconButton's `subtle` defaults because className is
 * concatenated last.
 */
const roundBtnClasses = cn(
  "bg-[var(--bg-elevated)] opacity-[0.92]", // 0.92 = Figma frame opacity (allowed literal)
  "hover:opacity-100 hover:bg-[var(--bg-accent-subtle)]",
);

/** Speed pill / level chip shell. */
const chipBaseClasses = cn(
  "inline-flex items-center justify-center rounded-[var(--radius-pill)]",
  "bg-[var(--bg-elevated)] opacity-[0.92]", // 0.92 = Figma frame opacity (allowed literal)
  metaTypeClasses,
);

/* ---------------------------------------------------------------------------
 * Glyphs. All decorative (aria-hidden); the accessible name lives on the
 * button. 24px viewBox so they scale crisply inside the icon boxes.
 * ------------------------------------------------------------------------- */

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6.5" y="5" width="3.5" height="14" rx="1.25" />
      <rect x="14" y="5" width="3.5" height="14" rx="1.25" />
    </svg>
  );
}

function RestartGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12a8 8 0 1 0 2.34-5.66M4 4v4h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PrevGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15 5.5v13a1 1 0 0 1-1.55.83l-8-6.5a1 1 0 0 1 0-1.66l8-6.5A1 1 0 0 1 15 5.5Z" />
    </svg>
  );
}

function NextGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 5.5v13a1 1 0 0 0 1.55.83l8-6.5a1 1 0 0 0 0-1.66l-8-6.5A1 1 0 0 0 9 5.5Z" />
    </svg>
  );
}

function SkipEndGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5 5.5v13a1 1 0 0 0 1.55.83l8-6.5a1 1 0 0 0 0-1.66l-8-6.5A1 1 0 0 0 5 5.5Z" />
      <rect x="17" y="5" width="2.5" height="14" rx="1" />
    </svg>
  );
}

function SettingsGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * PlayerBar — the Reader's fixed bottom audio control bar (Figma node
 * 1128:2573, Player Bar / Desktop).
 *
 * PRESENTATIONAL + fully controlled: it never plays audio. The Reader feature
 * wires Web Speech / playback and passes `playing`, `progress`, `speed`, … plus
 * the `on*` handlers. Reads only semantic tokens, so it is theme-agnostic.
 *
 * Anatomy: a progress row (seekable slider with per-sentence ticks + draggable
 * playhead) over a transport row (speed pill · restart · prev · play/pause ·
 * next · skip-to-end · level chip · settings). Round controls reuse the
 * IconButton primitive; the 56px primary play button is bespoke (above
 * IconButton's size scale).
 *
 * States: `ready` (idle/playing), `loading` (play button buffers), `disabled`
 * (no audio — every control inert + an sr-only note). Focus is visibly AA on
 * every control; the playhead transition honors prefers-reduced-motion.
 */
export const PlayerBar = forwardRef<HTMLDivElement, PlayerBarProps>(
  function PlayerBar(
    {
      playing = false,
      status = "ready",
      progress = 0,
      elapsedLabel,
      totalLabel,
      sentenceCount,
      speed = 1,
      level,
      onTogglePlay,
      onSeek,
      onPrevSentence,
      onNextSentence,
      onRestart,
      onSkipEnd,
      onCycleSpeed,
      onOpenSettings,
      className,
      ...rest
    },
    ref,
  ) {
    const hintId = useId();
    const trackRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);

    const isDisabled = status === "disabled";
    const isLoading = status === "loading";

    const value = clamp01(progress);
    const pct = value * 100;
    const valueNow = Math.round(pct);
    const speedLabel = `${speed}×`;

    // Keyboard/seek granularity: one sentence when we know the count, else 5%.
    const step =
      sentenceCount && sentenceCount > 0 ? 1 / sentenceCount : 0.05;

    const valueText =
      elapsedLabel && totalLabel
        ? `${elapsedLabel} of ${totalLabel}`
        : `${valueNow}%`;

    // Internal sentence boundaries → one tick each (none for ≤1 sentence).
    const tickFractions: number[] =
      sentenceCount && sentenceCount > 1
        ? Array.from(
            { length: sentenceCount - 1 },
            (_, i) => (i + 1) / sentenceCount,
          )
        : [];

    const seekTo = (fraction: number) => onSeek?.(clamp01(fraction));

    const seekFromClientX = (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      seekTo((clientX - rect.left) / rect.width);
    };

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      let next: number | null = null;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = value + step;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = value - step;
          break;
        case "PageUp":
          next = value + 0.1;
          break;
        case "PageDown":
          next = value - 0.1;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      seekTo(next);
    };

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
      // Primary button / touch only.
      if (event.button !== 0 && event.pointerType === "mouse") return;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      seekFromClientX(event.clientX);
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      seekFromClientX(event.clientX);
    };

    const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      setDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    };

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Audio player"
        className={cn(rootClasses, className)}
        {...rest}
      >
        {isDisabled && (
          <p id={hintId} className="sr-only">
            Audio is unavailable for this story.
          </p>
        )}

        {/* Row 1 — progress */}
        <div className="flex w-full items-center gap-[var(--space-md-plus)]">
          <span className={timeClasses}>{elapsedLabel ?? "0:00"}</span>

          <div
            ref={trackRef}
            role="slider"
            aria-label="Playback position"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={valueNow}
            aria-valuetext={valueText}
            aria-disabled={isDisabled || undefined}
            aria-describedby={isDisabled ? hintId : undefined}
            tabIndex={isDisabled ? -1 : 0}
            onKeyDown={isDisabled ? undefined : handleKeyDown}
            onPointerDown={isDisabled ? undefined : handlePointerDown}
            onPointerMove={isDisabled ? undefined : handlePointerMove}
            onPointerUp={isDisabled ? undefined : endDrag}
            onPointerCancel={isDisabled ? undefined : endDrag}
            className={cn(
              "relative h-[8px] flex-1 touch-none select-none",
              isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              "focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:4px] outline-none",
            )}
          >
            {/* Rail — full-width unfilled track */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-[4px] w-full -translate-y-1/2 rounded-[var(--radius-pill)] bg-[var(--border-default)]"
            />
            {/* Filled segment (4px tall, 2px radius per Figma) */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-[4px] -translate-y-1/2 rounded-[2px] bg-[var(--bg-accent)]"
              style={{ width: `${pct}%` }}
            />
            {/* Per-sentence boundary ticks (3px dots) */}
            {tickFractions.map((f, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute top-1/2 size-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--border-strong)]"
                style={{ left: `${f * 100}%` }}
              />
            ))}
            {/* Draggable playhead knob (14px) */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1/2 size-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full",
                "border-2 border-[var(--bg-elevated)] bg-[var(--bg-accent)] shadow-[var(--shadow-sm)]",
                !dragging && "transition-[left] duration-150 ease-out",
                "motion-reduce:transition-none",
              )}
              style={{ left: `${pct}%` }}
            />
          </div>

          <span className={timeClasses}>{totalLabel ?? "0:00"}</span>
        </div>

        {/* Row 2 — transport */}
        <div
          role="group"
          aria-label="Playback controls"
          className="flex w-full items-center gap-[var(--space-md-plus)]"
        >
          {/* Speed pill */}
          <button
            type="button"
            onClick={onCycleSpeed}
            disabled={isDisabled}
            aria-disabled={isDisabled || undefined}
            aria-describedby={isDisabled ? hintId : undefined}
            aria-label={`Playback speed, ${speedLabel}`}
            className={cn(
              chipBaseClasses,
              "px-[18px] py-[8px] text-[var(--text-primary)]", // 18/8 = Figma pill padding (off-scale literals)
              "transition-opacity hover:opacity-100",
              focusRing,
              "disabled:cursor-not-allowed disabled:text-[var(--text-muted)]",
            )}
          >
            <span aria-hidden="true">{speedLabel}</span>
          </button>

          {/* Spacer */}
          <span aria-hidden="true" className="flex-1" />

          <IconButton
            size="md"
            icon={<RestartGlyph />}
            aria-label="Restart"
            disabled={isDisabled}
            onClick={onRestart}
            className={roundBtnClasses}
          />
          <IconButton
            size="md"
            icon={<PrevGlyph />}
            aria-label="Previous sentence"
            disabled={isDisabled}
            onClick={onPrevSentence}
            className={roundBtnClasses}
          />

          {/* Primary play / pause (56px — above IconButton's scale) */}
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={isDisabled || isLoading}
            aria-disabled={isDisabled || undefined}
            aria-busy={isLoading || undefined}
            aria-describedby={isDisabled ? hintId : undefined}
            aria-label={isLoading ? "Loading audio" : playing ? "Pause" : "Play"}
            className={cn(
              "relative inline-flex size-[56px] shrink-0 items-center justify-center", // 56px = Figma primary footprint
              "rounded-[var(--radius-pill)] bg-[var(--bg-accent)] text-[var(--text-on-accent)]",
              "shadow-[var(--shadow-accent-glow)] transition-colors",
              "hover:bg-[var(--bg-accent-hover)]",
              focusRing,
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {isLoading ? (
              <Spinner className="size-[24px]" />
            ) : (
              <span
                aria-hidden="true"
                className="inline-flex size-[24px] items-center justify-center [&>svg]:size-full"
              >
                {playing ? <PauseGlyph /> : <PlayGlyph />}
              </span>
            )}
          </button>

          <IconButton
            size="md"
            icon={<NextGlyph />}
            aria-label="Next sentence"
            disabled={isDisabled}
            onClick={onNextSentence}
            className={roundBtnClasses}
          />
          <IconButton
            size="md"
            icon={<SkipEndGlyph />}
            aria-label="Skip to end"
            disabled={isDisabled}
            onClick={onSkipEnd}
            className={roundBtnClasses}
          />

          {/* Spacer */}
          <span aria-hidden="true" className="flex-1" />

          {/* Level chip (decorative-ish: just surfaces the story level) */}
          {level != null && level !== "" && (
            <span
              className={cn(
                chipBaseClasses,
                "px-[14px] py-[8px] text-[var(--text-secondary)]", // 14/8 = Figma chip padding
                // Dim with the rest of the bar when there's no audio, so the
                // disabled state doesn't read as half-active.
                isDisabled && "opacity-50",
              )}
            >
              <span className="sr-only">Story level </span>
              {level}
            </span>
          )}

          <IconButton
            size="md"
            icon={<SettingsGlyph />}
            aria-label="Settings"
            disabled={isDisabled}
            onClick={onOpenSettings}
            className={roundBtnClasses}
          />
        </div>
      </div>
    );
  },
);
