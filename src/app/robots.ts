import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt — allow crawling of the public catalog (home, library, search,
 * story/reader pages) and keep account/auth utility routes out of the index
 * (they carry no SEO value and are gated client-side anyway). Points crawlers
 * at the sitemap so all story URLs are discoverable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/signup", "/forgot", "/profile", "/saved"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
