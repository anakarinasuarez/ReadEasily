"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { PlayerBarStatus } from "@/components/player-bar";
import {
  createWebSpeechController,
  isSpeechSupported,
  type ReaderSpeech,
} from "../audio/speechController";
import type { ReaderSentence } from "../audio/sentences";
import { DEFAULT_VOICE, type VoiceAccent } from "../types";

/**
 * useReaderAudio — the Reader's text-to-speech engine, as a hook.
 *
 * It drives a SENTENCE QUEUE over an injectable `ReaderSpeech` controller: it
 * speaks one utterance per sentence, in order, advancing on each `onEnd`. This
 * per-sentence model is deliberate — Web Speech word `onboundary` events are
 * unreliable cross-browser, but per-utterance start/end is solid, giving us a
 * dependable transport (play / pause / next / prev / restart / skip-to-end) and
 * a dependable highlight (the active sentence's words).
 *
 * Reliability details:
 *  • **Generation guard.** Every `speak` captures a generation number; any
 *    `cancel`/jump bumps it, so a stale `onEnd` from a cancelled utterance can
 *    never advance the queue (the root cause of "audio keeps going" bugs).
 *  • **Manual index + cancel** (not native `pause`) is the transport primitive —
 *    Chrome's `pause()` is flaky and can silently stall, so we cancel and
 *    remember the index, resuming by re-speaking from there.
 *  • **Feature-detect, render-safe.** Support is read via `useSyncExternalStore`
 *    with a `false` server snapshot, so SSR and the first client render agree
 *    (no hydration mismatch) before resolving to the real value. Where
 *    unsupported, `status` is `"disabled"` and every transport is a no-op.
 *
 * State split: `currentSentence` is the TRANSPORT position (drives progress +
 * the tick dot, updated synchronously by every jump). The HIGHLIGHT is a
 * separate value set on `onStart` and cleared on pause/stop/end, so the karaoke
 * highlight only shows while audio is actually voicing.
 */
export interface UseReaderAudioParams {
  /** The current page's sentences (see `buildSentences`). */
  sentences: ReaderSentence[];
  /** The TTS controller. Defaults to the real Web Speech one; tests inject a fake. */
  controller?: ReaderSpeech;
  /** Force the support flag (tests pass `true`); default = feature-detect. */
  supported?: boolean;
  /** Changes when the page turns — resets + stops playback (no audio bleed). */
  resetKey?: string | number;
  /**
   * Which English accent the spoken voice should match (`en-US` | `en-GB`,
   * default `en-US`). The hook picks a voice whose lang matches; if none is
   * installed it falls back to any English voice, then the platform default —
   * switching never breaks playback.
   */
  voiceAccent?: VoiceAccent;
}

export interface UseReaderAudio {
  /** Whether audio is usable at all (drives the PlayerBar status). */
  supported: boolean;
  /** PlayerBar readiness: `"ready"` when supported, else `"disabled"`. */
  status: PlayerBarStatus;
  /** Whether a sentence is currently being voiced. */
  playing: boolean;
  /** Transport position — index of the current sentence. */
  currentSentence: number;
  /** Total sentences on the page. */
  totalSentences: number;
  /** Inclusive word-index range of the sentence being voiced, or null. */
  currentWordRange: { start: number; end: number } | null;
  /** Playback position as a fraction 0..1 (currentSentence / total). */
  progress: number;
  /** Approximate elapsed time label, e.g. "0:12" (see note on estimation). */
  elapsedLabel: string;
  /** Approximate total time label, e.g. "0:48". */
  totalLabel: string;
  /** Current speed multiplier (applies to subsequent utterances). */
  speed: number;
  /** Start (or resume) the queue from the current sentence. */
  play(): void;
  /** Stop voicing; remember the position; clear the highlight. */
  pause(): void;
  /** Play ↔ pause. */
  toggle(): void;
  /** Jump to the next sentence. */
  next(): void;
  /** Jump to the previous sentence. */
  prev(): void;
  /** Jump to the first sentence and play. */
  restart(): void;
  /** Stop and move to the last sentence. */
  skipEnd(): void;
  /** Seek to a fraction 0..1 → nearest sentence. */
  seek(fraction: number): void;
  /** Set the speed multiplier (next utterances use it). */
  setSpeed(value: number): void;
  /** Cycle 0.75 → 1 → 1.25 → 1.5 → 0.75. */
  cycleSpeed(): void;
  /** Speak a single word once (pauses story playback first; stays paused). */
  pronounceWord(word: string): void;
}

