"use client";

import * as React from "react";
import * as Switch from "@radix-ui/react-switch";

/**
 * Size scale, mirroring the Figma `Size` property (SM / MD) on node 19:18.
 * Geometry per size is sourced 1:1 from Figma — see `SIZES` below.
 */
export type ToggleSize = "sm" | "md";

export interface ToggleProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Switch.Root>,
    "asChild" | "children"
  > {
  /** Track + thumb scale. Maps to Figma `Size` (SM/MD). Defaults to `md`. */
  size?: ToggleSize;
  /**
   * Accessible name. Provide this when the switch is standalone (no visible
   * `<label htmlFor>` wired to its `id`). Omit it when an associated label
   * already names the control.
   */
  label?: string;
}

/**
 * Per-size geometry, lifted directly from Figma node 19:18.
 *   MD: track 48x28, thumb 22px, travel left 3px -> 23px.
 *   SM: track 36x20, thumb 14px, travel left 3px -> 19px.
 * Tracks use the pill radius token. Thumb travel is expressed as a
 * `translateX` distance (on.left - off.left) so we animate `transform`,
 * never `left` — same-screen state change motion (~200ms ease-out).
 */
type SizeStyle = { root: string; thumb: string; translate: string };
const SIZE_STYLES: Record<ToggleSize, SizeStyle> = {
  md: {
    root: "h-[28px] w-[48px]",
    thumb: "size-[22px]",
    translate: "data-[state=checked]:translate-x-[20px]",
  },
  sm: {
    root: "h-[20px] w-[36px]",
    thumb: "size-[14px]",
    translate: "data-[state=checked]:translate-x-[16px]",
  },
};

/**
 * Toggle — an accessible on/off switch built on Radix Switch.
 *
 * Radix gives us `role="switch"`, `aria-checked`, Space/Enter activation and
 * focus management for free; we own only the visual contract (tokens, sizes,
 * states, focus ring, motion). Controlled (`checked` + `onCheckedChange`) and
 * uncontrolled (`defaultChecked`) both work — `...rest` spreads to the Root.
 */
export const Toggle = React.forwardRef<
  React.ElementRef<typeof Switch.Root>,
  ToggleProps
>(function Toggle({ size = "md", label, className, ...rest }, ref) {
  const sizing = SIZE_STYLES[size];

  return (
    <Switch.Root
      ref={ref}
      aria-label={label}
      className={[
        // Track: pill, relative for the absolutely-positioned thumb.
        "group relative inline-flex shrink-0 cursor-pointer items-center",
        "rounded-[var(--radius-pill)] outline-none transition-colors",
        sizing.root,
        // Off track / On track colors (Figma: bg/subtle -> feedback/success).
        "bg-[var(--bg-subtle)] data-[state=checked]:bg-[var(--feedback-success)]",
        // Disabled: dim to .6 and stop pointer events. On-disabled uses the
        // success-subtle track; off-disabled keeps the subtle track.
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60",
        "data-[disabled]:data-[state=checked]:bg-[var(--feedback-success-subtle)]",
        // Focus ring (design law, AA): 2px ring + 2px offset on the track.
        "focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]",
        className ?? "",
      ].join(" ")}
      {...rest}
    >
      <Switch.Thumb
        className={[
          // White circle thumb with the sm elevation token.
          "pointer-events-none block translate-x-[3px] rounded-[var(--radius-pill)]",
          "bg-[var(--color-white)] shadow-[var(--shadow-sm)]",
          sizing.thumb,
          // Same-screen state change: animate transform, not `left`.
          "transition-transform duration-200 ease-out",
          "motion-reduce:transition-none",
          sizing.translate,
        ].join(" ")}
      />
    </Switch.Root>
  );
});
