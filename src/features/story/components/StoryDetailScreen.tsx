"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar, useNavbarUser, type NavbarItem } from "@/components/navbar";
import { BgDecorations } from "@/components/bg-decorations";
import { BookCover } from "@/components/book-card";
import { MoralCallout } from "@/components/moral-callout";
import { WordChip } from "@/components/word-chip";
import { Button } from "@/ui/button";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { useSaveWord } from "@/features/reader/hooks/useSaveWord";
import { useStoryDetail } from "../hooks/useStoryDetail";
import type { StoryKeyWord } from "../types";
import { StoryDetailError, StoryDetailSkeleton } from "./StoryDetailStates";
import {
  ChevronLeftIcon,
  ClockIcon,
  LibraryIcon,
  PlayIcon,
  SavedIcon,
  SearchIcon,
  WordsIcon,
} from "./icons";

/**
 * StoryDetailScreen — the Story Detail route (`/story/[id]`), 1:1 with Figma
 * "Screen / Story Detail" desktop 122:136 / mobile 841:876. It sits between the
 * catalog cards (which now land HERE) and the reader: catalog card →
 * `/story/${id}` → the "Read & Listen" CTA → `/read/${id}`.
 *
 * This is the feature's one client component: it reads the detail via TanStack
 * Query (`useStoryDetail`), owns the key-word chips' save interaction
 * (optimistic via the shared `useSaveWord` seam, reflected from `useSaved`), and
 * its own loading / error / empty states. The chips flip in place (front = the
 * English word ↔ back = its Spanish meaning) — a same-screen morph that never
 * reflows the row or moves the scroll.
 *
 * Layout (responsive VARIANT, not a rebuild): desktop is a two-column body —
 * LEFT (cover + the full-width CTA) beside RIGHT (eyebrow, title, meta, teaser,
 * the fable moral, and the key-words section). On mobile it collapses to one
 * column whose eye-order is Title → Cover → CTA → teaser → key words. Both
 * columns are `display:contents` on mobile so the leaves interleave into the
 * single mobile sequence via `order-*` — one DOM, two layouts, no duplication.
 */

/** Primary nav — Library is active here (the breadcrumb-back target). */
const NAV_ITEMS: NavbarItem[] = [
  { key: "library", label: "Library", icon: <LibraryIcon />, href: "/library" },
  { key: "search", label: "Search", icon: <SearchIcon />, href: "/search" },
  { key: "saved", label: "Saved", icon: <SavedIcon />, href: "/saved" },
];

/** Avatar placeholder shown only while the detail payload is in flight. */
const LOADING_USER = { name: "Reader" };

/** Meta type = Baloo 2 Bold 13/18 — the eyebrow + meta-row label style. */
const metaType =
  "[font-family:var(--text-meta-family)] [font-size:var(--text-meta-size)] [font-weight:var(--text-meta-weight)] [line-height:var(--text-meta-line-height)] [letter-spacing:var(--text-meta-tracking)]";

/** Title-case a surface word so a saved key word matches the Saved screen casing. */
function displayWord(surface: string): string {
  if (surface.length === 0) return surface;
  return surface[0].toUpperCase() + surface.slice(1);
}

export interface StoryDetailScreenProps {
  /** The story id from the route param. */
  storyId: string;
}

