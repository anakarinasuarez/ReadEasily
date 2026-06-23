"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/ui/button";
import { PlayerBar } from "@/components/player-bar";
import { WordPopover } from "@/components/word-popover";
import { BgDecorations } from "@/components/bg-decorations";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { useStory } from "../hooks/useStory";
import { useSaveWord } from "../hooks/useSaveWord";
import { useReaderAudio } from "../hooks/useReaderAudio";
import { buildSentences } from "../audio/sentences";
import { lookupWord } from "../content/lemma";
import { ReadingCard } from "./ReadingCard";
import { ReaderToggles } from "./ReaderToggles";
import { ReaderError, ReaderSkeleton } from "./ReaderStates";
import { ChevronLeftIcon } from "./icons";

/**
 * ReaderScreen — the Reader route (`/read/[id]`), the heart of the app (Figma
 * "Screen / Reader" desktop 125:153, mobile 856:928). This is the feature's one
 * client component: it reads the story via TanStack Query (`useStory`), owns the
 * reading interactions (paginate, tap-a-word → meaning popover, save a word, the
 * translation toggle), and the focus/announce choreography around them. Loading,
 * error and the no-translation degrade are part of the slice.
 *
 * AUDIO is Web Speech (client TTS) via `useReaderAudio`: play/pause reads the
 * story one sentence at a time, the spoken sentence highlights in the passage,
 * and the popover's Pronounce voices a tapped word. Where the browser has no
 * `speechSynthesis` the hook reports `status="disabled"` and the PlayerBar keeps
 * its inert "Audio is unavailable" state — the feature degrades, never crashes.
 * Practice remains a seam this pass.
 *
 * Layout (responsive variants, not a rebuild): a full-bleed warm backdrop (the
 * faint story cover under a wash, else the atmospheric BgDecorations); an in-flow
 * (non-sticky) header with a `‹ Library` breadcrumb-back and the ES/US pills; a
 * centered Display/L title; a centered ~745px reading column → ReadingCard; a tap
 * hint that dismisses after the first tap; and the fixed-bottom PlayerBar.
 */
export interface ReaderScreenProps {
  /** The story id from the route param. */
  storyId: string;
}

/** Strip surrounding punctuation from a tapped surface; Title-case it for the
 *  popover header + the saved-word card (matches the Saved screen's casing). */
function displayWord(surface: string): string {
  const cleaned = surface
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/[^\p{L}\p{N}]+$/u, "");
  if (cleaned.length === 0) return surface;
  return cleaned[0].toUpperCase() + cleaned.slice(1);
}

/** The breadcrumb-back. Story Detail doesn't exist yet, so it returns to Library. */
function Breadcrumb() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-[var(--space-md)]">
      <Link href="/" aria-label="Back to Library" className="gap-[var(--space-xs)] no-underline">
        <span aria-hidden="true" className="inline-flex size-[16px] [&>svg]:size-full">
          <ChevronLeftIcon />
        </span>
        Library
      </Link>
    </Button>
  );
}

interface SelectedWord {
  id: string;
  surface: string;
}

