import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReaderScreen } from "@/features/reader/components";
import { STORY_IDS } from "@/content/catalog";
import { getStoryProse } from "@/features/reader/server/getStoryProse";
import { buildStoryMetadata } from "@/lib/story-metadata";

/**
 * Reader route `/read/[id]` — the reading surface for one story. This stays a
 * Server Component; the interactive, data-bound screen is the client boundary
 * (ReaderScreen reads the story via TanStack Query against the MSW-mocked
 * `/api/story/:id`, which parses the Markdown + merges the Spanish sidecar). The
 * app-wide QueryClient provider lives in `src/app/providers.tsx` (wrapped in the
 * root layout), so no provider is duplicated here.
 *
 * Server-side it owns per-story `generateMetadata` (title, description, OG
 * cover) and `generateStaticParams` (prerender the known catalog at build), and
 * it reads the story PROSE server-side (`getStoryProse`) to hand the Reader an
 * `initialProse` base layer — so the full readable story is in the prerendered
 * HTML (crawlable + no-JS) before the interactive client Reader hydrates. The
 * canonical for indexing is the Story-Detail page; this surface still carries
 * its own title/OG for clean deep-link previews.
 */
type Props = { params: Promise<{ id: string }> };

/** Prerender every catalog story at build (others fall back to on-demand SSR). */
export function generateStaticParams() {
  return STORY_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return buildStoryMetadata(id, "read");
}

export default async function ReaderPage({ params }: Props) {
  const { id } = await params;
  const prose = getStoryProse(id);
  if (!prose) notFound();

  // Key by id so navigating between stories remounts the screen — a fresh mount
  // resets the reading position + closes any open popover with no reset effect.
  return <ReaderScreen key={id} storyId={id} initialProse={prose} />;
}
