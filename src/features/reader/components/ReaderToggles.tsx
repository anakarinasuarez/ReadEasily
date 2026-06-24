"use client";

import { ChevronDownIcon, GlobeIcon, UsFlagIcon } from "./icons";

/**
 * ReaderToggles — the header's compact pills (Figma node 1159:3382):
 *  • ES — the translation-language pill. This pass it TOGGLES the Spanish
 *    translation block on/off (a real same-screen control), reflected as
 *    `aria-pressed`. A future pass turns the caret into a language menu.
 *  • US — the audio-voice pill. Audio is deferred to a later phase, so this pill
 *    is PRESENT (per Figma) but inert — disabled with an sr-only "coming soon"
 *    note, never a dead-looking active control.
 *
 * Both render at both breakpoints (compact pills). Token-bound throughout; the
 * 0.92 frame opacity matches the Figma pill (same allowed literal the PlayerBar
 * uses).
 */
export interface ReaderTogglesProps {
  /** Whether the Spanish translation block is shown (drives the ES pill). */
  translationVisible: boolean;
  /** Toggle the translation block. */
  onToggleTranslation: () => void;
  /** Whether the story even has a translation (ES pill hides when it doesn't). */
  hasTranslation: boolean;
}

const pillBase =
  "inline-flex items-center gap-[6px] rounded-[var(--radius-pill)] " +
  "bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] pl-[12px] pr-[8px] py-[12px] opacity-[0.92] " +
  "[font-family:var(--text-meta-family)] [font-size:var(--text-meta-size)] " +
  "[font-weight:var(--text-meta-weight)] [line-height:var(--text-meta-line-height)] " +
  "outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]";

export function ReaderToggles({
  translationVisible,
  onToggleTranslation,
  hasTranslation,
}: ReaderTogglesProps) {
  return (
    <div className="flex items-center gap-[10px]">
      {hasTranslation && (
        <button
          type="button"
          aria-pressed={translationVisible}
          onClick={onToggleTranslation}
          className={[
            pillBase,
            "transition-colors hover:bg-[var(--bg-accent-subtle)]",
            translationVisible
              ? "text-[color:var(--text-primary)]"
              : "text-[color:var(--text-muted)]",
          ].join(" ")}
        >
          <span className="sr-only">
            {translationVisible ? "Hide" : "Show"} Spanish translation
          </span>
          <span
            aria-hidden="true"
            className="inline-flex size-[14px] items-center justify-center [&>svg]:size-full"
          >
            <GlobeIcon />
          </span>
          <span aria-hidden="true">ES</span>
          <span
            aria-hidden="true"
            className="inline-flex size-[14px] items-center justify-center [&>svg]:size-full"
          >
            <ChevronDownIcon />
          </span>
        </button>
      )}

      {/* US voice pill — present but inert this pass (audio deferred). */}
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={[
          pillBase,
          "text-[color:var(--text-muted)] cursor-not-allowed opacity-70",
        ].join(" ")}
      >
        <span className="sr-only">Audio voice — coming soon</span>
        <span
          aria-hidden="true"
          className="inline-flex size-[16px] items-center justify-center [&>svg]:size-full"
        >
          <UsFlagIcon />
        </span>
        <span aria-hidden="true">US</span>
        <span
          aria-hidden="true"
          className="inline-flex size-[14px] items-center justify-center [&>svg]:size-full"
        >
          <ChevronDownIcon />
        </span>
      </button>
    </div>
  );
}
