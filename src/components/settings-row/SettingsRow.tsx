"use client";

import * as React from "react";
import { Toggle } from "@/ui/toggle";
import { Badge, type BadgeTone } from "@/ui/badge";

/**
 * SettingsRow — a single row in a settings list (Profile → Settings).
 * Composite of: leading rounded-square icon tile + label/description + ONE
 * trailing control. 1:1 with the Figma "Settings Row" component set (158:62,
 * canonical instance 159:235, structured variant 1434:4287).
 *
 * Figma models 5 type-themed variants (Translation/ReadingAccent/Autoplay/
 * Pronounce/Motion) that bundle a control archetype with a color theme. We
 * model the design-lead contract instead: the variant is the *control type*
 * (`toggle` | `nav` | `badge` | `custom`) and the tile color is an optional
 * `iconTone`, so the same primitive reproduces every Figma row without a
 * variant explosion. See SettingsRow.figma.tsx for the mapping rationale.
 *
 * A11y — the nested-interactive trap:
 *   • `toggle`: the row is NOT a button. The label/description live inside a
 *     <label htmlFor> wired to the Toggle's id (click the label → toggles).
 *     The Toggle owns role=switch + aria-checked; description → aria-describedby.
 *   • `nav`: the row IS the <button>. Chevron + value are decorative
 *     (aria-hidden); the name comes from the label, the description from
 *     aria-describedby. Exactly one interactive element.
 *   • `badge` / `custom`: the row is a non-focusable <div>; any interactivity
 *     belongs to the trailing control the consumer supplies.
 * A focusable control is never nested inside a focusable row.
 */

/** Leading icon-tile theme. Maps to the Figma per-setting-type tile colors. */
export type SettingsRowTone = "accent" | "info" | "success" | "warning" | "danger";

/** Fields shared by every variant. */
interface SettingsRowBase {
  /** Leading glyph rendered inside the rounded-square tile. Optional. */
  icon?: React.ReactNode;
  /** Tile color theme. Defaults to `accent` (brand terracotta). */
  iconTone?: SettingsRowTone;
  /** Primary label (Heading/H4). Required — carries the row's meaning. */
  label: string;
  /** Secondary line (Caption, muted). Optional. */
  description?: string;
  /** Dims the row and blocks its control. */
  disabled?: boolean;
  /** Draws a 1px bottom divider (`--border-default`). */
  divider?: boolean;
  className?: string;
}

/** A switch row — the whole label area toggles the Radix Switch. */
export interface SettingsRowToggleProps extends SettingsRowBase {
  variant: "toggle";
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Async-pending state: swaps the toggle for a spinner, sets aria-busy. */
  loading?: boolean;
}

/** A navigational row — the row itself is the button; routes on click. */
export interface SettingsRowNavProps extends SettingsRowBase {
  variant: "nav";
  /** Current value, shown before the chevron (decorative, aria-hidden). */
  value?: string;
  onClick: () => void;
}

/** A status row — a non-interactive Badge sits at the trailing edge. */
export interface SettingsRowBadgeProps extends SettingsRowBase {
  variant: "badge";
  badge: { tone?: BadgeTone; children: React.ReactNode };
}

/** Escape hatch — host any trailing control (e.g. a segmented control). */
export interface SettingsRowCustomProps extends SettingsRowBase {
  variant: "custom";
  control: React.ReactNode;
}

export type SettingsRowProps =
  | SettingsRowToggleProps
  | SettingsRowNavProps
  | SettingsRowBadgeProps
  | SettingsRowCustomProps;

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Tile bg + glyph color per tone — all token-bound (no hardcoded values). */
const TILE_TONE: Record<SettingsRowTone, string> = {
  accent: "bg-accent-subtle text-accent-text",
  info: "bg-info-subtle text-info",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
};

/** Shared row geometry. `min-h-11` = 44px tap target (a11y law). */
const ROW_BASE =
  "flex items-center gap-md px-lg py-md min-h-11 w-full text-left bg-surface-elevated";

/** ChevronRight — decorative affordance for `nav` rows. */
function ChevronRight() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0 text-muted"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** Token-bound loading spinner (decorative). */
function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-5 shrink-0 rounded-pill border-2 border-border-default border-t-accent-text motion-safe:animate-spin"
    />
  );
}

