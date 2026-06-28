import { STORY_IDS } from "@/content/catalog";
import { OG_SIZE, renderStoryOgImage } from "@/lib/story-og";

/**
 * Per-story Open Graph image for `/read/[id]` — same branded card as the
 * Story-Detail route, so a shared reader deep-link previews identically.
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
