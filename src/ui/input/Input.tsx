import { forwardRef, useId } from "react";
import { cx } from "@/lib/utils/cx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Input — labelled text field primitive (Figma Components → Input, node 16:64).
 *
 * Variants map 1:1 to the Figma set: `size` MD/LG is the only configurable
 * property; the Figma "State" property (Default/Focus/Filled/Error/Disabled)
 * is RUNTIME, not a prop:
 *   - Focus    → `:focus-within`
 *   - Filled   → the input has a value
 *   - Error    → an `errorMessage` is provided
 *   - Disabled → the `disabled` attribute
 *
 * Everything is token-bound (no hardcoded colors/space/radii). The 1px↔2px
 * border change between states is rendered as an inset box-shadow ring so the
 * thickness change never reflows the layout.
 */

type InputSize = "md" | "lg";

export interface InputProps
  extends Omit<ComponentPropsWithoutRef<"input">, "size"> {
  /** Visible label text. Required — every input must be programmatically labelled. */
  label: string;
  /** Field height + padding scale. @default "md" */
  size?: InputSize;
  /** Decorative trailing glyph (~20px) shown at the end of the field. */
  trailingIcon?: ReactNode;
  /** When set, renders the field in its error state and shows this caption below. */
  errorMessage?: string;
}

/** Label/M — Nunito SemiBold 13/18, +1 tracking. */
const labelTypeClass =
  "font-[family-name:var(--text-label-m-family)] text-[length:var(--text-label-m-size)] leading-[var(--text-label-m-line-height)] font-semibold tracking-[var(--text-label-m-tracking)]";

/** UI/L — Nunito Regular 16/24. */
const valueTypeClass =
  "font-[family-name:var(--text-ui-l-family)] text-[length:var(--text-ui-l-size)] leading-[var(--text-ui-l-line-height)] font-normal";

/** Caption — Nunito Regular 12/16. */
const captionTypeClass =
  "font-[family-name:var(--text-caption-family)] text-[length:var(--text-caption-size)] leading-[var(--text-caption-line-height)] font-normal";

const fieldSizeClass: Record<InputSize, string> = {
  md: "min-h-[48px] p-[var(--space-md)]",
  lg: "min-h-[56px] p-[var(--space-lg)]",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    size = "md",
    trailingIcon,
    errorMessage,
    disabled,
    id,
    className,
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const errorId = `${inputId}-error`;
  const hasError = errorMessage != null && errorMessage !== "";

  // Inset ring renders the 1px→2px state change without affecting layout.
  // Error keeps its danger ring even while focused; otherwise focus paints the
  // 2px accent ring (AA-visible, #d66c44 ≥ 3:1).
  const ringClass = hasError
    ? "shadow-[inset_0_0_0_2px_var(--feedback-danger)]"
    : "shadow-[inset_0_0_0_1px_var(--border-default)] focus-within:shadow-[inset_0_0_0_2px_var(--border-accent)]";

  const describedBy =
    [hasError ? errorId : null, ariaDescribedBy].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cx("flex w-full flex-col gap-[var(--space-xs)]", className)}>
      <label
        htmlFor={inputId}
        className={cx(
          labelTypeClass,
          disabled ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]",
        )}
      >
        {label}
      </label>

      <div
        data-name="Field"
        className={cx(
          "flex items-center gap-[var(--space-sm)] rounded-[var(--radius-sm)]",
          fieldSizeClass[size],
          disabled ? "bg-[var(--bg-subtle)]" : "bg-[var(--bg-elevated)]",
          ringClass,
          // A real outline on focus (applied regardless of error) so the focus
          // indicator survives forced-colors/High-Contrast (where box-shadow is
          // dropped) and the errored+focused state is still clearly perceivable.
          // outline draws outside the box → no reflow.
          "focus-within:[outline:2px_solid_var(--focus-ring)] focus-within:[outline-offset:2px]",
        )}
      >
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cx(
            "min-w-0 flex-1 border-0 bg-transparent p-0 outline-none",
            valueTypeClass,
            "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
            "disabled:cursor-not-allowed disabled:text-[var(--text-muted)]",
          )}
          {...rest}
        />

        {trailingIcon != null && (
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center text-[var(--text-muted)]"
          >
            {trailingIcon}
          </span>
        )}
      </div>

      {hasError && (
        <p id={errorId} className={cx(captionTypeClass, "text-[var(--feedback-danger)]")}>
          {errorMessage}
        </p>
      )}
    </div>
  );
});
