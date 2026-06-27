import { forwardRef, useId, useRef } from "react";
import { cx } from "@/lib/utils/cx";
import type { ComponentPropsWithoutRef, Ref } from "react";
import { IconButton } from "../icon-button";

/**
 * SearchField — the label-less, rounded search field for the Search screen
 * (Figma node 132:158 desktop / 861:1050 mobile).
 *
 * It is a presentational, fully CONTROLLED primitive: it renders a value and
 * reports edits via `onValueChange`. It owns no search/results logic — the
 * Search feature does, per the prototype (which browses categories only).
 *
 * Visual states are runtime, not props:
 *   - focus-visible → `:focus-within` (AA 2px ring + inset accent border)
 *   - filled        → a non-empty `value` reveals the clear affordance
 *   - disabled      → the `disabled` attribute (minimal: dimmed, no interaction)
 *
 * Everything is token-bound; the only literals are intrinsic geometry the design
 * system does not tokenize (the 44px icon tile, 20px glyph, 60px field height) —
 * the same convention IconButton uses for its square footprint.
 */
export interface SearchFieldProps
  extends Omit<
    ComponentPropsWithoutRef<"input">,
    "value" | "onChange" | "type" | "aria-label"
  > {
  /** The current query string. This primitive is controlled. */
  value: string;
  /** Called with the next value on every edit and on clear. */
  onValueChange: (value: string) => void;
  /** @default "Search stories, themes…" */
  placeholder?: string;
  /** Dim and disable interaction. @default false */
  disabled?: boolean;
  /**
   * Accessible name. Rendered as a visually-hidden `<label>` tied to the input,
   * so the field announces it even though no label is visible. @default "Search stories"
   */
  "aria-label"?: string;
  /**
   * Custom clear handler. When omitted, the clear button resets the value to "".
   * In both cases focus returns to the input after clearing.
   */
  onClear?: () => void;
  className?: string;
}

/** Merge the forwarded ref with the internal one (needed to refocus on clear). */
function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}

/** UI/L — Nunito 16/24. Placeholder paints SemiBold (Figma), typed value Regular. */
const textTypeClass =
  "font-[family-name:var(--text-ui-l-family)] text-[length:var(--text-ui-l-size)] leading-[var(--text-ui-l-line-height)]";

/** Detailed magnifier glyph, sized to its 20px box, inherits currentColor. */
function SearchGlyph() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="size-full"
    >
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="m17 17-3.6-3.6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Clear (✕) glyph for the trailing IconButton. */
function ClearGlyph() {
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

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      value,
      onValueChange,
      placeholder = "Search stories, themes…",
      disabled = false,
      "aria-label": ariaLabel = "Search stories",
      onClear,
      id,
      className,
      ...rest
    },
    ref,
  ) {
    const reactId = useId();
    const inputId = id ?? reactId;
    const internalRef = useRef<HTMLInputElement>(null);
    const hasValue = value.length > 0;
    const showClear = hasValue && !disabled;

    function handleClear() {
      if (onClear) onClear();
      else onValueChange("");
      // Returning focus keeps the keyboard user in the field after clearing.
      internalRef.current?.focus();
    }

    return (
      <div
        data-name="SearchField"
        className={cx(
          "flex min-h-[60px] w-full items-center gap-md-plus",
          "rounded-[var(--radius-card)] bg-[var(--bg-elevated)] shadow-[var(--shadow-field)]",
          "pl-[var(--space-sm)] pr-[var(--space-md)] py-[var(--space-sm)]",
          // AA focus: a real outline (survives forced-colors) plus an inset accent
          // border that mirrors Input's recipe. outline draws outside → no reflow.
          "focus-within:[outline:2px_solid_var(--focus-ring)] focus-within:[outline-offset:2px]",
          "focus-within:shadow-[inset_0_0_0_2px_var(--border-accent),var(--shadow-field)]",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        {/* Leading icon tile — a ROUNDED SQUARE (warmth law), decorative. */}
        <div
          aria-hidden="true"
          className="flex size-[44px] shrink-0 items-center justify-center rounded-[var(--radius-icon)] bg-[var(--bg-subtle)] text-[var(--text-muted)]"
        >
          <span className="size-[20px]">
            <SearchGlyph />
          </span>
        </div>

        {/* Visually-hidden label supplies the accessible name (no visible label). */}
        <label htmlFor={inputId} className="sr-only">
          {ariaLabel}
        </label>

        <input
          ref={mergeRefs(ref, internalRef)}
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cx(
            "min-w-0 flex-1 border-0 bg-transparent p-0 outline-none",
            textTypeClass,
            "font-normal text-[var(--text-primary)]",
            "placeholder:font-semibold placeholder:text-[var(--text-muted)]",
            "disabled:cursor-not-allowed",
            // Hide the native WebKit clear control — we render our own.
            "[&::-webkit-search-cancel-button]:appearance-none",
          )}
          {...rest}
        />

        {showClear && (
          <IconButton
            variant="ghost"
            size="sm"
            icon={<ClearGlyph />}
            aria-label="Clear search"
            onClick={handleClear}
          />
        )}
      </div>
    );
  },
);
