"use client";

import type { ReactNode } from "react";
import {
  VOICE_ACCENTS,
  VOICE_LABELS,
  type VoiceAccent,
} from "../types";
import {
  AuFlagIcon,
  CaFlagIcon,
  UkFlagIcon,
  UsFlagIcon,
} from "./icons";
import { ReaderSelectMenu, type ReaderSelectOption } from "./ReaderSelectMenu";

/**
 * VoiceDropdown — the audio voice/accent menu, mirroring LanguageDropdown's
 * visual + a11y. Opens from the header's accent pill; four rows (US / UK / AU /
 * CA English), each with its 2-letter code chip + a decorative flag. Selecting a
 * row switches the TTS accent (and, since the Reader is store-driven, persists it
 * to the global preferences store). A thin wrapper over the shared
 * `ReaderSelectMenu`.
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

/** The decorative flag glyph shown in the pill for the active accent. */
const FLAG_ICONS: Record<VoiceAccent, ReactNode> = {
  "en-US": <UsFlagIcon />,
  "en-GB": <UkFlagIcon />,
  "en-AU": <AuFlagIcon />,
  "en-CA": <CaFlagIcon />,
};

export function VoiceDropdown({ value, onChange }: VoiceDropdownProps) {
  return (
    <ReaderSelectMenu
      options={OPTIONS}
      value={value}
      onChange={onChange}
      label="Audio voice"
      leadingIcon={FLAG_ICONS[value]}
      pillText={VOICE_LABELS[value].code}
      align="right"
    />
  );
}
