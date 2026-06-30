"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/ui/button";
import { CheckIcon, RewindIcon } from "./icons";

/**
 * EndOfStory — the "The End" card shown when a story's narration finishes
 * (Figma node 1058:1829, "end-banner"). It floats over the reading area, just
 * above the PlayerBar. Layout 1:1 with Figma: a green check circle + a two-line
 * text block on the left, a terracotta "Read again" button on the right, on an
 * elevated card with a soft warm lift.
 *
 * A11y: the card is a `role="status"` live region so the completion is announced
 * to assistive tech the moment it appears; on mount it moves focus to the
 * "Read again" button (the one and obvious next action), so a keyboard user can
 * restart immediately. "Read again" resets to page 0 and restarts narration.
 */
export interface EndOfStoryProps {
  /** The finished story's title — rendered into the subtitle. */
  storyTitle: string;
  /** Restart from the top (page 0) and replay narration. */
  onReadAgain: () => void;
}

export function EndOfStory({ storyTitle, onReadAgain }: EndOfStoryProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Hand focus to the primary action when the card appears (it is the natural,
  // single next step). The live region still announces the text independently.
  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div
      role="status"
      className={[
        "flex w-full max-w-[745px] items-center justify-between gap-[var(--space-md)]",
        // --radius-card (20) reuses the card radius for the 18px Figma corner
        // (sub-perceptual 2px delta, the project's documented rounding).
        "overflow-clip rounded-[var(--radius-card)] bg-[var(--bg-elevated)] shadow-[var(--shadow-popover)]",
        "pl-[18px] pr-[14px] py-[14px]",
        // Overlay motion law: 200ms fade in; reduced-motion drops it.
        "transition-opacity duration-200 ease-out opacity-100",
        "motion-safe:starting:opacity-0 motion-reduce:transition-none",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-[var(--space-md-plus)]">
        {/* Green check circle (Figma forest-500 / white check). */}
        <span
          aria-hidden="true"
          className="inline-flex h-[44px] w-[46px] shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-forest-500)] text-[color:var(--text-on-accent)]"
        >
          <span className="inline-flex size-[22px] items-center justify-center [&>svg]:size-full">
            <CheckIcon />
          </span>
        </span>

        <div className="flex min-w-0 flex-col gap-[3px]">
          <p className="text-[color:var(--text-primary)] [font-family:var(--font-ui)] [font-weight:var(--font-weight-bold)] [font-size:18px] leading-none">
            The End
          </p>
          <p className="truncate text-[color:var(--text-muted)] [font-family:var(--text-label-m-family)] [font-size:var(--text-label-m-size)] [font-weight:var(--text-label-m-weight)] [line-height:var(--text-label-m-line-height)] [letter-spacing:var(--text-label-m-tracking)]">
            You finished &ldquo;{storyTitle}&rdquo;
          </p>
        </div>
      </div>

      <Button
        ref={buttonRef}
        variant="primary"
        size="md"
        leftIcon={<RewindIcon />}
        onClick={onReadAgain}
        className="shrink-0"
      >
        Read again
      </Button>
    </div>
  );
}