export function StoryDetailScreen({ storyId }: StoryDetailScreenProps) {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useStoryDetail(storyId);
  const { data: savedData } = useSaved();
  const save = useSaveWord();

  const savedWords = savedData?.words ?? [];
  const isSaved = (surface: string) =>
    savedWords.some((w) => w.word.toLowerCase() === surface.toLowerCase());

  const handleSave = (keyWord: StoryKeyWord) => {
    if (!data) return;
    if (isSaved(keyWord.surface)) return;
    save.mutate({
      word: displayWord(keyWord.surface),
      phonetic: keyWord.ipa,
      translation: keyWord.translation,
      sourceStoryId: data.id,
      sourceStoryTitle: data.title,
      sentencesReady: 0,
      savedAt: new Date().toISOString(),
    });
  };

  const user = useNavbarUser(LOADING_USER);

  return (
    <main className="relative flex min-h-full flex-1 flex-col bg-canvas">
      {/* Screen-level atmospheric backdrop, behind the content (contained). */}
      <BgDecorations />

      {/* Floating navbar — sticky so it stays in view; Library is active. */}
      <div className="sticky top-0 z-50 mx-auto w-full max-w-7xl px-lg pt-lg">
        <Navbar
          items={NAV_ITEMS}
          activeKey="library"
          user={user}
          onAccountClick={() => router.push("/profile")}
        />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-lg py-2xl">
        {isError ? (
          <StoryDetailError onRetry={() => void refetch()} />
        ) : isPending ? (
          <StoryDetailSkeleton />
        ) : (
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
                  src={data.coverSrc}
                  alt={`Cover of ${data.title}`}
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
                    href={data.href}
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
                  {data.eyebrow}
                </p>

                {/* Title — Display/XL desktop, Display/Mobile on phones. */}
                <h1 className="order-2 font-display font-extrabold text-primary [font-size:var(--text-display-mobile-size)] [letter-spacing:var(--text-display-mobile-tracking)] [line-height:var(--text-display-mobile-line-height)] md:[font-size:var(--text-display-xl-size)] md:[letter-spacing:var(--text-display-xl-tracking)] md:[line-height:var(--text-display-xl-line-height)]">
                  {data.title}
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
                    {data.level} · {data.levelLabel}
                  </span>
                  <span className="inline-flex items-center gap-[7px] text-muted">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-[16px] [&>svg]:size-full"
                    >
                      <ClockIcon />
                    </span>
                    {data.minutes} min
                  </span>
                  <span className="inline-flex items-center gap-[7px] text-muted">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-[16px] [&>svg]:size-full"
                    >
                      <WordsIcon />
                    </span>
                    {data.words} words
                  </span>
                </div>

                {/* Teaser — Body/L (Lora 20/28), secondary. */}
                <p className="order-6 font-reading text-secondary [font-size:var(--text-body-l-size)] [line-height:var(--text-body-l-line-height)] md:max-w-[530px]">
                  {data.teaser}
                </p>

                {/* Moral — fables only. */}
                {data.moral != null && data.moral !== "" && (
                  <MoralCallout
                    moral={data.moral}
                    className="order-7 w-full md:max-w-[532px]"
                  />
                )}

                {/* Key words you'll learn — hidden when there are none. */}
                {data.keyWords.length > 0 && (
                  <section
                    aria-labelledby="story-keywords-heading"
                    className="order-8 flex flex-col gap-[var(--space-md)]"
                  >
                    <div className="flex flex-col gap-[var(--space-xs)]">
                      <h2
                        id="story-keywords-heading"
                        className="text-[color:var(--text-primary)] [font-family:var(--text-heading-h3-family)] [font-size:var(--text-heading-h3-size)] [font-weight:var(--text-heading-h3-weight)] [line-height:var(--text-heading-h3-line-height)]"
                      >
                        Key words you&rsquo;ll learn
                      </h2>
                      <p
                        className={`text-[color:var(--text-muted)] [font-family:var(--text-label-s-family)] [font-size:var(--text-label-s-size)] [font-weight:var(--text-label-s-weight)] [letter-spacing:var(--text-label-s-tracking)] [line-height:var(--text-label-s-line-height)]`}
                      >
                        Tap a word to flip its meaning · tap + to save it for
                        practice
                      </p>
                    </div>

                    <ul className="flex list-none flex-wrap gap-[10px] p-0">
                      {data.keyWords.map((kw) => (
                        <li key={kw.surface} className="flex">
                          <WordChip
                            word={kw.surface}
                            translation={kw.translation}
                            pos={kw.pos}
                            saved={isSaved(kw.surface)}
                            onSave={() => handleSave(kw)}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
