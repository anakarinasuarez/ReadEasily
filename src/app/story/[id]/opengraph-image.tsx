import { STORY_IDS } from "@/content/catalog";
import { OG_SIZE, renderStoryOgImage } from "@/lib/story-og";

/**
 * Per-story Open Graph image for `/story/[id]` (also used for twitter:image,
 * which inherits the OG image when no twitter-image file is present). Prerendered
 * per story at build via the catalog-driven `renderStoryOgImage`.
 */
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Story preview · ReadEasily";

/** Prerender one card per catalog story at build. */
export function generateStaticParams() {
  return STORY_IDS.map((id) => ({ id }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return renderStoryOgImage(id);
}
