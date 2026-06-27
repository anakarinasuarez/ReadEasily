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
 *  • **Accent → voice.** Picks a voice matching the BCP-47 accent with the same
 *    graceful fallback chain the Reader uses (exact lang → same prefix → any
 *    English → platform default), so a missing en-AU/en-CA voice never breaks it.
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
 * Pick a voice for the accent from the controller's voice list. Mirrors the
 * Reader's chain: exact lang (`en-us`) → same prefix → any English → null
 * (platform default). Returns `null` when no English voice is installed.
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
    voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ??
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
  controller.speak(trimmed, {
    voice: pickVoiceForAccent(controller, options.voiceAccent ?? DEFAULT_VOICE),
  });
}
