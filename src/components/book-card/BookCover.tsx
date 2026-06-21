"use client";

import Image from "next/image";
import { forwardRef, useEffect, useState } from "react";
import type { HTMLAttributes } from "react";

/**
 * BookCover — the painted-illustration art tile, 1:1 with the Figma
 * "Book Cover" component (node 25:13). Thumbnail / Small / Hero sizes.
 *
 * It is a pure presentational tile: a fixed-footprint, `rounded-xl`, clipped
 * frame holding an `object-cover` image. If the image fails to load it flips —
 * via native `onError` — to a warm token-bound placeholder so a broken `<img>`
 * glyph is never shown (same contract as Avatar). All color / radius / shadow
 * resolve to tokens; only the per-size geometry (no cover-specific token exists)
 * is literal, matching the established off-scale pattern in Avatar/Badge.
 */

export type BookCoverSize = "thumbnail" | "small" | "hero";

export interface BookCoverProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Footprint — `thumbnail` 140×200 · `small` (default) 168×242 · `hero` 320×480. */
  size?: BookCoverSize;
  /** Cover image URL. */
  src: string;
  /** REQUIRED alt text describing the cover (WCAG 1.1.1). */
  alt: string;
  /** Forwarded to `next/image` — eager-load above-the-fold heroes. */
  priority?: boolean;
}

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Real design footprints per size. */
const sizeBox: Record<BookCoverSize, string> = {
  thumbnail: "w-[140px] h-[200px]",
  small: "w-[168px] h-[242px]",
  hero: "w-[320px] h-[480px]",
};

/** Elevation per size — Hero lifts to shadow-md, the rest sit on shadow-sm. */
const sizeShadow: Record<BookCoverSize, string> = {
  thumbnail: "shadow-sm",
  small: "shadow-sm",
  hero: "shadow-md",
};

/** Intrinsic pixel widths feeding `next/image` `sizes`. */
const sizePx: Record<BookCoverSize, number> = {
  thumbnail: 140,
  small: 168,
  hero: 320,
};

export const BookCover = forwardRef<HTMLDivElement, BookCoverProps>(
  function BookCover({ size = "small", src, alt, priority, className, ...rest }, ref) {
    const [errored, setErrored] = useState(false);

    // A changed `src` is a fresh image worth re-attempting — clear prior error.
    useEffect(() => {
      setErrored(false);
    }, [src]);

    return (
      <div
        ref={ref}
        className={cx(
          "relative overflow-hidden rounded-[var(--radius-xl)]",
          sizeBox[size],
          sizeShadow[size],
          className,
        )}
        {...rest}
      >
        {errored ? (
          // Warm fallback tile — keeps the cover meaningful when art fails.
          <div
            role="img"
            aria-label={alt}
            className="flex size-full items-center justify-center bg-[var(--bg-accent-subtle)] text-[var(--text-muted)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              focusable="false"
              className="size-[32px]"
            >
              <path
                d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13ZM20 5.5A1.5 1.5 0 0 0 18.5 4H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={`${sizePx[size]}px`}
            onError={() => setErrored(true)}
            className="object-cover"
          />
        )}
      </div>
    );
  },
);

BookCover.displayName = "BookCover";
