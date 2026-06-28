import type { MetadataRoute } from "next";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  THEME_COLOR,
} from "@/lib/site";

/**
 * Web app manifest (PWA) — makes ReadEasily installable with brand chrome.
 * Icons reference the crisp SVG mark (`/icon.svg`, the app `icon.svg` file
 * convention) plus the legacy favicon. Colors match the warm-paper canvas and
 * terracotta accent.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf8",
    theme_color: THEME_COLOR,
    lang: "en",
    categories: ["education", "books"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
