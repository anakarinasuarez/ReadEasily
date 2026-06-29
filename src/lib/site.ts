/**
 * Site-wide constants — the single source of truth for SEO/metadata.
 *
 * Imported by the root layout metadata, `sitemap.ts`, `robots.ts`,
 * `manifest.ts`, the OG image, and every per-route `generateMetadata`. Keeping
 * the canonical URL, brand name, and default copy here means a domain change is
 * a one-line edit, and every generated tag/file stays in lockstep.
 *
 * The production origin is read from `NEXT_PUBLIC_SITE_URL` (set in the deploy
 * env) so previews and prod resolve their own absolute URLs; the fallback keeps
 * local builds and tests deterministic.
 */

/** Absolute origin, no trailing slash. Override per-environment with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://readeasily.app"
).replace(/\/$/, "");

/** Brand name — used in titles, OG site_name, manifest. */
export const SITE_NAME = "ReadEasily";

/** Default meta description (home + fallback). */
export const SITE_DESCRIPTION =
  "Learn English through short illustrated stories — read, listen, translate, save words, and practice. Graded A1–C1 stories tuned for English learners.";

/** Short tagline for OG/manifest. */
export const SITE_TAGLINE = "Learn English through short illustrated stories";

/** Primary content/UI locale (BCP-47 + OG underscore form). */
export const SITE_LOCALE = "en_US";

/** Brand color (terracotta) — manifest theme + browser UI. */
export const THEME_COLOR = "#d97757";

/** Build an absolute URL from a root-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
