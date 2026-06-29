import type { Metadata } from "next";
import { getCatalogEntry } from "@/content/catalog";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

/**
 * Per-story SEO — shared by the Story-Detail (`/story/[id]`) and Reader
 * (`/read/[id]`) routes so their `generateMetadata` stays DRY. Reads the
 * server-readable `CATALOG` (never the browser-only MSW mock), so titles,
 * descriptions, and OG images resolve at build/request time.
 *
 * An unknown id returns empty metadata (inherits the site defaults); the route
 * itself decides whether to 404.
 */
export function buildStoryMetadata(
  id: string,
  surface: "detail" | "read",
): Metadata {
  const story = getCatalogEntry(id);
  if (!story) return {};

  const path = surface === "detail" ? `/story/${id}` : `/read/${id}`;
  const description = story.teaser;

  // The OG/Twitter image is owned by the per-route `opengraph-image` file
  // convention (a branded card from `renderStoryOgImage`); twitter:image
  // inherits it. We deliberately don't set `images` here so the generated card
  // wins instead of the WebP cover (which Satori can't decode anyway).
  return {
    title: story.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: story.title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
    },
  };
}

/**
 * JSON-LD for a story's detail page — a schema.org `LearningResource` (a graded
 * reading lesson). Rich results can surface the CEFR level, language, and that
 * it's free. Returns `null` for an unknown id so the page renders no script.
 */
export function buildStoryJsonLd(id: string): Record<string, unknown> | null {
  const story = getCatalogEntry(id);
  if (!story) return null;

  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: story.title,
    headline: story.title,
    description: story.teaser,
    url: absoluteUrl(`/story/${story.id}`),
    image: absoluteUrl(story.coverSrc),
    inLanguage: "en",
    learningResourceType: "Short story",
    educationalLevel: `CEFR ${story.level}`,
    teaches: "English reading and vocabulary",
    genre: story.category,
    wordCount: story.words,
    isAccessibleForFree: true,
    isFamilyFriendly: true,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
