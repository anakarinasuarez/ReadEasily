/**
 * speakWord — the shared "pronounce a single word" seam.
 *
 * Both the Reader (via `useReaderAudio.pronounceWord`) and the Saved screen need
 * to voice one word aloud through the SAME Web Speech path. The Reader's queue
 * machinery (`useReaderAudio`) is sentence-oriented and reader-internal, so this
 * tiny pure helper extracts just the one-shot pronounce behaviour over the same
 * injectable `ReaderSpeech` controller:
 *
 *  • **One utterance.** Speaks `word` once, in the requested accent's voice.
 *  • **Accent → voice + lang.** Picks a voice matching the BCP-47 accent (exact
 *    lang → same accent prefix), and always passes the requested accent as
 *    `lang`. A missing en-AU/en-CA (or, on Android, en-US) voice never breaks it
 *    or flips the accent: it speaks via the platform default voice but keeps the
 *    requested `lang`, instead of being force-locked to a wrong-accent voice.
 *  • **Feature-detected.** Guards on `isSpeechSupported()`; a no-op in jsdom and
 *    any environment without `speechSynthesis` (the Saved card stays inert).
 *  • **Injectable.** The controller + support flag can be supplied (tests pass a
 *    fake recorder), otherwise the real Web Speech controller is created lazily.
 */
import {
  createWebSpeechController,
  isSpeechSupported,
  DEFAULT_VOICE,
  type ReaderSpeech,
  type VoiceAccent,
} from "./speechController";

/**
 * Pick a voice for the accent from the controller's voice list — matching ONLY
 * the requested accent: exact lang (`en-us`) → same accent prefix (`en-us-…`).
 * Returns `null` when no voice for that exact accent is installed.
 *
 * It deliberately does NOT fall back to "any English voice": assigning, say, an
 * en-GB voice object when the user asked for en-US would force the wrong accent
 * (on Android Chrome `utterance.voice` overrides `utterance.lang`). When no
 * accent-matching voice exists we return `null` and let the caller steer the
 * engine with `utterance.lang` instead — which keeps the requested accent and
 * still speaks via the platform default voice.
 */
export function pickVoiceForAccent(
  controller: ReaderSpeech,
  accent: VoiceAccent,
): SpeechSynthesisVoice | null {
  const want = accent.toLowerCase();
  const voices = controller.getVoices();
  return (
    voices.find((v) => v.lang?.toLowerCase() === want) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith(want)) ??
    null
  );
}

/** Options for {@link speakWord}. All optional — sensible defaults throughout. */
export interface SpeakWordOptions {
  /** Which English accent to voice the word in. Defaults to US English. */
  voiceAccent?: VoiceAccent;
  /** TTS controller. Defaults to the real Web Speech one; tests inject a fake. */
  controller?: ReaderSpeech;
  /** Force the support flag (tests pass `true`); default = feature-detect. */
  supported?: boolean;
}

/**
 * Speak `word` once via Web Speech, in the given accent. Trims the input and
 * no-ops on an empty word or when speech is unsupported. Cancels any in-flight
 * utterance first (the controller does this), so rapid taps never overlap.
 */
export function speakWord(word: string, options: SpeakWordOptions = {}): void {
  const supported = options.supported ?? isSpeechSupported();
  if (!supported) return;
  const trimmed = word.trim();
  if (!trimmed) return;
  const controller = options.controller ?? createWebSpeechController();
  const accent = options.voiceAccent ?? DEFAULT_VOICE;
  controller.speak(trimmed, {
    // Always pass the requested accent as `lang` so the engine honors it even
    // when no exact-accent voice object is installed (Android Chrome).
    lang: accent,
    voice: pickVoiceForAccent(controller, accent),
  });
}
