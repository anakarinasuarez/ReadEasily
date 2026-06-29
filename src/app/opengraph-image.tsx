import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/**
 * Default social preview (Open Graph + Twitter) for the whole site — a branded
 * card with the two-tone book mark + wordmark on warm paper. Generated at the
 * edge of build via `next/og` (Satori), so it stays in sync with the brand with
 * no static asset to maintain. Per-story pages override the image with the
 * story's cover in their own `generateMetadata`.
 */
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          backgroundColor: "#fffdf8",
          fontFamily: "sans-serif",
        }}
      >
        <svg
          width="240"
          height="192"
          viewBox="0 0 40 32"
          style={{ transform: "rotate(13deg)" }}
        >
          <path
            d="M3 5.5C7.8 4 12.4 4.3 17 6.6c1.1.5 1.8 1.6 1.8 2.8V28c0 .9-1 1.5-1.9 1.1-4.3-2.1-8.6-2.4-13.1-1.1C2.9 28.3 2 27.6 2 26.6V7.4C2 6.5 2.2 5.8 3 5.5Z"
            fill="#D66C44"
          />
          <path
            d="M37 5.5C32.2 4 27.6 4.3 23 6.6c-1.1.5-1.8 1.6-1.8 2.8V28c0 .9 1 1.5 1.9 1.1 4.3-2.1 8.6-2.4 13.1-1.1.9.3 1.8-.4 1.8-1.4V7.4C38 6.5 37.8 5.8 37 5.5Z"
            fill="#B35029"
          />
          <path
            d="M6.5 10.5c2.9 0 5.7.6 8.3 1.8M6.5 15c2.9 0 5.7.6 8.3 1.8M33.5 10.5c-2.9 0-5.7.6-8.3 1.8M33.5 15c-2.9 0-5.7.6-8.3 1.8"
            stroke="#FFFFFF"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>

        <div style={{ display: "flex", fontSize: 96, fontWeight: 800 }}>
          <span style={{ color: "#3c2c1d" }}>Read</span>
          <span style={{ color: "#a0492a" }}>Easily</span>
        </div>

        <div style={{ fontSize: 40, color: "#7a6a59", fontWeight: 600 }}>
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    size,
  );
}
