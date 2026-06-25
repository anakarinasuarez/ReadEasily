"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { IconButton } from "@/ui/icon-button";
import { Button } from "@/ui/button";
import {
  candidateLemmas,
  normalizeLemma,
} from "@/features/reader/content/lemma";
import {
  createWebSpeechController,
  isSpeechSupported,
  type ReaderSpeech,
} from "@/features/reader/audio/speechController";
import {
  DEFAULT_VOICE,
  LANGUAGE_LABELS,
  type Language,
  type VoiceAccent,
} from "@/features/reader/types";
import { usePractice } from "../hooks/usePractice";
import { useSavePractice } from "../hooks/useSavePractice";
import { translationFor } from "../types";
import {
  BookmarkIcon,
  CheckIcon,
  GlobeIcon,
  RefreshIcon,
  SpeakerIcon,
  XIcon,
} from "./icons";

/** Join class fragments, dropping falsy ones. */
function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Feature-detection as an external store (mirrors useReaderAudio): no
 *  subscription (support can't change mid-session), `false` on the server so
 *  SSR + first client render agree before resolving to the real value. */
const subscribeSupport = () => () => {};
const getSupportSnapshot = () => isSpeechSupported();
const getSupportServerSnapshot = () => false;

export interface PracticeOverlayProps {
  /** Controlled open state (Radix Dialog mounts the portal only when open). */
  open: boolean;
  /** Fires on any dismiss request (Esc, scrim, close button). */
  onOpenChange: (open: boolean) => void;
  /**
   * The word the overlay practises, as displayed (Title-cased, e.g. "Path").
   * Also the fetch key — `usePractice` lower-cases + lemmatizes it server-side.
   */
  word: string;
  /** The word's translation in the active language (Lora italic header line). */
  translation?: string;
  /** Optional phonetic, persisted by "Save to practice later". */
  phonetic?: string;
  /** The active Reader language — selects which per-sentence line shows. */
  language: Language;
  /** The Reader's current voice accent for spoken audio (default US). */
  voice?: VoiceAccent;
  /** Provenance recorded by "Save to practice later". */
  sourceStoryId: string;
  sourceStoryTitle: string;
  /**
   * Test seam: inject a fake TTS controller (+ force support) so the per-sentence
   * + word audio can be exercised in jsdom (no `speechSynthesis`). Omitted in the
   * app — real Web Speech via feature-detection.
   */
  audioController?: ReaderSpeech;
  audioSupported?: boolean;
}

/* ---------------------------------------------------------------------------
 * Token-bound class fragments. Every color / radius / shadow / space / font
 * resolves to a CSS custom property from src/tokens/*. Off-scale geometry that
 * the design system does not tokenize (the Figma-measured 20/18 card inset, the
 * 30px header word, the 34px pronounce chip) is the only literal, each flagged.
 * Motion uses `starting:` (@starting-style) so the 200ms overlay dissolve/slide
 * needs no keyframes; `motion-reduce:` drops it to a fade for reduced-motion.
 * ------------------------------------------------------------------------- */
const overlayClasses = cn(
  "fixed inset-0 z-50 bg-[var(--scrim)] backdrop-blur-sm",
  "transition-opacity duration-200 ease-out opacity-100",
  "motion-safe:starting:opacity-0 motion-reduce:transition-none",
);

// Mobile = full-width bottom sheet; md+ = centered dialog (responsive variants,
// not a rebuild — Figma desktop 879:1263 / mobile 992:1657).
const contentClasses = cn(
  "fixed z-50 flex flex-col overflow-hidden bg-[var(--bg-elevated)] outline-none",
  "shadow-[var(--shadow-modal)]",
  // mobile bottom sheet
  "inset-x-0 bottom-0 max-h-[90vh] w-full rounded-t-[var(--radius-2xl)]",
  // desktop centered panel (Figma 640px)
  "md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[640px]",
  "md:max-w-[calc(100vw-var(--space-xl))] md:max-h-[calc(100vh-var(--space-3xl))]",
  "md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[var(--radius-2xl)]",
  // motion: 200ms — mobile slides up, desktop scales in; reduce → fade only
  "transition duration-200 ease-out opacity-100 translate-y-0 scale-100",
  "motion-safe:starting:opacity-0",
  "max-md:motion-safe:starting:translate-y-full",
  "md:motion-safe:starting:scale-95",
  "motion-reduce:transition-none",
);

const eyebrowClasses = cn(
  "uppercase text-[color:var(--text-accent)]",
  "[font-family:var(--text-label-s-family)] [font-size:var(--text-label-s-size)]",
  "[font-weight:var(--text-label-s-weight)] [line-height:var(--text-label-s-line-height)]",
  "[letter-spacing:var(--text-label-s-tracking)]",
);

// The word: Heading/H1 (Baloo 2 ExtraBold 30/38) — binds to the newly-minted
// --text-heading-h1 ramp entry (size + line-height via `text-heading-h1`,
// family + weight via the tokens). This deliberately aligns the headword to the
// Reader's <h1> (ExtraBold/38), up from the prior SemiBold/leading-none.
const wordClasses = cn(
  "text-[color:var(--text-primary)] [word-break:break-word]",
  "[font-family:var(--text-heading-h1-family)] [font-weight:var(--text-heading-h1-weight)]",
  "text-heading-h1",
);

// Header translation: Reading/quote (Lora Italic 18/28), text-secondary (Figma).
const headerTranslationClasses = cn(
  "italic text-[color:var(--text-secondary)] [word-break:break-word]",
  "[font-family:var(--text-reading-quote-family)] [font-size:var(--text-reading-quote-size)]",
  "[font-weight:var(--text-reading-quote-weight)] [line-height:var(--text-reading-quote-line-height)]",
);

// Sentence English: Body/L (Lora Regular 20/28).
const sentenceClasses = cn(
  "text-[color:var(--text-primary)]",
  "[font-family:var(--text-body-l-family)] [font-size:var(--text-body-l-size)]",
  "[font-weight:var(--text-body-l-weight)] [line-height:var(--text-body-l-line-height)]",
);

// The target word inside a sentence: Lora SemiBold, underlined in the accent.
// Styling ONLY — no semantic emphasis, so AT reads the sentence as plain prose.
const highlightClasses = cn(
  "[font-weight:var(--font-weight-semibold)] text-[color:var(--text-accent)]",
  "underline decoration-from-font underline-offset-2 [text-decoration-skip-ink:none]",
);

// Sentence translation + number: Label/M (Nunito SemiBold 13/18).
const labelMClasses = cn(
  "[font-family:var(--text-label-m-family)] [font-size:var(--text-label-m-size)]",
  "[font-weight:var(--text-label-m-weight)] [line-height:var(--text-label-m-line-height)]",
  "[letter-spacing:var(--text-label-m-tracking)]",
);

// "Hide <Language>" toggle — Figma feedback-info-subtle pill (not a Button
// variant), text in feedback-info (AA: info → sky/700). H4 ramp, 44px target.
const hideToggleClasses = cn(
  "inline-flex min-h-[44px] items-center justify-center gap-[var(--space-sm)]",
  "rounded-[var(--radius-pill)] bg-[var(--feedback-info-subtle)] text-[color:var(--feedback-info)]",
  "px-[var(--space-lg)] py-[var(--space-md)] transition-colors",
  "[font-family:var(--text-heading-h4-family)] [font-size:var(--text-heading-h4-size)]",
  "[font-weight:var(--text-heading-h4-weight)] [line-height:var(--text-heading-h4-line-height)]",
  "outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

/**
 * Split a sentence into nodes, underlining every occurrence of the target word
 * (and its inflections) in the accent. Reuses the Reader's lemma matching so
 * "paths"/"running" highlight against the base "path"/"run". Punctuation stays
 * OUTSIDE the styled span so only the word is underlined.
 */
function renderHighlighted(text: string, baseLemma: string): ReactNode {
  if (!baseLemma) return text;
  const parts = text.split(/(\s+)/);
  return parts.map((part, i) => {
    if (part === "" || /^\s+$/.test(part)) return part;
    const m = /^([^\p{L}\p{N}]*)([\s\S]*?)([^\p{L}\p{N}]*)$/u.exec(part);
    if (!m) return part;
    const [, lead, core, trail] = m;
    if (core && candidateLemmas(normalizeLemma(core)).includes(baseLemma)) {
      return (
        <Fragment key={i}>
          {lead}
          <span data-testid="practice-highlight" className={highlightClasses}>
            {core}
          </span>
          {trail}
        </Fragment>
      );
    }
    return part;
  });
}

/**
 * PracticeOverlay — the Reader's "practise this word" dialog (Figma desktop
 * 879:1263, mobile 992:1657). Opened from the WordPopover's Practice button for
 * the selected word, in the active translation language.
 *
 * Built on Radix `Dialog` (focus trap, focus return, Esc, scroll-lock,
 * `role="dialog" aria-modal`) with a custom internal layout the Modal shell
 * can't express: a FIXED header + controls band over a SCROLLING sentence list.
 * Reads server state through `usePractice` (loading / empty / error are part of
 * the slice); "New sentences" bumps a nonce for a freshly-shuffled set; "Save to
 * practice later" writes through `useSavePractice` (optimistic) so the Saved
 * screen flips to "Review". Audio is the injectable Web Speech seam — the word
 * and each sentence voice in the Reader's accent, a graceful no-op when
 * unsupported. Reads only semantic tokens, so it is theme-agnostic.
 */
export function PracticeOverlay({
  open,
  onOpenChange,
  word,
  translation,
  phonetic,
  language,
  voice,
  sourceStoryId,
  sourceStoryTitle,
  audioController,
  audioSupported,
}: PracticeOverlayProps) {
  const [nonce, setNonce] = useState(0);
  const [translationsVisible, setTranslationsVisible] = useState(true);

  // A fresh word starts at the original (unshuffled) ordering. Reset during
  // render (React's "adjust state when a prop changes" pattern) rather than in an
  // effect, so there's no extra commit + the first fetch already uses nonce 0.
  const [prevWord, setPrevWord] = useState(word);
  if (prevWord !== word) {
    setPrevWord(word);
    setNonce(0);
  }

  const practice = usePractice(word, nonce, open);
  const save = useSavePractice();

  const found = practice.data?.found ?? false;
  const sentences = practice.data?.sentences ?? [];
  const baseLemma = practice.data?.word ?? normalizeLemma(word);
  const languageName = LANGUAGE_LABELS[language];

  // The CTA is "confirmed" once THIS word has been saved this session.
  const confirmed =
    save.isSuccess &&
    (save.variables?.word ?? "").toLowerCase() === word.toLowerCase();

  // ---- Audio (injectable Web Speech seam) --------------------------------
  const controller = useMemo(
    () => audioController ?? createWebSpeechController(),
    [audioController],
  );
  const detected = useSyncExternalStore(
    subscribeSupport,
    getSupportSnapshot,
    getSupportServerSnapshot,
  );
  const supported = audioSupported ?? detected;

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    if (!supported) return;
    const want = (voice ?? DEFAULT_VOICE).toLowerCase();
    const pick = () => {
      const voices = controller.getVoices();
      voiceRef.current =
        voices.find((v) => v.lang?.toLowerCase() === want) ??
        voices.find((v) => v.lang?.toLowerCase().startsWith(want)) ??
        voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ??
        null;
    };
    pick();
    return controller.onVoicesChanged(pick);
  }, [supported, controller, voice]);

  const speakText = useCallback(
    (text: string) => {
      if (!supported) return;
      const t = text.trim();
      if (!t) return;
      controller.cancel();
      controller.speak(t, { voice: voiceRef.current });
    },
    [supported, controller],
  );

  // Stop any spoken audio when the overlay closes (no audio bleed past dismiss).
  useEffect(() => {
    if (!open) controller.cancel();
  }, [open, controller]);

  function handleSave() {
    if (confirmed || save.isPending || sentences.length === 0) return;
    save.mutate({
      word,
      translation: translation ?? "",
      phonetic,
      sourceStoryId,
      sourceStoryTitle,
      sentencesReady: sentences.length,
    });
  }

  // Polite async announcement (separate sr-only node, so it never double-reads
  // the visible content). Covers the loading → loaded / empty / error → retry
  // transitions, incl. "New sentences" refetch.
  const liveMessage = practice.isError
    ? "Couldn't load practice sentences."
    : practice.isPending || practice.isFetching
      ? "Loading practice sentences."
      : found
        ? `${sentences.length} practice sentences ready for ${word}.`
        : "No practice sentences for this word yet.";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={overlayClasses} />
        <Dialog.Content
          className={contentClasses}
          // Radix points aria-describedby at the Description id unconditionally.
          // With a translation we render a Dialog.Description (it wires up);
          // without one we drop the attribute so it doesn't dangle.
          {...(translation != null && translation !== ""
            ? {}
            : { "aria-describedby": undefined })}
        >
          <p className="sr-only" aria-live="polite" role="status">
            {liveMessage}
          </p>

          {/* Header (fixed) — eyebrow, word + pronounce + translation, close */}
          <div className="flex shrink-0 items-start justify-between gap-[var(--space-lg)] px-[var(--space-2xl)] pb-[var(--space-xl)] pt-[var(--space-2xl)]">
            <div className="flex min-w-0 flex-col gap-[var(--space-sm)]">
              <p className={eyebrowClasses}>
                {found
                  ? `Practice · ${sentences.length} sentences`
                  : "Practice"}
              </p>
              <div className="flex flex-wrap items-center gap-[var(--space-md)]">
                <Dialog.Title asChild>
                  <h2 className={wordClasses}>{word}</h2>
                </Dialog.Title>
                <IconButton
                  variant="accentSubtle"
                  size="card"
                  icon={<SpeakerIcon />}
                  aria-label={`Pronounce ${word}`}
                  disabled={!supported}
                  onClick={() => speakText(word)}
                />
                {translation != null && translation !== "" && (
                  <Dialog.Description asChild>
                    <span className={headerTranslationClasses}>
                      {translation}
                    </span>
                  </Dialog.Description>
                )}
              </div>
            </div>
            <Dialog.Close asChild>
              <IconButton
                variant="subtle"
                size="md"
                icon={<XIcon />}
                aria-label="Close practice"
                className="shrink-0"
              />
            </Dialog.Close>
          </div>

          <div
            role="presentation"
            className="h-px w-full shrink-0 bg-[var(--border-default)]"
          />

          {/* Controls (fixed) — only meaningful once sentences exist. On mobile
              the utility actions collapse to header-style icon-buttons and the
              body keeps a single full-width CTA (mobile toolbar pattern). */}
          {found && (
            <div className="flex shrink-0 flex-col gap-[var(--space-md)] px-[var(--space-2xl)] py-[20px] md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-[var(--space-md)]">
                <button
                  type="button"
                  aria-pressed={!translationsVisible}
                  onClick={() => setTranslationsVisible((v) => !v)}
                  className={cn(hideToggleClasses, "max-md:flex-1")}
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex size-[16px] items-center justify-center [&>svg]:size-full"
                  >
                    <GlobeIcon />
                  </span>
                  {translationsVisible
                    ? `Hide ${languageName}`
                    : `Show ${languageName}`}
                </button>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<RefreshIcon />}
                  onClick={() => setNonce((n) => n + 1)}
                  className="max-md:flex-1"
                >
                  New sentences
                </Button>
              </div>
              <Button
                variant="primary"
                size="md"
                leftIcon={confirmed ? <CheckIcon /> : <BookmarkIcon />}
                loading={save.isPending}
                aria-pressed={confirmed}
                onClick={handleSave}
                className="max-md:w-full"
              >
                {confirmed ? "Saved to practice" : "Save to practice later"}
              </Button>
            </div>
          )}

          {/* Body (scrolls) — the sentence list / loading / empty / error */}
          <div className="min-h-0 flex-1 overflow-y-auto px-[var(--space-2xl)] pb-[var(--space-2xl)] pt-[var(--space-md)]">
            {practice.isError ? (
              <PracticeError onRetry={() => void practice.refetch()} />
            ) : practice.isPending ? (
              <PracticeSkeleton />
            ) : found ? (
              <ol
                aria-label={`Practice sentences for ${word}`}
                className="flex flex-col gap-[var(--space-lg)]"
              >
                {sentences.map((sentence, i) => (
                  <SentenceCard
                    key={`${nonce}-${i}`}
                    index={i + 1}
                    english={sentence.en}
                    translation={translationFor(sentence, language)}
                    showTranslation={translationsVisible}
                    baseLemma={baseLemma}
                    canSpeak={supported}
                    onSpeak={() => speakText(sentence.en)}
                  />
                ))}
              </ol>
            ) : (
              <PracticeEmpty />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface SentenceCardProps {
  index: number;
  english: string;
  translation: string;
  showTranslation: boolean;
  baseLemma: string;
  canSpeak: boolean;
  onSpeak: () => void;
}

/** One practice sentence card (Figma 883:1443) — number · sentence (+ its
 *  translation) · per-sentence speaker. The visible number is decorative (the
 *  `ol` conveys order to AT), so it is aria-hidden. */
function SentenceCard({
  index,
  english,
  translation,
  showTranslation,
  baseLemma,
  canSpeak,
  onSpeak,
}: SentenceCardProps) {
  return (
    <li
      // Off-scale Figma-measured card inset (20/18) — no matching space token;
      // radius binds to --radius-card (20px, 2px from Figma's 18, sub-perceptual).
      className="flex items-center gap-[var(--space-lg)] rounded-[var(--radius-card)] bg-[var(--bg-subtle)] px-[20px] py-[18px]"
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-[34px] min-w-[22px] shrink-0 items-center justify-center px-[var(--space-sm)]",
          "rounded-[var(--radius-pill)] bg-[var(--bg-accent-subtle)] text-[color:var(--text-accent)]",
          labelMClasses,
        )}
      >
        {index}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-xs)]">
        <p className={sentenceClasses}>{renderHighlighted(english, baseLemma)}</p>
        {showTranslation && (
          <p className={cn(labelMClasses, "text-[color:var(--text-muted)]")}>
            {translation}
          </p>
        )}
      </div>
      <IconButton
        variant="ghost"
        size="md"
        icon={<SpeakerIcon />}
        aria-label={`Listen to sentence ${index}`}
        disabled={!canSpeak}
        onClick={onSpeak}
        // Figma per-sentence speaker is an elevated white chip; ghost variant +
        // token-bound elevated bg, accent glyph, soft warm lift (--shadow-card).
        className="shrink-0 bg-[var(--bg-elevated)] text-[color:var(--text-accent)] shadow-[var(--shadow-card)] hover:bg-[var(--bg-accent-subtle)]"
      />
    </li>
  );
}

