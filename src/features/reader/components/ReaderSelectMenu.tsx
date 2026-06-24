"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { CheckIcon, ChevronDownIcon } from "./icons";

/**
 * ReaderSelectMenu — the shared dropdown behind the Reader's header pills (the
 * translation-language menu, Figma node 1154:3342, and the voice/accent menu
 * that mirrors it). One accessible menu, two thin wrappers (LanguageDropdown,
 * VoiceDropdown), so their visuals + a11y can never drift.
 *
 * Surface (Figma 1154:3342): an elevated `--bg-elevated` card, `--radius-md`
 * (16), a soft warm drop shadow, `--space-sm` padding, rows separated by 2px.
 * Each row: a 2-letter code chip (Label/S, tracking 0.48px) + the option name
 * (15px; Bold when selected). The selected row gets the `--feedback-info-subtle`
 * tint, `--feedback-info` ink, and a 16px check.
 *
 * A11y model:
 *  • Trigger pill: `aria-haspopup="menu" aria-expanded` + `aria-controls`.
 *  • Menu: `role="menu"`; rows are `role="menuitemradio" aria-checked`.
 *  • Open → focus the checked row (roving tabindex within the menu).
 *  • ↑/↓ move between rows (wrap), Home/End jump; Enter/Space select.
 *  • Esc closes and returns focus to the pill; click/tap outside closes.
 *  • Selecting a row commits and returns focus to the pill.
 */
export interface ReaderSelectOption<T extends string> {
  /** The value committed via `onChange`. */
  value: T;
  /** The 2-letter code chip, e.g. "ES" / "US". */
  code: string;
  /** The full option name, e.g. "Español" / "US English". */
  name: string;
}

export interface ReaderSelectMenuProps<T extends string> {
  /** The selectable options, in display order. */
  options: ReaderSelectOption<T>[];
  /** The currently-selected value. */
  value: T;
  /** Commit a new value (also closes the menu). */
  onChange: (value: T) => void;
  /** sr-only context for the pill + menu, e.g. "Translation language". */
  label: string;
  /** Decorative leading glyph inside the pill (globe / flag). */
  leadingIcon: ReactNode;
  /** Visible pill text — the active option's code (e.g. "ES"). */
  pillText: string;
  /** Menu alignment under the pill. Defaults to right (pills sit top-right). */
  align?: "left" | "right";
}

const pillBase =
  "inline-flex items-center gap-[6px] rounded-[var(--radius-pill)] " +
  "bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] pl-[12px] pr-[8px] py-[12px] opacity-[0.92] " +
  "text-[color:var(--text-primary)] transition-colors hover:bg-[var(--bg-accent-subtle)] " +
  "[font-family:var(--text-meta-family)] [font-size:var(--text-meta-size)] " +
  "[font-weight:var(--text-meta-weight)] [line-height:var(--text-meta-line-height)] " +
  "outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]";

// Each row. The 2-letter code chip uses Label/S (Nunito SemiBold 12) with the
// 0.48px tracking token; the name is 15px (Bold when selected, SemiBold else).
const rowBase =
  "flex w-full items-center gap-[var(--space-md)] rounded-[10px] p-[10px] text-left " +
  "outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:-2px] " +
  "transition-colors cursor-pointer";

const codeBase =
  "w-[24px] shrink-0 [font-family:var(--font-ui)] [font-weight:var(--font-weight-semibold)] " +
  "[font-size:var(--text-label-s-size)] [line-height:16px] [letter-spacing:var(--text-label-s-tracking)]";

export function ReaderSelectMenu<T extends string>({
  options,
  value,
  onChange,
  label,
  leadingIcon,
  pillText,
  align = "right",
}: ReaderSelectMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  // Roving focus within the menu (index into `options`).
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  const closeAndRefocus = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }, [selectedIndex]);

  // On open, move focus to the checked row (roving tab stop).
  useEffect(() => {
    if (!open) return;
    itemRefs.current[activeIndex]?.focus();
    // Only on open (and when the active row changes via the arrow keys, which
    // calls focus directly) — guarded by `open`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Click / tap outside closes (no refocus — focus naturally leaves).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const t = event.target as Node;
      if (menuRef.current?.contains(t) || triggerRef.current?.contains(t)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  const focusItem = useCallback((index: number, count: number) => {
    const next = ((index % count) + count) % count;
    setActiveIndex(next);
    itemRefs.current[next]?.focus();
  }, []);

  const handleMenuKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const count = options.length;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          focusItem(activeIndex + 1, count);
          break;
        case "ArrowUp":
          event.preventDefault();
          focusItem(activeIndex - 1, count);
          break;
        case "Home":
          event.preventDefault();
          focusItem(0, count);
          break;
        case "End":
          event.preventDefault();
          focusItem(count - 1, count);
          break;
        case "Escape":
          event.preventDefault();
          closeAndRefocus();
          break;
        case "Tab":
          // A menu is modal-ish: Tab closes it rather than escaping mid-list.
          setOpen(false);
          break;
        default:
          break;
      }
    },
    [activeIndex, options.length, focusItem, closeAndRefocus],
  );

  const select = useCallback(
    (next: T) => {
      onChange(next);
      closeAndRefocus();
    },
    [onChange, closeAndRefocus],
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={pillBase}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className="inline-flex size-[16px] items-center justify-center [&>svg]:size-full"
        >
          {leadingIcon}
        </span>
        <span aria-hidden="true">{pillText}</span>
        <span
          aria-hidden="true"
          className={[
            "inline-flex size-[14px] items-center justify-center [&>svg]:size-full transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        >
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
          className={[
            "absolute top-[calc(100%+var(--space-sm))] z-50 flex w-max min-w-[160px] flex-col gap-[2px]",
            "overflow-clip rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-[var(--space-sm)]",
            "shadow-dropdown", // Figma 1154:3342 dropdown lift (--shadow-dropdown)
            // Overlay motion law: 200ms fade in; reduced-motion drops it.
            "transition-opacity duration-200 ease-out opacity-100",
            "motion-safe:starting:opacity-0 motion-reduce:transition-none",
            align === "right" ? "right-0" : "left-0",
          ].join(" ")}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => select(option.value)}
                className={[
                  rowBase,
                  isSelected
                    ? "bg-[var(--feedback-info-subtle)] text-[color:var(--feedback-info)]"
                    : "text-[color:var(--text-primary)] hover:bg-[var(--bg-accent-subtle)]",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    codeBase,
                    isSelected
                      ? "text-[color:var(--feedback-info)]"
                      : "text-[color:var(--text-secondary)]",
                  ].join(" ")}
                >
                  {option.code}
                </span>
                <span
                  className={[
                    "flex-1 [font-family:var(--font-ui)] [font-size:15px] leading-normal",
                    isSelected
                      ? "[font-weight:var(--font-weight-bold)]"
                      : "[font-weight:var(--font-weight-semibold)]",
                  ].join(" ")}
                >
                  {option.name}
                </span>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="inline-flex size-[16px] shrink-0 items-center justify-center text-[color:var(--feedback-info)] [&>svg]:size-full"
                  >
                    <CheckIcon />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