export function ReaderScreen({ storyId }: ReaderScreenProps) {
  const { data: story, isPending, isError, refetch } = useStory(storyId);
  const { data: savedData } = useSaved();
  const save = useSaveWord();

  // Local UI state.
  const [pageIndex, setPageIndex] = useState(0);
  const [translationVisible, setTranslationVisible] = useState(true);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Track the mobile breakpoint so the popover renders anchored (desktop) or as
  // a centered panel (mobile). matchMedia keeps it in sync on resize/rotate.
  // (A new story remounts the screen — the route keys ReaderScreen by id — so
  // there's no per-story reset effect: fresh mount = fresh reading position.)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Anchor the popover under (or above) the tapped word on desktop, via a
  // callback ref: it runs at commit (before paint, so no flash) on each open and
  // measures the panel + the word's rect, then sets the position imperatively —
  // no layout-effect setState, no cascading render. Mobile uses fixed classes.
  const positionPopover = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || isMobile || !anchorRect) return;
      const margin = 12;
      const width = node.offsetWidth || 320;
      const height = node.offsetHeight || 220;

      let left = anchorRect.left + anchorRect.width / 2 - width / 2;
      left = Math.max(
        margin,
        Math.min(left, window.innerWidth - width - margin),
      );

      // Prefer below the word; flip above if it would overflow the viewport.
      let top = anchorRect.bottom + margin;
      if (top + height > window.innerHeight - margin) {
        top = Math.max(margin, anchorRect.top - height - margin);
      }
      node.style.top = `${top}px`;
      node.style.left = `${left}px`;
    },
    [isMobile, anchorRect],
  );

  const pageCount = story?.pages.length ?? 0;
  const currentPage =
    story && story.pages.length > 0
      ? story.pages[Math.min(pageIndex, story.pages.length - 1)]
      : null;

  // Audio (Web Speech). Derive the current page's sentences (same tokenizer the
  // passage uses, so word indices align), then drive playback via the hook. It
  // resets + cancels on page turn (resetKey) and on unmount — no audio bleed.
  const sentences = useMemo(
    () => (currentPage ? buildSentences(currentPage) : []),
    [currentPage],
  );
  const audio = useReaderAudio({ sentences, resetKey: pageIndex });

  const handleActivateWord = useCallback(
    (info: { id: string; surface: string }) => {
      setHintDismissed(true);
      setSelectedWord({ id: info.id, surface: info.surface });
      // Capture the live word element's rect for desktop anchoring.
      const el = document.querySelector<HTMLElement>(
        `[data-word-id="${info.id}"]`,
      );
      setAnchorRect(el?.getBoundingClientRect() ?? null);
    },
    [],
  );

  // Close the popover and return focus to the originating word (the popover
  // traps focus while open; restoring it on close is the feature's job).
  const closePopover = useCallback(() => {
    const id = selectedWord?.id;
    setSelectedWord(null);
    setAnchorRect(null);
    if (!id) return;
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-word-id="${id}"]`)
        ?.focus();
    });
  }, [selectedWord]);

  const goToPage = useCallback(
    (next: number) => {
      if (!story) return;
      const clamped = Math.min(Math.max(next, 0), story.pages.length - 1);
      // Page change = same-screen state change: close the popover, keep scroll.
      setSelectedWord(null);
      setAnchorRect(null);
      setPageIndex(clamped);
    },
    [story],
  );

  // The tapped word's meaning (instant — local glossary). Always "ready".
  const meaning = selectedWord
    ? lookupWord(story?.glossary ?? {}, selectedWord.surface)
    : null;
  const wordLabel = selectedWord ? displayWord(selectedWord.surface) : "";
  const isWordSaved =
    !!savedData?.words.some(
      (w) => w.word.toLowerCase() === wordLabel.toLowerCase(),
    );

  function handleToggleSave() {
    // Only save real dictionary hits — never persist a "(traducción pendiente)"
    // placeholder for a function word. The popover's Save is disabled in that
    // case too (canSave below); this is the matching guard.
    if (!selectedWord || !story || isWordSaved || !meaning || !meaning.found) {
      return;
    }
    save.mutate({
      word: wordLabel,
      phonetic: meaning.phonetic,
      translation: meaning.translation,
      sourceStoryId: story.id,
      sourceStoryTitle: story.title,
      sentencesReady: 0,
      savedAt: new Date().toISOString(),
    });
  }

  return (
    <main className="relative flex min-h-full flex-1 flex-col bg-canvas">
      {/* Full-bleed warm backdrop — faint cover under a wash, else atmosphere. */}
      {story?.coverSrc ? (
        <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <Image
            src={story.coverSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-canvas opacity-60" />
        </div>
      ) : (
        <BgDecorations fixed />
      )}

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-lg pt-lg pb-[200px]">
        {/* Header band — breadcrumb-back (left), ES/US pills (right). In-flow. */}
        <div className="flex w-full items-center justify-between gap-lg">
          <Breadcrumb />
          {story && (
            <ReaderToggles
              translationVisible={translationVisible}
              onToggleTranslation={() => setTranslationVisible((v) => !v)}
              hasTranslation={story.hasTranslation}
            />
          )}
        </div>

        {/* Centered reading column. */}
        <div className="mt-2xl flex w-full flex-1 flex-col items-center gap-[var(--space-3xl)]">
          {isError ? (
            <ReaderError onRetry={() => void refetch()} />
          ) : isPending || !story || !currentPage ? (
            <ReaderSkeleton />
          ) : (
            <>
              <h1 className="text-center text-[color:var(--text-primary)] [font-family:var(--text-display-l-family)] [font-size:var(--text-display-l-size)] [font-weight:var(--text-display-l-weight)] [line-height:var(--text-display-l-line-height)] [letter-spacing:var(--text-display-l-tracking)]">
                {story.title}
              </h1>

              <ReadingCard
                page={currentPage}
                pageCount={pageCount}
                translationVisible={translationVisible}
                selectedWordId={selectedWord?.id ?? null}
                speakingWordRange={audio.currentWordRange}
                onActivateWord={handleActivateWord}
                onPrevPage={() => goToPage(pageIndex - 1)}
                onNextPage={() => goToPage(pageIndex + 1)}
              />

              {!hintDismissed && (
                <p className="text-center text-[color:var(--text-muted)] [font-family:var(--text-label-m-family)] [font-size:var(--text-label-m-size)] [font-weight:var(--text-label-m-weight)] [line-height:var(--text-label-m-line-height)] [letter-spacing:var(--text-label-m-tracking)]">
                  Tap any word to hear it &amp; see its meaning
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fixed-bottom PlayerBar — live when Web Speech is supported, else it
          keeps its inert "Audio is unavailable" state (hook reports status). */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <PlayerBar
          // Don't show an enabled-looking "ready" bar before content exists:
          // while the story is loading/errored (no current page) the supported
          // bar reads "loading" rather than an inert-but-active Play button.
          status={
            audio.status === "disabled"
              ? "disabled"
              : currentPage
                ? audio.status
                : "loading"
          }
          playing={audio.playing}
          progress={audio.progress}
          elapsedLabel={audio.elapsedLabel}
          totalLabel={audio.totalLabel}
          sentenceCount={audio.totalSentences}
          speed={audio.speed}
          level={story?.level}
          onTogglePlay={audio.toggle}
          onSeek={audio.seek}
          onPrevSentence={audio.prev}
          onNextSentence={audio.next}
          onRestart={audio.restart}
          onSkipEnd={audio.skipEnd}
          onCycleSpeed={audio.cycleSpeed}
        />
      </div>

      {/* Tap-a-word meaning popover. Desktop: anchored to the word (auto-flip).
          Mobile: a centered panel near the bottom. The component owns its focus
          trap + Esc; the feature restores focus to the word on close. */}
      {selectedWord && meaning && (
        <div className="fixed inset-0 z-50">
          {/* Click-outside backdrop (not focusable; the popover traps Tab). */}
          <div
            aria-hidden="true"
            onClick={closePopover}
            className={
              // Anchored popover (Figma) shows no dim on desktop; the mobile
              // centered panel gets a light scrim to focus it.
              isMobile ? "absolute inset-0 bg-[var(--scrim)]" : "absolute inset-0 bg-transparent"
            }
          />
          <div
            ref={positionPopover}
            className={
              isMobile
                ? "absolute bottom-[120px] left-1/2 w-[320px] max-w-[calc(100vw-32px)] -translate-x-1/2"
                : "absolute left-0 top-0 w-[320px] max-w-[calc(100vw-24px)]"
            }
          >
            <WordPopover
              word={wordLabel}
              pos={meaning.pos}
              translation={meaning.translation}
              status="ready"
              saved={isWordSaved}
              // Only dictionary hits are savable — a miss shows the placeholder
              // translation (fine for reading) but the Save button stays disabled.
              canSave={meaning.found}
              // Pronounce the word via Web Speech. Passing the handler flips the
              // popover's pronounce chip from inert to live. When audio is
              // unsupported the handler is omitted so the chip stays disabled and
              // focus skips it (no dead control). Pronouncing pauses story
              // playback (the hook stops it); it stays paused (user-initiated).
              onPronounce={
                audio.supported
                  ? () => audio.pronounceWord(wordLabel)
                  : undefined
              }
              onToggleSave={handleToggleSave}
              onPractice={() => {
                // TODO(practice): open the practice flow once it exists.
              }}
              onClose={closePopover}
            />
          </div>
        </div>
      )}
    </main>
  );
}
