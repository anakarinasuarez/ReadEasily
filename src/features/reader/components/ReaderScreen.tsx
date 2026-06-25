"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/ui/button";
import { usePreferences } from "@/stores/preferences";
import { PlayerBar } from "@/components/player-bar";
import { WordPopover } from "@/components/word-popover";
import { BgDecorations } from "@/components/bg-decorations";
import { PracticeOverlay } from "@/features/practice/components";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { useStory } from "../hooks/useStory";
import { useSaveWord } from "../hooks/useSaveWord";
import { useReaderAudio } from "../hooks/useReaderAudio";
import { useFollowReadingScroll } from "../hooks/useFollowReadingScroll";
import { buildSentences } from "../audio/sentences";
import { lookupWord } from "../content/lemma";
import {
  LANGUAGE_LABELS,
  READER_LANG_TO_STORE,
  STORE_ACCENT_TO_VOICE,
  STORE_LANG_TO_READER,
  VOICE_TO_STORE_ACCENT,
  type Language,
  type VoiceAccent,
} from "../types";
import type { ReaderSpeech } from "../audio/speechController";
import { ReadingCard } from "./ReadingCard";
import { ReaderToggles } from "./ReaderToggles";
import { ReaderError, ReaderSkeleton } from "./ReaderStates";
import { AudioWaveIcon, ChevronLeftIcon, SparkleIcon } from "./icons";

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
  /**
   * Test seam: inject a fake TTS controller (+ force support) so the audio
   * transport — and the auto-scroll-follow that rides on it — can be exercised
   * in jsdom, which has no `speechSynthesis`. Omitted in the app (real Web
   * Speech via feature-detection).
   */
  audioController?: ReaderSpeech;
  audioSupported?: boolean;
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

/** The breadcrumb-back. Origin-aware: catalog cards reach the reader VIA Story
 *  Detail (`/story/${id}` → "Read & Listen" → here), so back returns to that
 *  story's detail screen (`‹ Story Detail`), not all the way to the Library. */
function Breadcrumb({ storyId }: { storyId: string }) {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-[var(--space-md)]">
      <Link
        href={`/story/${storyId}`}
        aria-label="Back to Story Detail"
        className="gap-[var(--space-xs)] no-underline"
      >
        <span aria-hidden="true" className="inline-flex size-[16px] [&>svg]:size-full">
          <ChevronLeftIcon />
        </span>
        Story Detail
      </Link>
    </Button>
  );
}

interface SelectedWord {
  id: string;
  surface: string;
}

