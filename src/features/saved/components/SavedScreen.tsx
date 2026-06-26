"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar, useNavbarUser, type NavbarItem } from "@/components/navbar";
import { StatPill } from "@/components/stat-pill";
import { Button } from "@/ui/button";
import { usePreferences } from "@/stores/preferences";
import { speakWord } from "@/lib/audio/speakWord";
import { PracticeOverlay } from "@/features/practice/components";
import {
  STORE_ACCENT_TO_VOICE,
  STORE_LANG_TO_READER,
} from "@/features/reader/types";
import type { ReaderSpeech } from "@/features/reader/audio/speechController";
import { useSaved } from "../hooks/useSaved";
import { useRemoveSavedWord } from "../hooks/useRemoveSavedWord";
import type { SavedStats, SavedWord } from "../types";
import { SavedGrid } from "./SavedGrid";
import { SavedEmpty, SavedError, SavedSkeleton } from "./SavedStates";
import { ChevronLeftIcon, LibraryIcon, SavedIcon, SearchIcon } from "./icons";

/**
 * SavedScreen — the Saved route (`/saved`), 1:1 with Figma "Screen / Saved"
 * (desktop 137:154, empty 144:181; mobile 866:1094 / 864:1048). This is the
 * feature's one client component: it reads server state via `useSaved` and owns
 * the screen's interactions — removing (unsaving) a word and the focus/announce
 * choreography around it. Loading, error and empty are part of the slice.
 *
 * Layout (responsive variants, not a rebuild):
 *  • Desktop — sticky Navbar (Saved active); in-flow breadcrumb `‹ Library`;
 *    a header with the eyebrow + "Saved words" title on the left and the two
 *    stat pills on the right; a 4-column card grid.
 *  • Mobile — same, but the title is smaller, only the "words to review" pill
 *    shows (practice-sets is dropped), and the grid is a single column.
 *  • Empty — centered eyebrow + title above the designed EmptyState card; the
 *    breadcrumb is hidden on mobile (per Figma 864:1048).
 *
 * Remove is a same-screen state change: the card fades + shrinks out over 300ms
 * (window scroll untouched — preserved), then an optimistic cache edit drops it
 * and the grid reflows. Focus then moves to the next card's word link (or, when
 * the last word is removed, to the EmptyState CTA), and a polite live region
 * announces the change.
 */

/** Primary nav — Saved is the active destination on this screen. */
const NAV_ITEMS: NavbarItem[] = [
  { key: "library", label: "Library", icon: <LibraryIcon />, href: "/library" },
  { key: "search", label: "Search", icon: <SearchIcon />, href: "/search" },
  { key: "saved", label: "Saved", icon: <SavedIcon />, href: "/saved" },
];

/** Account affordance for the Navbar (no user contract on this screen yet). */
const SCREEN_USER = { name: "Ana" };

/** Card exit animation duration — kept in lock-step with the 300ms class. */
const EXIT_MS = 300;

/** Sentinel: focus the EmptyState CTA (the list just became empty). */
const FOCUS_EMPTY = "__empty__";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Eyebrow — Label/S, uppercase, AA accent. */
function Eyebrow() {
  return (
    <span className="font-display font-bold uppercase text-accent-text [font-size:var(--text-label-s-size)] [letter-spacing:var(--text-label-s-tracking)] [line-height:var(--text-label-s-line-height)]">
      Your word collection
    </span>
  );
}

/** H1 — heading/h3 on mobile, Display/L (Baloo ExtraBold) from `md`. */
function Title() {
  return (
    <h1 className="font-display font-extrabold text-primary [font-size:var(--text-heading-h3-size)] [line-height:var(--text-heading-h3-line-height)] md:[font-size:var(--text-display-l-size)] md:[letter-spacing:var(--text-display-l-tracking)] md:[line-height:var(--text-display-l-line-height)]">
      Saved words
    </h1>
  );
}