/** The rounded-SQUARE leading tile (warmth law: never a circle). */
function IconTile({
  icon,
  tone,
}: {
  icon: React.ReactNode;
  tone: SettingsRowTone;
}) {
  return (
    <span
      className={cx(
        "flex size-10 shrink-0 items-center justify-center rounded-md",
        "[&>svg]:size-5",
        TILE_TONE[tone],
      )}
    >
      {icon}
    </span>
  );
}

export const SettingsRow = React.forwardRef<HTMLElement, SettingsRowProps>(
  function SettingsRow(props, ref) {
    const {
      icon,
      iconTone = "accent",
      label,
      description,
      disabled = false,
      divider = false,
      className,
    } = props;

    const reactId = React.useId();
    const labelId = `${reactId}-label`;
    const descId = `${reactId}-desc`;
    const controlId = `${reactId}-control`;
    const hasDesc = Boolean(description);

    const dividerClass = divider ? "border-b border-border-default" : "";
    const disabledClass = disabled ? "opacity-60" : "";

    const tile = icon ? <IconTile icon={icon} tone={iconTone} /> : null;

    // Label + description nodes, shared by every variant. Both carry ids so the
    // interactive control (Toggle / nav button) can name + describe itself.
    const textNodes = (
      <>
        <span
          id={labelId}
          className="font-display text-heading-h4 font-semibold text-primary"
        >
          {label}
        </span>
        {hasDesc && (
          <span id={descId} className="text-caption text-muted">
            {description}
          </span>
        )}
      </>
    );
    const textColumn = "flex min-w-0 flex-1 flex-col gap-[2px]";

    // ---- toggle ------------------------------------------------------------
    if (props.variant === "toggle") {
      const isLoading = Boolean(props.loading);
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          aria-busy={isLoading || undefined}
          className={cx(
            ROW_BASE,
            dividerClass,
            disabledClass,
            !disabled && !isLoading && "transition-colors hover:bg-surface-subtle",
            className,
          )}
        >
          {tile}
          {/* While loading there is no control to point a <label> at, so the
              text is a plain <div>; otherwise it's a real <label htmlFor> and
              clicking the text toggles the switch. */}
          {isLoading ? (
            <div className={textColumn}>{textNodes}</div>
          ) : (
            <label
              htmlFor={controlId}
              className={cx(textColumn, !disabled && "cursor-pointer")}
            >
              {textNodes}
            </label>
          )}
          <div className="ml-auto flex shrink-0 items-center">
            {isLoading ? (
              <Spinner />
            ) : (
              <Toggle
                id={controlId}
                checked={props.checked}
                onCheckedChange={props.onCheckedChange}
                disabled={disabled}
                aria-labelledby={labelId}
                aria-describedby={hasDesc ? descId : undefined}
              />
            )}
          </div>
        </div>
      );
    }

    // ---- nav ---------------------------------------------------------------
    if (props.variant === "nav") {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={props.onClick}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={hasDesc ? descId : undefined}
          className={cx(
            ROW_BASE,
            dividerClass,
            "outline-none transition-colors",
            "hover:bg-surface-subtle active:bg-surface-subtle",
            "focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "disabled:hover:bg-surface-elevated",
            className,
          )}
        >
          {tile}
          {/* labelId/descId here are what aria-labelledby/aria-describedby on
              the button point to — they ARE the accessible name + description. */}
          <span className={textColumn}>{textNodes}</span>
          <span className="ml-auto flex shrink-0 items-center gap-xs">
            {props.value && (
              <span aria-hidden="true" className="text-ui-m text-secondary">
                {props.value}
              </span>
            )}
            <ChevronRight />
          </span>
        </button>
      );
    }

    // ---- badge -------------------------------------------------------------
    if (props.variant === "badge") {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={cx(ROW_BASE, dividerClass, disabledClass, className)}
        >
          {tile}
          <div className={textColumn}>{textNodes}</div>
          <span className="ml-auto flex shrink-0 items-center">
            <Badge tone={props.badge.tone}>{props.badge.children}</Badge>
          </span>
        </div>
      );
    }

    // ---- custom ------------------------------------------------------------
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cx(ROW_BASE, dividerClass, disabledClass, className)}
      >
        {tile}
        <div className={textColumn}>{textNodes}</div>
        <span className="ml-auto flex shrink-0 items-center">
          {props.control}
        </span>
      </div>
    );
  },
);

SettingsRow.displayName = "SettingsRow";