export function ReaderScreen({
  storyId,
  audioController,
  audioSupported,
}: ReaderScreenProps) {
  // Translation language + audio voice are NO LONGER local state — the global
  // persisted preferences store is the source of truth (Option B). The Reader
  // reads the store (so a change in Profile is reflected here) and writes it back
  // through the header dropdowns (so a change here reaches Profile + reloads).
  // The store holds short codes (ES/FR/PT, US/UK/AU/CA); the Reader speaks in
  // lowercase sidecar langs + BCP-47 voice tags, so we adapt at the boundary.
  const translationLang = usePreferences((s) => s.translationLang);
  const readingAccent = usePreferences((s) => s.readingAccent);
  const autoplay = usePreferences((s) => s.autoplay);
  const pronounceOnTap = usePreferences((s) => s.pronounceOnTap);
  const setPreference = usePreferences((s) => s.setPreference);

  const language: Language = STORE_LANG_TO_READER[translationLang];
  const voice: VoiceAccent = STORE_ACCENT_TO_VOICE[readingAccent];
  const setLanguage = useCallback(
    (next: Language) => setPreference("translationLang", READER_LANG_TO_STORE[next]),
    [setPreference],
  );
  const setVoice = useCallback(
    (next: VoiceAccent) => setPreference("readingAccent", VOICE_TO_STORE_ACCENT[next]),
    [setPreference],
  );

  const { data: story, isPending, isError, refetch } = useStory(storyId, language);
  const { data: savedData } = useSaved();
  const save = useSaveWord();

  // Local UI state.
  const [pageIndex, setPageIndex] = useState(0);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  // The word the Practice overlay is open for (null = closed). `wordId` is kept
  // so focus returns to the originating token when the overlay dismisses.
  const [practiceTarget, setPracticeTarget] = useState<{
    word: string;
    translation: string;
    phonetic?: string;
    wordId: string;
  } | null>(null);

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
  const audio = useReaderAudio({
    sentences,
    resetKey: pageIndex,
    voiceAccent: voice,
    controller: audioController,
    supported: audioSupported,
  });
  // Stable refs for the callbacks below (the hook memoizes these).
  const pauseAudio = audio.pause;
  const playAudio = audio.play;
  const pronounceWord = audio.pronounceWord;
  const audioReady = audio.supported;

  // Autoplay (store preference). When the user has opted into "Autoplay
  // narration" AND audio is supported, start playback automatically once the
  // story page is ready — once per page load, not on every state change (the ref
  // is keyed by story + page index). It deliberately does NOT re-fire when the
  // user pauses or taps a word: the key is already marked, so we never fight the
  // user. A page turn marks a new key → narration starts on the new page.
  const autoStartedKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!autoplay || !audioReady || !currentPage || sentences.length === 0) {
      return;
    }
    const key = `${storyId}:${pageIndex}`;
    if (autoStartedKeyRef.current === key) return;
    autoStartedKeyRef.current = key;
    playAudio();
  }, [autoplay, audioReady, currentPage, sentences.length, storyId, pageIndex, playAudio]);

  // Auto-scroll follow: while playing, keep the spoken sentence in view. Driven
  // by the active sentence's first word index; pauses with the audio and honors
  // prefers-reduced-motion (inside the hook).
  useFollowReadingScroll({
    targetWordIndex: audio.currentWordRange?.start ?? null,
    playing: audio.playing,
  });

  const handleActivateWord = useCallback(
    (info: { id: string; surface: string }) => {
      // Opening a word's meaning pauses story playback so the narration doesn't
      // keep running over the user while they read the popover (stays paused).
      pauseAudio();
      // "Pronounce on tap" (store preference, default on): speak the tapped word
      // immediately, IN ADDITION to opening the popover. The popover's Pronounce
      // button still works when this is off. `pronounceWord` itself stops story
      // playback first, so the order with `pauseAudio` is harmless.
      if (pronounceOnTap && audioReady) {
        pronounceWord(displayWord(info.surface));
      }
      setHintDismissed(true);
      setSelectedWord({ id: info.id, surface: info.surface });
      // Capture the live word element's rect for desktop anchoring.
      const el = document.querySelector<HTMLElement>(
        `[data-word-id="${info.id}"]`,
      );
      setAnchorRect(el?.getBoundingClientRect() ?? null);
    },
    [pauseAudio, pronounceOnTap, audioReady, pronounceWord],
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

  // Return focus to the originating word token when the Practice overlay closes
  // (Radix would restore focus to the now-unmounted popover trigger otherwise).
  const closePractice = useCallback(() => {
    const id = practiceTarget?.wordId;
    setPracticeTarget(null);
    if (!id) return;
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-word-id="${id}"]`)?.focus();
    });
  }, [practiceTarget]);

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

  // Open the Practice overlay for the selected word, in the active language +
  // voice. Pauses story audio (it stays paused) and hands the popover's panel
  // over to the overlay, keeping the word id for focus-restore on close.
  function handleOpenPractice() {
    if (!selectedWord || !meaning || !story) return;
    pauseAudio();
    setPracticeTarget({
      word: wordLabel,
      translation: meaning.translation,
      phonetic: meaning.phonetic,
      wordId: selectedWord.id,
    });
    setSelectedWord(null);
    setAnchorRect(null);
  }

  return (
    // NOTE: main is transparent — the atmospheric backdrop below is fixed behind
    // it (negative z). An opaque bg here would paint OVER that backdrop and flatten
    // the whole scene (the bug the design-QA caught), so the cream base lives on
    // the backdrop layer instead.
    <main className="relative flex min-h-full flex-1 flex-col">
      {/* Cream base — always under everything (covers load/no-cover states too). */}
      <div aria-hidden="true" className="fixed inset-0 -z-20 bg-canvas pointer-events-none" />
      {/* Full-bleed atmospheric backdrop (Figma 125:153): the story illustration
          fills the screen, kept present (not washed flat) under a soft WARM-CREAM
          veil — rgba(255,250,235,0.45), the measured Figma overlay. The reading
          text sits on the opaque card, so legibility is unaffected by the livelier
          backdrop. A faint giant title watermark floats behind the header. */}
      {story?.coverSrc ? (
        <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <Image
            src={story.coverSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.55]"
          />
          {/* Warm-cream veil (Figma rgba(255,250,235,0.45) — allowed literal, like --scrim). */}
          <div className="absolute inset-0 bg-[rgba(255,250,235,0.45)]" />
          {/* Giant faded story-title watermark, centered behind the header. */}
          <span className="absolute left-1/2 top-[8px] -translate-x-1/2 whitespace-nowrap font-display font-extrabold leading-none text-[color:var(--text-primary)] opacity-[0.05] [font-size:150px]">
            {story.title}
          </span>
        </div>
      ) : (
        <BgDecorations fixed />
      )}

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-lg pt-lg pb-[200px]">
        {/* Header band — breadcrumb-back (left), ES/US pills (right). In-flow. */}
        <div className="flex w-full items-center justify-between gap-lg">
          <Breadcrumb storyId={storyId} />
          {story && (
            <ReaderToggles
              language={language}
              onLanguageChange={setLanguage}
              voice={voice}
              onVoiceChange={setVoice}
            />
          )}
        </div>

        {/* Centered reading column. The title↔card gap is Figma-exact off-scale
            geometry: 120px on desktop (column 234:851), scaled down on mobile
            where a 120px gap would waste the 390px viewport. The tap-hint is NOT
            part of this gap — it sits tight under the card (see below). */}
        <div className="mt-2xl flex w-full flex-1 flex-col items-center gap-[64px] md:gap-[120px]">
          {isError ? (
            <ReaderError onRetry={() => void refetch()} />
          ) : isPending || !story || !currentPage ? (
            <ReaderSkeleton />
          ) : (
            <>
              {/* Title row (Figma 125:159): title text + a decorative 18px
                  terracotta waveform glyph (12px gap). Responsive type: mobile
                  ~30px (Figma mobile 856:928 — no --text-heading-h2 token exists
                  yet, so the size is an off-scale literal, flagged for tokens) →
                  md Display/L (44/52, tracking -0.66px). */}
              <h1 className="flex items-center justify-center gap-[12px] text-center text-[color:var(--text-primary)] [font-family:var(--text-display-l-family)] [font-weight:var(--text-display-l-weight)] text-[30px] leading-[38px] md:text-[length:var(--text-display-l-size)] md:[line-height:var(--text-display-l-line-height)] md:[letter-spacing:var(--text-display-l-tracking)]">
                {story.title}
                <span
                  aria-hidden="true"
                  className="inline-flex size-[18px] shrink-0 items-center justify-center text-[color:var(--text-accent)] [&>svg]:size-full"
                >
                  <AudioWaveIcon />
                </span>
              </h1>

              {/* Card + tap-hint: the hint sits tight under the card (Figma
                  125:198), so it lives in this inner stack — not in the big
                  title↔card column gap above. */}
              <div className="flex w-full flex-col items-center">
                <ReadingCard
                  page={currentPage}
                  pageCount={pageCount}
                  translationVisible={story.hasTranslation}
                  translationLabel={LANGUAGE_LABELS[language]}
                  translationLang={language}
                  selectedWordId={selectedWord?.id ?? null}
                  speakingWordRange={audio.currentWordRange}
                  onActivateWord={handleActivateWord}
                  onPrevPage={() => goToPage(pageIndex - 1)}
                  onNextPage={() => goToPage(pageIndex + 1)}
                />

                {!hintDismissed && (
                  <p className="mt-[var(--space-md)] inline-flex items-center justify-center gap-[var(--space-xs)] text-center text-[color:var(--text-muted)] [font-family:var(--text-label-m-family)] [font-size:var(--text-label-m-size)] [font-weight:var(--text-label-m-weight)] [line-height:var(--text-label-m-line-height)] [letter-spacing:var(--text-label-m-tracking)]">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-[12px] shrink-0 items-center justify-center text-[color:var(--text-accent)] [&>svg]:size-full"
                    >
                      <SparkleIcon />
                    </span>
                    Tap any word to hear it &amp; see its meaning
                  </p>
                )}
              </div>
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
              onPractice={handleOpenPractice}
              onClose={closePopover}
            />
          </div>
        </div>
      )}

      {/* Practice overlay — opened from the popover's Practice button for the
          selected word, in the active language + voice. Records provenance from
          the current story; closing returns focus to the originating token. */}
      {story && (
        <PracticeOverlay
          open={!!practiceTarget}
          onOpenChange={(next) => {
            if (!next) closePractice();
          }}
          word={practiceTarget?.word ?? ""}
          translation={practiceTarget?.translation}
          phonetic={practiceTarget?.phonetic}
          language={language}
          voice={voice}
          sourceStoryId={story.id}
          sourceStoryTitle={story.title}
          audioController={audioController}
          audioSupported={audioSupported}
        />
      )}
    </main>
  );
}