/** Speed cycle for the PlayerBar pill. */
const SPEED_CYCLE = [0.75, 1, 1.25, 1.5] as const;

/** Rough chars/second of spoken English at 1× — used only for the approximate
 *  time labels (Web Speech reports no duration). Documented as an estimate. */
const BASE_CHARS_PER_SECOND = 15;

/** Format seconds as m:ss. */
function formatTime(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Feature-detection as an external store: no subscription (it can't change
 *  during a session), `false` on the server so hydration matches. */
const subscribeSupport = () => () => {};
const getSupportSnapshot = () => isSpeechSupported();
const getSupportServerSnapshot = () => false;

export function useReaderAudio({
  sentences,
  controller: providedController,
  supported: supportedOverride,
  resetKey,
  voiceAccent = DEFAULT_VOICE,
}: UseReaderAudioParams): UseReaderAudio {
  // One controller for the hook's lifetime (the real one is SSR-safe to build).
  const controller = useMemo(
    () => providedController ?? createWebSpeechController(),
    [providedController],
  );

  const detected = useSyncExternalStore(
    subscribeSupport,
    getSupportSnapshot,
    getSupportServerSnapshot,
  );
  const supported = supportedOverride ?? detected;

  const [index, setIndex] = useState(0);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [speed, setSpeedState] = useState(1);

  // Refs (mutated only in callbacks/effects, never during render) back the async
  // TTS callbacks, which would otherwise close over stale state.
  const indexRef = useRef(0);
  const speedRef = useRef(1);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const genRef = useRef(0);
  // Indirection so the recursive queue (onEnd → next sentence) calls the latest
  // `speakFrom` without referencing it before declaration.
  const speakFromRef = useRef<(i: number) => void>(() => {});

  const total = sentences.length;

  // Pick a voice matching the chosen accent once voices are available (they
  // arrive async via `voiceschanged` on first use). Graceful fallback chain:
  // exact lang (en-US / en-GB) → same-prefix → any English → platform default
  // (null). Re-runs when the accent changes, so the header voice pill switches
  // the voice used for subsequent utterances; if the browser has no en-GB voice,
  // UK simply falls back to an available English voice rather than breaking.
  useEffect(() => {
    if (!supported) return;
    const want = voiceAccent.toLowerCase();
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
  }, [supported, controller, voiceAccent]);

  // Invalidate any in-flight utterance and stop the synth.
  const hardStop = useCallback(() => {
    genRef.current += 1;
    controller.cancel();
  }, [controller]);

  // Speak the sentence at `i`, wiring start (highlight) + end (advance).
  const speakFrom = useCallback(
    (i: number) => {
      const sentence = sentences[i];
      if (!sentence) {
        setPlaying(false);
        setHighlight(null);
        setFinished(true);
        return;
      }
      const gen = (genRef.current += 1);
      indexRef.current = i;
      setIndex(i);
      setFinished(false);
      controller.speak(sentence.text, {
        rate: speedRef.current,
        voice: voiceRef.current,
        onStart: () => {
          if (gen !== genRef.current) return;
          setPlaying(true);
          setHighlight(i);
        },
        onEnd: () => {
          if (gen !== genRef.current) return;
          const nextIndex = i + 1;
          if (nextIndex < sentences.length) {
            speakFromRef.current(nextIndex);
          } else {
            setPlaying(false);
            setHighlight(null);
            setFinished(true);
          }
        },
      });
    },
    [controller, sentences],
  );

  useEffect(() => {
    speakFromRef.current = speakFrom;
  }, [speakFrom]);

  const play = useCallback(() => {
    if (!supported || total === 0) return;
    const start = finished ? 0 : indexRef.current;
    setPlaying(true);
    speakFrom(start);
  }, [supported, total, finished, speakFrom]);

  const pause = useCallback(() => {
    hardStop();
    setPlaying(false);
    setHighlight(null);
  }, [hardStop]);

  const toggle = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, pause, play]);

  // Jump the transport to `target`. While playing → cancel + speak the new
  // sentence; while paused → just move the position (and clear any highlight).
  const jumpTo = useCallback(
    (target: number) => {
      if (!supported || total === 0) return;
      const clamped = Math.min(Math.max(target, 0), total - 1);
      hardStop();
      indexRef.current = clamped;
      setIndex(clamped);
      setFinished(false);
      if (playing) {
        speakFrom(clamped);
      } else {
        setHighlight(null);
      }
    },
    [supported, total, playing, hardStop, speakFrom],
  );

  const next = useCallback(() => jumpTo(indexRef.current + 1), [jumpTo]);
  const prev = useCallback(() => jumpTo(indexRef.current - 1), [jumpTo]);

  const restart = useCallback(() => {
    if (!supported || total === 0) return;
    hardStop();
    indexRef.current = 0;
    setIndex(0);
    setFinished(false);
    setPlaying(true);
    speakFrom(0);
  }, [supported, total, hardStop, speakFrom]);

  const skipEnd = useCallback(() => {
    if (!supported || total === 0) return;
    hardStop();
    const lastIndex = total - 1;
    indexRef.current = lastIndex;
    setIndex(lastIndex);
    setPlaying(false);
    setHighlight(null);
    setFinished(true);
  }, [supported, total, hardStop]);

  const seek = useCallback(
    (fraction: number) => {
      if (!supported || total === 0) return;
      const f = Math.min(1, Math.max(0, fraction));
      // progress = index/total, so invert with floor and clamp to the last index.
      jumpTo(Math.min(Math.floor(f * total), total - 1));
    },
    [supported, total, jumpTo],
  );

  const setSpeed = useCallback((value: number) => {
    speedRef.current = value;
    setSpeedState(value);
  }, []);

  const cycleSpeed = useCallback(() => {
    const i = SPEED_CYCLE.indexOf(speedRef.current as (typeof SPEED_CYCLE)[number]);
    setSpeed(SPEED_CYCLE[(i + 1) % SPEED_CYCLE.length]);
  }, [setSpeed]);

  const pronounceWord = useCallback(
    (word: string) => {
      if (!supported) return;
      // Stop story playback (user-initiated); it stays paused afterwards.
      hardStop();
      setPlaying(false);
      setHighlight(null);
      const w = word.trim();
      if (!w) return;
      controller.speak(w, { rate: speedRef.current, voice: voiceRef.current });
    },
    [supported, controller, hardStop],
  );

  // Page turn (resetKey change) → stop + reset transport. Cleanup cancels on
  // unmount so audio never bleeds past the route. setState goes through a helper
  // (not a bare setter in the effect body) — the side effect here is cancelling
  // the synth; the state reset just mirrors that stop into React.
  useEffect(() => {
    const resetTransport = () => {
      setIndex(0);
      setHighlight(null);
      setPlaying(false);
      setFinished(false);
    };
    genRef.current += 1;
    controller.cancel();
    indexRef.current = 0;
    resetTransport();
    return () => {
      genRef.current += 1;
      controller.cancel();
    };
  }, [resetKey, controller]);

  // ---- Derived view state -------------------------------------------------
  const currentWordRange = useMemo(() => {
    if (highlight == null) return null;
    const s = sentences[highlight];
    if (!s) return null;
    return { start: s.firstWordIndex, end: s.lastWordIndex };
  }, [highlight, sentences]);

  const progress = total > 0 ? (finished ? 1 : index / total) : 0;

  // Approximate time labels. Web Speech reports no duration, so we estimate from
  // characters spoken at a nominal rate scaled by speed. Proportional + coherent,
  // not exact — documented as an approximation.
  const { elapsedLabel, totalLabel } = useMemo(() => {
    const cps = BASE_CHARS_PER_SECOND * (speed || 1);
    const lens = sentences.map((s) => s.text.length);
    const totalChars = lens.reduce((a, b) => a + b, 0);
    const elapsedChars = finished
      ? totalChars
      : lens.slice(0, index).reduce((a, b) => a + b, 0);
    return {
      elapsedLabel: formatTime(elapsedChars / cps),
      totalLabel: formatTime(totalChars / cps),
    };
  }, [sentences, index, finished, speed]);

  return {
    supported,
    status: supported ? "ready" : "disabled",
    playing,
    currentSentence: index,
    totalSentences: total,
    currentWordRange,
    progress,
    elapsedLabel,
    totalLabel,
    speed,
    play,
    pause,
    toggle,
    next,
    prev,
    restart,
    skipEnd,
    seek,
    setSpeed,
    cycleSpeed,
    pronounceWord,
  };
}
