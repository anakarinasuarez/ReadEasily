import { forwardRef, type HTMLAttributes } from "react";

/**
 * BgDecorations — the atmospheric backdrop behind every screen (Figma node 254:2).
 * Three large, soft, tinted ellipses that give the cozy storybook-gradient feel:
 *   • terracotta — top-left
 *   • sky/blue   — top-right
 *   • forest     — bottom-center
 *
 * It is PURELY decorative and must never interfere with the UI:
 *   • `aria-hidden` — invisible to the a11y tree (it carries no meaning).
 *   • `pointer-events-none` — never intercepts clicks meant for content.
 *   • no focusable children — never traps the keyboard.
 *   • negative z-index — always sits BEHIND the content layer.
 *   • no animation — static by design, so it already honors reduced-motion.
 *
 * Tints are token-bound (the semantic --bg-decoration-warm / -cool / -leaf
 * tokens) and softened with a large blur, so there are no raster assets and the
 * colors track the theme.
 *
 * Usage: drop it in as the first child of a `relative` screen container. Use
 * `fixed` when the backdrop should stay put while the page scrolls.
 */

export interface BgDecorationsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "aria-hidden" | "children"> {
  /**
   * Pin the backdrop to the viewport (`position: fixed`) instead of the nearest
   * positioned ancestor (`position: absolute`, the default). Use `fixed` for a
   * scroll-through atmosphere.
   */
  fixed?: boolean;
}

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const BgDecorations = forwardRef<HTMLDivElement, BgDecorationsProps>(
  function BgDecorations({ fixed = false, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          fixed ? "fixed" : "absolute",
          "inset-0 -z-10 overflow-hidden pointer-events-none",
          className,
        )}
        {...rest}
      >
        {/* terracotta — top-left */}
        <div className="absolute -left-[10%] -top-[8%] h-[60%] w-[75%] rounded-full blur-3xl bg-[var(--bg-decoration-warm)]" />
        {/* sky/blue — top-right */}
        <div className="absolute -right-[12%] -top-[12%] h-[65%] w-[80%] rounded-full blur-3xl bg-[var(--bg-decoration-cool)]" />
        {/* forest — bottom-center */}
        <div className="absolute bottom-[-12%] left-1/4 h-[55%] w-[70%] rounded-full blur-3xl bg-[var(--bg-decoration-leaf)]" />
      </div>
    );
  },
);

BgDecorations.displayName = "BgDecorations";
