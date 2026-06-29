import Link from "next/link";
import { BgDecorations } from "@/components/bg-decorations";
import { BookCover } from "@/components/book-card";
import { MoralCallout } from "@/components/moral-callout";
import { Button } from "@/ui/button";
import type { StoryContent } from "../server/getStoryContent";
import { StoryDetailNavbar } from "./StoryDetailNavbar";
import { StoryKeyWords } from "./StoryKeyWords";
import { ChevronLeftIcon, ClockIcon, PlayIcon, WordsIcon } from "./icons";

/**
 * StoryDetailContent — the Story Detail screen (Figma "Screen / Story Detail"
 * desktop 122:136 / mobile 841:876), now a **Server Component**. The cover,
 * copy, meta, teaser, moral, breadcrumb, and CTA render on the server from
 * `getStoryContent` (catalog-derived), so they land in the prerendered HTML —
 * indexable and shipping zero client JS. Only the two interactive, runtime-data
 * pieces are client islands: the `StoryDetailNavbar` (account menu) and the
 * `StoryKeyWords` chips (glossary-fed, save interaction).
 *
 * Layout (responsive VARIANT, not a rebuild): desktop is a two-column body —
 * LEFT (cover + the full-width CTA) beside RIGHT (eyebrow, title, meta, teaser,
 * the fable moral, and the key-words island). On mobile both columns are
 * `display:contents` so their leaves interleave into one sequence via `order-*` —
 * one DOM, two layouts, no duplication. The key-words island sits at `order-8`.
 */

/** Meta type = Baloo 2 Bold 13/18 — the eyebrow + meta-row label style. */
const metaType =
  "[font-family:var(--text-meta-family)] [font-size:var(--text-meta-size)] [font-weight:var(--text-meta-weight)] [line-height:var(--text-meta-line-height)] [letter-spacing:var(--text-meta-tracking)]";

export interface StoryDetailContentProps {
  /** The static, server-readable content for the story. */
  content: StoryContent;
  /** The story id from the route param — passed to the key-words island. */
  storyId: string;
}

export function StoryDetailContent({ content, storyId }: StoryDetailContentProps) {
  return (
    <main className="relative flex min-h-full flex-1 flex-col bg-canvas">
      {/* Screen-level atmospheric backdrop, behind the content (contained). */}
      <BgDecorations />

      {/* Floating navbar (client island) — sticky; Library is active. */}
      <StoryDetailNavbar />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-lg py-2xl">
        <div className="flex w-full flex-col gap-[var(--space-lg)]">
          {/* Breadcrumb-back to the Library (`‹ Library`). */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-[var(--space-md)] self-start"
          >
            <Link
              href="/library"
              aria-label="Back to Library"
              className="gap-[var(--space-xs)] no-underline"
            >
              <span
                aria-hidden="true"
                className="inline-flex size-[16px] [&>svg]:size-full"
              >
                <ChevronLeftIcon />
              </span>
              Library
            </Link>
          </Button>

          {/* Two-column body. Both columns are `contents` on mobile so the
              leaves interleave into the single mobile sequence via order-*. */}
          <div className="flex w-full flex-col gap-[var(--space-lg)] md:flex-row md:items-start md:gap-[60px]">
            {/* LEFT — cover + CTA (desktop column; contents on mobile). */}
            <div className="contents md:flex md:w-[339px] md:flex-col md:items-center md:gap-[20px]">
              <BookCover
                size="hero"
                src={content.coverSrc}
                alt={`Cover of ${content.title}`}
                priority
                className="order-3 mx-auto shadow-lg md:order-none md:mx-0"
              />

              <Button
                asChild
                variant="primary"
                size="lg"
                className="order-5 w-full transition-colors duration-300 ease-out md:order-none md:w-[320px]"
              >
                <Link
                  href={content.readHref}
                  className="gap-[var(--space-sm)] no-underline"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex size-[18px] [&>svg]:size-full"
                  >
                    <PlayIcon />
                  </span>
                  Read &amp; Listen
                </Link>
              </Button>
            </div>

            {/* RIGHT — copy + key words (desktop column; contents on mobile). */}
            <div className="contents md:flex md:min-w-0 md:flex-1 md:flex-col md:gap-[18px]">
              {/* Eyebrow — Meta type, accent. */}
              <p
                className={`order-1 whitespace-pre-wrap text-[color:var(--text-accent)] ${metaType}`}
              >
                {content.eyebrow}
              </p>

              {/* Title — Display/XL desktop, Display/Mobile on phones. */}
              <h1 className="order-2 font-display font-extrabold text-primary [font-size:var(--text-display-mobile-size)] [letter-spacing:var(--text-display-mobile-tracking)] [line-height:var(--text-display-mobile-line-height)] md:[font-size:var(--text-display-xl-size)] md:[letter-spacing:var(--text-display-xl-tracking)] md:[line-height:var(--text-display-xl-line-height)]">
                {content.title}
              </h1>

              {/* Meta row — level (secondary) · minutes · words (muted). */}
              <div
                className={`order-4 flex flex-wrap items-center justify-center gap-[18px] md:justify-start ${metaType}`}
              >
                <span className="inline-flex items-center gap-[7px] text-secondary">
                  <span
                    aria-hidden="true"
                    className="inline-block size-[9px] shrink-0 rounded-full bg-info"
                  />
                  {content.level} · {content.levelLabel}
                </span>
                <span className="inline-flex items-center gap-[7px] text-muted">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-[16px] [&>svg]:size-full"
                  >
                    <ClockIcon />
                  </span>
                  {content.minutes} min
                </span>
                <span className="inline-flex items-center gap-[7px] text-muted">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-[16px] [&>svg]:size-full"
                  >
                    <WordsIcon />
                  </span>
                  {content.words} words
                </span>
              </div>

              {/* Teaser — Body/L (Lora 20/28), secondary. */}
              <p className="order-6 font-reading text-secondary [font-size:var(--text-body-l-size)] [line-height:var(--text-body-l-line-height)] md:max-w-[530px]">
                {content.teaser}
              </p>

              {/* Moral — fables only. */}
              {content.moral != null && content.moral !== "" && (
                <MoralCallout
                  moral={content.moral}
                  className="order-7 w-full md:max-w-[532px]"
                />
              )}

              {/* Key words you'll learn — client island (glossary + save). */}
              <StoryKeyWords storyId={storyId} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