/** Loading — skeleton cards that match the list layout. */
function PracticeSkeleton() {
  return (
    <div
      aria-hidden="true"
      data-testid="practice-skeleton"
      className="flex flex-col gap-[var(--space-lg)]"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-[var(--space-lg)] rounded-[var(--radius-card)] bg-[var(--bg-subtle)] px-[20px] py-[18px]"
        >
          <div className="size-[34px] shrink-0 rounded-[var(--radius-pill)] bg-[var(--bg-accent-subtle)] motion-safe:animate-pulse" />
          <div className="flex flex-1 flex-col gap-[var(--space-sm)]">
            <div className="h-[20px] w-full rounded-[var(--radius-sm)] bg-[var(--bg-accent-subtle)] motion-safe:animate-pulse" />
            <div className="h-[14px] w-2/3 rounded-[var(--radius-sm)] bg-[var(--bg-accent-subtle)] motion-safe:animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty — a friendly state when the word has no precomputed sample (ReadEasily
 * designed empties; this is part of the slice, not optional polish).
 *
 * TODO(practice-generation): when a real "generate sentences for ANY word"
 * backend lands, the miss that produces this state instead triggers generation
 * (see resolvePracticeSet's TODO) — the seam (`GET /api/practice/:word`) and this
 * overlay are unchanged; this empty becomes the brief pre-generation state.
 */
function PracticeEmpty() {
  return (
    <div className="flex flex-col items-center gap-[var(--space-sm)] py-[var(--space-3xl)] text-center">
      <span
        aria-hidden="true"
        className="inline-flex size-[28px] items-center justify-center text-[color:var(--text-accent)] [&>svg]:size-full"
      >
        <SpeakerIcon />
      </span>
      <p className="text-[color:var(--text-primary)] [font-family:var(--text-heading-h4-family)] [font-size:var(--text-heading-h4-size)] [font-weight:var(--text-heading-h4-weight)] [line-height:var(--text-heading-h4-line-height)]">
        Practice sentences for this word are coming soon.
      </p>
      <p className="max-w-[36ch] text-[color:var(--text-muted)] [font-family:var(--text-ui-m-family)] [font-size:var(--text-ui-m-size)] [line-height:var(--text-ui-m-line-height)]">
        We&rsquo;re still preparing example sentences for this one. Save it and
        check back soon.
      </p>
    </div>
  );
}

/** Inline error — announced as an alert, with a retry that refetches. */
function PracticeError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-[var(--space-md)] py-[var(--space-2xl)] text-center"
    >
      <p className="text-[color:var(--feedback-danger)] [font-family:var(--text-ui-m-family)] [font-size:var(--text-ui-m-size)] [line-height:var(--text-ui-m-line-height)]">
        We couldn&rsquo;t load these practice sentences.
      </p>
      <Button
        variant="secondary"
        size="md"
        leftIcon={<RefreshIcon />}
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}
