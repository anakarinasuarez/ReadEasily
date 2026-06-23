/**
 * ReaderSpeech — the injectable text-to-speech seam for the Reader.
 *
 * The Reader never touches `window.speechSynthesis` directly. It talks to this
 * thin interface, and the real implementation (`createWebSpeechController`) is
 * the only place the Web Speech API is referenced. Why the indirection:
 *
 *  1. **Testability.** jsdom has no `speechSynthesis`. The hook accepts a
 *     `ReaderSpeech`, so tests inject a fake that records `speak` calls and lets
 *     them fire `onStart` / `onEnd` synchronously — no real audio, no flakiness.
 *  2. **Feature-detection.** `isSpeechSupported()` is the one gate; where it's
 *     false the PlayerBar stays in its `disabled` state and nothing here runs.
 *  3. **Quirk isolation.** Cross-browser Web Speech warts (Chrome's silent
 *     pause-after-15s GC bug, voice list arriving async via `voiceschanged`,
 *     unreliable word `onboundary`) are contained here, behind a clean surface.
 *
 * This module is pure (no React) and SSR-safe: `createWebSpeechController()` can
 * be called during a server render — every method guards `typeof window` and
 * only touches the API lazily when actually invoked on the client.
 */

/** Per-utterance options. Callbacks fire as the platform reports progress. */
export interface SpeakOptions {
  /** Playback rate multiplier (Web Speech `rate`). Clamped to [0.1, 10]. */
  rate?: number;
  /** Voice to use; `null`/omitted → the platform default voice. */
  voice?: SpeechSynthesisVoice | null;
  /** Fired when the utterance actually begins speaking. */
  onStart?: () => void;
  /** Fired on a word/sentence boundary (charIndex into the text). Unreliable
   *  cross-browser — the Reader does NOT depend on it, but it's exposed. */
  onBoundary?: (charIndex: number) => void;
  /** Fired when the utterance finishes normally. */
  onEnd?: () => void;
  /** Fired when the utterance errors (or is interrupted by `cancel`). */
  onError?: () => void;
}

/** The TTS surface the Reader depends on. */
export interface ReaderSpeech {
  /** Queue/speak one utterance of `text` with the given options. */
  speak(text: string, options?: SpeakOptions): void;
  /** Stop immediately and drop anything queued. */
  cancel(): void;
  /** Pause the current utterance (platform-dependent; see quirks). */
  pause(): void;
  /** Resume after `pause`. */
  resume(): void;
  /** The currently-available voices (may be empty until `voiceschanged`). */
  getVoices(): SpeechSynthesisVoice[];
  /** Subscribe to voice-list changes; returns an unsubscribe fn. */
  onVoicesChanged(callback: () => void): () => void;
}

/** True when the Web Speech synthesis API is usable in this environment. */
export function isSpeechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

/** Clamp a rate into the Web Speech valid range; default 1 for bad input. */
function clampRate(rate: number | undefined): number {
  if (rate == null || Number.isNaN(rate)) return 1;
  return Math.min(10, Math.max(0.1, rate));
}

/**
 * The real controller over `window.speechSynthesis`. Safe to construct on the
 * server (it touches nothing until a method runs on the client).
 */
export function createWebSpeechController(): ReaderSpeech {
  const synth = (): SpeechSynthesis | null =>
    typeof window !== "undefined" && "speechSynthesis" in window
      ? window.speechSynthesis
      : null;

  return {
    speak(text, options = {}) {
      const s = synth();
      if (!s) return;
      // Speaking while something is already speaking can wedge some engines;
      // the Reader always drives one utterance at a time, but cancel defensively
      // so a stray queued utterance can never overlap the new one.
      s.cancel();
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.rate = clampRate(options.rate);
      utter.lang = options.voice?.lang ?? "en-US";
      if (options.voice) utter.voice = options.voice;
      if (options.onStart) utter.onstart = () => options.onStart?.();
      if (options.onEnd) utter.onend = () => options.onEnd?.();
      if (options.onBoundary) {
        utter.onboundary = (e) => options.onBoundary?.(e.charIndex);
      }
      // `cancel()` also fires `onerror` (interrupted); the hook guards stale
      // callbacks by generation, so an interrupt error is harmless.
      utter.onerror = () => options.onError?.();
      s.speak(utter);
    },
    cancel() {
      synth()?.cancel();
    },
    pause() {
      synth()?.pause();
    },
    resume() {
      synth()?.resume();
    },
    getVoices() {
      return synth()?.getVoices() ?? [];
    },
    onVoicesChanged(callback) {
      const s = synth();
      if (!s) return () => {};
      s.addEventListener("voiceschanged", callback);
      return () => s.removeEventListener("voiceschanged", callback);
    },
  };
}
