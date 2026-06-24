"use client";

import {
  VOICE_ACCENTS,
  VOICE_LABELS,
  type VoiceAccent,
} from "../types";
import { UkFlagIcon, UsFlagIcon } from "./icons";
import { ReaderSelectMenu, type ReaderSelectOption } from "./ReaderSelectMenu";

/**
 * VoiceDropdown — the audio voice/accent menu, mirroring LanguageDropdown's
 * visual + a11y. Opens from the header's US/UK pill; two rows (US English / UK
 * English), each with its 2-letter code chip. Selecting a row switches the TTS
 * accent. A thin wrapper over the shared `ReaderSelectMenu`.
 */
export interface VoiceDropdownProps {
  /** The active voice accent (drives the pill label + the check). */
  value: VoiceAccent;
  /** Commit a new voice accent. */
  onChange: (voice: VoiceAccent) => void;
}

const OPTIONS: ReaderSelectOption<VoiceAccent>[] = VOICE_ACCENTS.map(
  (accent) => ({
    value: accent,
    code: VOICE_LABELS[accent].code,
    name: VOICE_LABELS[accent].name,
  }),
);

export function VoiceDropdown({ value, onChange }: VoiceDropdownProps) {
  return (
    <ReaderSelectMenu
      options={OPTIONS}
      value={value}
      onChange={onChange}
      label="Audio voice"
      leadingIcon={value === "en-GB" ? <UkFlagIcon /> : <UsFlagIcon />}
      pillText={VOICE_LABELS[value].code}
      align="right"
    />
  );
}
