"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { IconButton } from "../../ui/icon-button";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps
  extends Omit<
    ComponentPropsWithoutRef<typeof Dialog.Content>,
    "title" | "children" | "asChild"
  > {
  /** Controlled open state. */
  open: boolean;
  /** Fires on any dismiss request (Esc, scrim, close button) and on open. */
  onOpenChange: (open: boolean) => void;
  /**
   * The dialog heading. Always wired to a Radix `Dialog.Title`, so it is the
   * `aria-labelledby` target even when styled as a custom display title.
   */
  title: ReactNode;
  /** Optional uppercase Label/S eyebrow above the title (e.g. "PRACTICE · 10"). */
  eyebrow?: ReactNode;
  /**
   * Optional inline meta beside the title (e.g. a translation hint). When
   * present it becomes the Radix `Dialog.Description` → `aria-describedby`.
   */
  meta?: ReactNode;
  /** Container max-width. `md` (default) matches the practice modal. */
  size?: ModalSize;
  /** Optional action row, rendered below a divider. Compose `Button` slots. */
  footer?: ReactNode;
  /** Modal body — the only required slot. Scrolls natively when it overflows. */
  children: ReactNode;
  /**
   * When `false`, Esc, scrim-click and the close button are all suppressed —
   * the modal can only be closed by a footer action calling `onOpenChange`.
   * Defaults to `true`.
   */
  dismissible?: boolean;
}

/** Join class fragments, dropping falsy ones. */
function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Container max-width per size. Layout dimensions, not tokenized values. */
const sizeWidth: Record<ModalSize, string> = {
  sm: "max-w-[420px]",
  md: "max-w-[560px]",
  lg: "max-w-[720px]",
};

/* ---------------------------------------------------------------------------
 * Token-bound class fragments. Every color / radius / shadow / space resolves
 * to a CSS custom property from src/tokens/*. Motion uses the `starting:`
 * variant (@starting-style) so the enter dissolve/scale needs no keyframes,
 * and `motion-reduce:` disables it for users who ask (Handoff motion spec:
 * overlays = 200ms Dissolve, container enter = 200ms ease-out).
 * ------------------------------------------------------------------------- */
const overlayClasses = cn(
  "fixed inset-0 z-50 bg-[var(--scrim)] backdrop-blur-sm",
  "transition-opacity duration-200 ease-out opacity-100",
  "motion-safe:starting:opacity-0 motion-reduce:transition-none",
);

const contentClasses = cn(
  "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
  "flex max-h-[calc(100vh-var(--space-3xl))] w-[calc(100vw-var(--space-xl))] flex-col",
  "overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--bg-elevated)]",
  "shadow-[var(--shadow-modal)]",
  "transition duration-200 ease-out opacity-100 scale-100",
  "motion-safe:starting:opacity-0 motion-safe:starting:scale-95",
  "motion-reduce:transition-none",
  "outline-none",
);

const eyebrowClasses = cn(
  "uppercase text-[var(--text-accent)]",
  "[font-family:var(--text-label-s-family)] [font-size:var(--text-label-s-size)]",
  "[font-weight:var(--text-label-s-weight)] [line-height:var(--text-label-s-line-height)]",
  "[letter-spacing:var(--text-label-s-tracking)]",
);

/**
 * Title type ramp. ASSUMPTION: the design-lead spec asks for a ~30px SemiBold
 * display title, but Foundations has no 30px display token (the display-family
 * ramp is Display/L 44 · Heading/H3 22 · Heading/H4 16). Per the token law we
 * bind to the nearest one — Heading/H3 — rather than hardcode 30px.
 */
const titleClasses = cn(
  "text-[var(--text-primary)]",
  "[font-family:var(--text-heading-h3-family)] [font-size:var(--text-heading-h3-size)]",
  "[font-weight:var(--text-heading-h3-weight)] [line-height:var(--text-heading-h3-line-height)]",
  "[letter-spacing:var(--text-heading-h3-tracking)]",
);

const metaClasses = cn(
  "text-[var(--text-muted)]",
  "[font-family:var(--text-ui-m-family)] [font-size:var(--text-ui-m-size)]",
  "[font-weight:var(--text-ui-m-weight)] [line-height:var(--text-ui-m-line-height)]",
);

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Modal — the ReadEasily dialog composite (Figma practice-modal 881:1428).
 *
 * Built on Radix `Dialog`, which provides the focus trap, focus return, Esc
 * handling, scroll-lock and `role="dialog"` for free. The title is always a
 * real `Dialog.Title` (→ `aria-labelledby`) and `meta`, when given, is the
 * `Dialog.Description` (→ `aria-describedby`); when absent we opt out of the
 * description so Radix does not warn. Reads only semantic tokens, so it is
 * theme-agnostic. `dismissible` gates every chrome-driven dismiss affordance.
 *
 * Body state (loading / empty / error) is composed by the consumer — see the
 * colocated `Modal.Skeleton`, `Modal.Empty` and `Modal.Error` helpers — so the
 * shell never has to render a blank modal.
 */
