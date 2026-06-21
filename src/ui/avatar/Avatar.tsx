"use client";

import { forwardRef, useEffect, useState } from "react";
import type { HTMLAttributes } from "react";

/**
 * Avatar — circular user image with an initials fallback.
 * 1:1 with the Figma "Avatar" component (used by Navbar at 40px and UserCard).
 *
 * Contract:
 *   - `src` provided AND loads      -> <img alt={name}> (object-cover, circular)
 *   - no `src`, OR the image errors -> initials fallback (role="img" + aria-label
 *     = name; the initials glyphs themselves are decorative / aria-hidden)
 * A broken URL flips to the fallback via React state (onError), so the native
 * broken-image icon is never shown.
 *
 * Sizes/font-sizes are off the spacing/type ramps (there is no avatar-specific
 * token in Foundations) so they use arbitrary px values, matching the
 * established off-scale pattern in Badge. Colors/radius/font-family are
 * fully token-bound.
 */

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Diameter — sm=32px, md=40px, lg=56px. Default md. */
  size?: AvatarSize;
  /** Image URL. When absent or failing to load, the initials fallback renders. */
  src?: string;
  /** REQUIRED — used as the image `alt`, the fallback `aria-label`, and the
   *  source for the derived initials. */
  name: string;
};

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Diameter per size — real design values. */
const sizeBox: Record<AvatarSize, string> = {
  sm: "size-[32px]",
  md: "size-[40px]",
  lg: "size-[56px]",
};

/** Initials font-size per size — derived (~45% of diameter), no token exists. */
const sizeFont: Record<AvatarSize, string> = {
  sm: "text-[13px]",
  md: "text-[16px]",
  lg: "text-[22px]",
};

/**
 * Derive up to two initials: first letter of the first word + first letter of
 * the last word, uppercased. Single word -> one letter. Falls back to "" for
 * an all-whitespace name (the aria-label still carries the full name).
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { size = "md", src, name, className, ...rest },
  ref,
) {
  const [errored, setErrored] = useState(false);

  // A changed `src` is a fresh image worth re-attempting — clear the prior error.
  useEffect(() => {
    setErrored(false);
  }, [src]);

  const showImage = Boolean(src) && !errored;

  return (
    <span
      ref={ref}
      // Fallback semantics live on the root only when no image renders; with an
      // image, the <img alt> carries the accessible name instead.
      role={showImage ? undefined : "img"}
      aria-label={showImage ? undefined : name}
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden align-middle",
        "rounded-pill bg-accent text-on-accent select-none",
        sizeBox[size],
        className,
      )}
      {...rest}
    >
      {showImage ? (
        // A design-system avatar takes arbitrary, often-remote user URLs and
        // relies on native onError for the initials fallback — next/image's
        // loader/optimization model doesn't fit a leaf primitive here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setErrored(true)}
          className="size-full rounded-pill object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className={cx(
            "font-display font-bold leading-none tracking-[0]",
            sizeFont[size],
          )}
        >
          {getInitials(name)}
        </span>
      )}
    </span>
  );
});

Avatar.displayName = "Avatar";
