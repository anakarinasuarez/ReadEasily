import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STORY_IDS } from "@/content/catalog";
import { StoryDetailContent } from "@/features/story/components";
import { getStoryContent } from "@/features/story/server/getStoryContent";
import { buildStoryJsonLd, buildStoryMetadata } from "@/lib/story-metadata";

/**
 * Story Detail route `/story/[id]` — the bridge between the catalog cards
 * (which land HERE) and the reader: card → `/story/${id}` → "Read & Listen" →
 * `/read/${id}`.
 *
 * Server-first: the static content (cover, title, level, teaser, moral, CTA)
 * renders on the server from the catalog-derived `getStoryContent`, so it is in
 * the prerendered HTML — indexable and shipping no client JS. Only the navbar
 * and the glossary-fed "key words" chips are client islands (inside
 * StoryDetailContent). The page also owns the SEO: per-story `generateMetadata`,
 * `generateStaticParams` (SSG), and a JSON-LD `LearningResource` block.
 */
type Props = { params: Promise<{ id: string }> };

/** Prerender every catalog story at build (others fall back to on-demand SSR). */
export function generateStaticParams() {
  return STORY_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return buildStoryMetadata(id, "detail");
}

export default async function StoryDetailPage({ params }: Props) {
  const { id } = await params;
  const content = getStoryContent(id);
  if (!content) notFound();

  const jsonLd = buildStoryJsonLd(id);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <StoryDetailContent content={content} storyId={id} />
    </>
  );
}