const ModalRoot = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onOpenChange,
    title,
    eyebrow,
    meta,
    size = "md",
    footer,
    children,
    dismissible = true,
    className,
    ...rest
  },
  ref,
) {
  // Block chrome-driven dismissal when not dismissible: prevent the default
  // Radix close so onOpenChange is never called from Esc / outside-click.
  const guard = dismissible
    ? undefined
    : (event: Event) => event.preventDefault();

  // Radix points `aria-describedby` at its description id unconditionally. With
  // a `meta` we render a `Dialog.Description` to satisfy it; without one we
  // override to `undefined` so the attribute is dropped rather than dangling.
  const describedByProps = meta != null ? {} : { "aria-describedby": undefined };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={overlayClasses} />
        <Dialog.Content
          ref={ref}
          className={cn(contentClasses, sizeWidth[size], className)}
          {...rest}
          // rest spread FIRST so the dismissal guards + describedby handling
          // below always win — a consumer can't override the non-dismissible
          // guard by passing onEscapeKeyDown/etc through rest.
          onEscapeKeyDown={guard}
          onPointerDownOutside={guard}
          onInteractOutside={guard}
          {...describedByProps}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-[var(--space-lg)] px-[var(--space-2xl)] pb-[var(--space-xl)] pt-[var(--space-2xl)]">
            <div className="flex min-w-0 flex-col gap-[var(--space-xs)]">
              {eyebrow != null && <p className={eyebrowClasses}>{eyebrow}</p>}
              <div className="flex flex-wrap items-baseline gap-[var(--space-sm)]">
                <Dialog.Title asChild>
                  <h2 className={titleClasses}>{title}</h2>
                </Dialog.Title>
                {meta != null && (
                  <Dialog.Description asChild>
                    <span className={metaClasses}>{meta}</span>
                  </Dialog.Description>
                )}
              </div>
            </div>
            {dismissible && (
              <Dialog.Close asChild>
                <IconButton
                  variant="subtle"
                  size="md"
                  icon={<XIcon />}
                  aria-label="Close"
                  className="shrink-0"
                />
              </Dialog.Close>
            )}
          </div>

          {/* Divider */}
          <div
            role="presentation"
            className="h-px w-full shrink-0 bg-[var(--border-default)]"
          />

          {/* Body — native scroll on overflow */}
          <div className="min-h-0 flex-1 overflow-y-auto px-[var(--space-2xl)] py-[var(--space-2xl)]">
            {children}
          </div>

          {/* Footer (optional) */}
          {footer != null && (
            <>
              <div
                role="presentation"
                className="h-px w-full shrink-0 bg-[var(--border-default)]"
              />
              <div className="flex flex-wrap items-center justify-end gap-[var(--space-md)] px-[var(--space-2xl)] py-[var(--space-xl)]">
                {footer}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

/* ---------------------------------------------------------------------------
 * Body-state helpers. Composition over configuration: a consumer drops one of
 * these into the body so the modal is never blank while loading / empty / in
 * error. They read only semantic tokens and own no layout outside the body.
 * ------------------------------------------------------------------------- */

/** Loading skeleton — a stack of shimmering token-bound placeholder rows. */
function ModalSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-[var(--space-lg)]"
      data-testid="modal-skeleton"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="motion-safe:animate-pulse rounded-[var(--radius-lg)] bg-[var(--bg-subtle)]"
          style={{ height: "var(--space-3xl)" }}
        />
      ))}
    </div>
  );
}

/** Empty state — centered message, never a blank body. */
function ModalEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-[var(--space-sm)] py-[var(--space-2xl)] text-center text-[var(--text-muted)]">
      {children}
    </div>
  );
}

/**
 * Inline error — announced politely as an `alert`, styled with the danger
 * token. Lives inside the body so the modal stays readable, never blank.
 */
function ModalError({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-[var(--radius-lg)] bg-[var(--feedback-danger-subtle)] px-[var(--space-lg)] py-[var(--space-md)] text-[var(--feedback-danger)] [font-family:var(--text-ui-m-family)] [font-size:var(--text-ui-m-size)] [line-height:var(--text-ui-m-line-height)]"
    >
      {children}
    </div>
  );
}

/**
 * The public primitive: the dialog shell plus its body-state slots. Compose as
 * `<Modal>…<Modal.Skeleton/> / <Modal.Empty/> / <Modal.Error/>…</Modal>`.
 */
export const Modal = Object.assign(ModalRoot, {
  Skeleton: ModalSkeleton,
  Empty: ModalEmpty,
  Error: ModalError,
});
