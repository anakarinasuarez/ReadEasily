import { ImageResponse } from "next/og";
import { getCatalogEntry } from "@/content/catalog";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/**
 * Per-story social card (Open Graph + Twitter) — a branded, text-forward layout
 * generated with `next/og` (Satori) from the server-readable catalog. It is
 * deliberately NOT the WebP cover: Satori can't decode WebP, and the covers are
 * WebP-only, so embedding one renders blank. Instead the card pairs the brand
 * lockup with the story's title, CEFR level, and category — a unique, reliable
 * preview per story that never depends on an undecodable raster.
 *
 * Shared by the `opengraph-image` routes under `/story/[id]` and `/read/[id]`.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const LEVEL_LABEL: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper-Intermediate",
  C1: "Advanced",
  C2: "Proficient",
};

const CATEGORY_LABEL: Record<string, string> = {
  fables: "Fable",
  travel: "Travel",
  technology: "Technology",
  "daily-life": "Daily life",
};

export function renderStoryOgImage(id: string): ImageResponse {
  const story = getCatalogEntry(id);
  const title = story?.title ?? SITE_NAME;
  const teaser = story?.teaser ?? SITE_TAGLINE;
  const level = story ? `CEFR ${story.level} · ${LEVEL_LABEL[story.level] ?? ""}` : "";
  const category = story ? (CATEGORY_LABEL[story.category] ?? story.category) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#fffdf8",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg
            width="68"
            height="54"
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
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>
            <span style={{ color: "#3c2c1d" }}>Read</span>
            <span style={{ color: "#a0492a" }}>Easily</span>
          </div>
        </div>

        {/* Story */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {level && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 22px",
                  borderRadius: 999,
                  backgroundColor: "#fdebe0",
                  color: "#a0492a",
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                {level}
              </div>
            )}
            {category && (
              <div style={{ display: "flex", color: "#7a6a59", fontSize: 26, fontWeight: 600 }}>
                {category}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 74,
              fontWeight: 800,
              color: "#3c2c1d",
              lineHeight: 1.08,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#5b4a3a",
              lineHeight: 1.35,
              maxWidth: 980,
            }}
          >
            {teaser}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", color: "#9a8979", fontSize: 24, fontWeight: 600 }}>
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