/** A loading placeholder shaped like a StatPill (no layout shift on data). */
function StatPillSkeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-[56px] w-[145px] animate-pulse rounded-md bg-[var(--bg-subtle)] motion-reduce:animate-none ${className ?? ""}`}
    />
  );
}

/**
 * What occupies the header's stat-pill slot:
 *  • a `SavedStats` → the real pills
 *  • "loading"      → pill skeletons (keeps the header's shape while data loads)
 *  • "none"         → nothing (the error state, where a permanent "loading"
 *                     shimmer above a failure would be misleading)
 */
type HeaderPills = SavedStats | "loading" | "none";

/**
 * Header for the populated/loading/error states: eyebrow + title (left) and the
 * stat-pill slot (right). The "practice sets" pill is desktop-only (dropped on
 * mobile per Figma 866:1094).
 */
function PopulatedHeader({ pills }: { pills: HeaderPills }) {
  return (
    <header className="flex w-full flex-col gap-sm">
      <div className="flex w-full flex-col items-start justify-between gap-lg md:flex-row md:items-start">
        <div className="flex flex-col gap-xs">
          <Eyebrow />
          <Title />
        </div>
        {pills !== "none" && (
          <div className="flex shrink-0 items-start gap-md-plus">
            {pills === "loading" ? (
              <>
                <StatPillSkeleton />
                <StatPillSkeleton className="hidden md:block" />
              </>
            ) : (
              <>
                <StatPill
                  value={pills.wordsToReview}
                  label="words to review"
                  tone="accent"
                />
                <StatPill
                  className="hidden md:inline-flex"
                  value={pills.practiceSets}
                  label="practice sets"
                  tone="warning"
                />
              </>
            )}
          </div>
        )}
      </div>
      <p className="text-muted [font-size:var(--text-caption-size)] [line-height:var(--text-caption-line-height)]">
        Words saved while reading · tap to review
      </p>
    </header>
  );
}

/** Header for the empty state: centered eyebrow + title, no pills, no subtitle. */
function EmptyHeader() {
  return (
    <header className="flex w-full flex-col items-center gap-xs text-center">
      <Eyebrow />
      <Title />
    </header>
  );
}

/** Breadcrumb-back `‹ Library` — in-flow, non-sticky (mirrors the Search row). */
function Breadcrumb({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={`-ml-[var(--space-md)] ${hideOnMobile ? "hidden md:inline-flex" : ""}`}
    >
      <Link
        href="/library"
        aria-label="Back to Library"
        className="gap-[var(--space-xs)] no-underline"
      >
        <span aria-hidden="true" className="inline-flex size-[16px] [&>svg]:size-full">
          <ChevronLeftIcon />
        </span>
        Library
      </Link>
    </Button>
  );
}

export interface SavedScreenProps {
  /**
   * Test seam: inject a fake TTS controller (+ force support) so the listen
   * button's audio — and the Practice overlay's audio — can be exercised in
   * jsdom, which has no `speechSynthesis`. Omitted in the app (real Web Speech
   * via feature-detection).
   */
  audioController?: ReaderSpeech;
  audioSupported?: boolean;
}

export function SavedScreen({
  audioController,
  audioSupported,
}: SavedScreenProps = {}) {
  const router = useRouter();
  // Overlay any device-local profile overrides (name/avatar) onto the base user.
  const user = useNavbarUser(SCREEN_USER);
  const { data, isPending, isError, refetch } = useSaved();
  const remove = useRemoveSavedWord();

  // Reading prefs drive the spoken accent (Listen) and the Practice overlay's
  // language + voice — the SAME global store the Reader reads, so a change in
  // Profile/Reader is reflected here.
  const readingAccent = usePreferences((s) => s.readingAccent);
  const translationLang = usePreferences((s) => s.translationLang);
  const voice = STORE_ACCENT_TO_VOICE[readingAccent];
  const language = STORE_LANG_TO_READER[translationLang];

  // Memoised so the focus effect's `[words]` dep only changes when the list
  // actually does (a new `[]` literal each render would re-run it pointlessly).
  const words = useMemo(() => data?.words ?? [], [data]);
  const isEmpty = !isPending && !isError && words.length === 0;

  // The card currently animating out (drives the exit transition in SavedGrid).
  const [exitingId, setExitingId] = useState<string | null>(null);
  // The word the Practice overlay is open for (null = closed). Kept whole so the
  // overlay gets its word/translation/phonetic/provenance, and its id restores
  // focus to the originating card on close.
  const [practiceTarget, setPracticeTarget] = useState<SavedWord | null>(null);
  // Polite announcement for removals.
  const [announcement, setAnnouncement] = useState("");

  const listRef = useRef<HTMLUListElement>(null);
  const emptyRef = useRef<HTMLDivElement>(null);
  // Where focus should land once the list re-renders after a removal.
  const pendingFocus = useRef<string | null>(null);
  // Handle for the pending exit-animation timer, so it can be cleared if the
  // screen unmounts mid-exit (e.g. a route change during the 300ms) — otherwise
  // its callback would `setState` on an unmounted tree.
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any in-flight exit timer on unmount.
  useEffect(
    () => () => {
      if (exitTimer.current !== null) clearTimeout(exitTimer.current);
    },
    [],
  );

  // After the words list changes (removal committed → optimistic cache edit),
  // move focus to the queued target: the next card's word link, or the
  // EmptyState CTA when the list emptied. Deferred a frame so the DOM reflects
  // the removal / the EmptyState mount before we focus. `words` is the only
  // trigger; the refs are stable.
  useEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    const raf = requestAnimationFrame(() => {
      if (target === FOCUS_EMPTY) {
        emptyRef.current?.querySelector<HTMLElement>("a, button")?.focus();
      } else {
        listRef.current
          ?.querySelector<HTMLElement>(`li[data-word-id="${target}"] a`)
          ?.focus();
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [words]);

  function handleListen(word: SavedWord) {
    // Pronounce the word via the SAME Web Speech path the Reader uses, in the
    // user's reading accent. A graceful no-op where speech is unsupported.
    speakWord(word.word, {
      voiceAccent: voice,
      controller: audioController,
      supported: audioSupported,
    });
  }

  function handlePractice(word: SavedWord) {
    setPracticeTarget(word);
  }

  // Close the Practice overlay and return focus to the card's word link (the
  // dialog traps focus; restoring it to the originating card is the screen's job).
  function closePractice() {
    const id = practiceTarget?.id;
    setPracticeTarget(null);
    if (id == null) return;
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector<HTMLElement>(`li[data-word-id="${id}"] a`)
        ?.focus();
    });
  }

  function handleRemove(word: SavedWord, index: number) {
    if (exitingId) return; // one removal at a time
    // The card that will occupy this slot next (or the previous one), else the
    // list empties → focus the EmptyState CTA.
    const next = words[index + 1] ?? words[index - 1] ?? null;
    const remaining = words.length - 1;

    const commit = () => {
      exitTimer.current = null;
      pendingFocus.current = next ? next.id : FOCUS_EMPTY;
      setAnnouncement(
        `Removed ${word.word}. ${remaining} ${remaining === 1 ? "word" : "words"} saved.`,
      );
      remove.mutate(word.id);
      setExitingId(null);
    };

    if (prefersReducedMotion()) {
      commit();
    } else {
      setExitingId(word.id);
      exitTimer.current = setTimeout(commit, EXIT_MS);
    }
  }

  // Pills for the (non-empty) header: real stats once loaded, skeletons while
  // the first fetch is pending.
  const headerPills: HeaderPills = data?.stats ?? "loading";

  return (
    <main className="flex min-h-full flex-1 flex-col bg-canvas">
      {/* Sticky navbar — consistent with Library/Search. The back affordance is
          NOT in this row; it scrolls with the content. */}
      <div className="sticky top-0 z-50 mx-auto w-full max-w-7xl px-lg pt-lg">
        <Navbar
          items={NAV_ITEMS}
          activeKey="saved"
          user={user}
          onAccountClick={() => router.push("/profile")}
        />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-start gap-2xl px-lg py-2xl">
        {/* Breadcrumb — hidden on mobile only in the empty state (Figma). */}
        <Breadcrumb hideOnMobile={isEmpty} />

        {/* Polite live region — announces removals to AT. */}
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>

        {isError ? (
          <>
            {/* No stat-pill slot on the error state — a permanent "loading"
                shimmer above a failure would be misleading. */}
            <PopulatedHeader pills="none" />
            <SavedError onRetry={() => void refetch()} />
          </>
        ) : isEmpty ? (
          <>
            <EmptyHeader />
            <SavedEmpty ref={emptyRef} />
          </>
        ) : (
          <>
            <PopulatedHeader pills={headerPills} />
            {isPending ? (
              <SavedSkeleton />
            ) : (
              <SavedGrid
                ref={listRef}
                words={words}
                exitingId={exitingId}
                onListen={handleListen}
                onPractice={handlePractice}
                onRemove={handleRemove}
              />
            )}
          </>
        )}
      </div>

      {/* Practice overlay — opened from a card's Review/Practice action for that
          word, in the active reading language + voice. Closing returns focus to
          the originating card's word link. Mounted only when a target is set;
          Radix keeps the rest of the screen inert while open. */}
      {practiceTarget && (
        <PracticeOverlay
          open
          onOpenChange={(next) => {
            if (!next) closePractice();
          }}
          word={practiceTarget.word}
          translation={practiceTarget.translation}
          phonetic={practiceTarget.phonetic}
          language={language}
          voice={voice}
          sourceStoryId={practiceTarget.sourceStoryId}
          sourceStoryTitle={practiceTarget.sourceStoryTitle}
          audioController={audioController}
          audioSupported={audioSupported}
        />
      )}
    </main>
  );
}
