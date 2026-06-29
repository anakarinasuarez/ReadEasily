import type { MetadataRoute } from "next";
import { CATALOG } from "@/content/catalog";
import { SITE_URL } from "@/lib/site";

/**
 * Dynamic sitemap — the public, indexable surface. Lists the marketing/catalog
 * entry points plus a Story-Detail and Reader URL for every story in the
 * catalog, so search engines can discover all 10 stories (which they otherwise
 * couldn't, since the routes are param-driven). Driven by `CATALOG` so new
 * stories appear automatically once added.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/library`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  for (const story of CATALOG) {
    entries.push(
      {
        url: `${SITE_URL}/story/${story.id}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/read/${story.id}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
      },
    );
  }

  return entries;
}
