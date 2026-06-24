"use client";

import type { Language, VoiceAccent } from "../types";
import { LanguageDropdown } from "./LanguageDropdown";
import { VoiceDropdown } from "./VoiceDropdown";

/**
 * ReaderToggles — the header's compact pills (Figma node 1159:3382), each now a
 * real dropdown menu:
 *  • The translation-language pill (ES/FR/PT) opens the LanguageDropdown (Figma
 *    1154:3342) — switching the language refetches the page's translation +
 *    glossary in place.
 *  • The voice/accent pill (US/UK) opens the VoiceDropdown — switching the
 *    spoken accent used by the TTS engine.
 *
 * Both render at both breakpoints. The dropdowns own their own a11y (menu,
 * roving focus, Esc, click-outside); this just lays them out and threads state.
 */
export interface ReaderTogglesProps {
  /** The active translation language. */
  language: Language;
  /** Commit a new translation language. */
  onLanguageChange: (language: Language) => void;
  /** The active audio voice accent. */
  voice: VoiceAccent;
  /** Commit a new audio voice accent. */
  onVoiceChange: (voice: VoiceAccent) => void;
}

export function ReaderToggles({
  language,
  onLanguageChange,
  voice,
  onVoiceChange,
}: ReaderTogglesProps) {
  return (
    <div className="flex items-center gap-[10px]">
      <LanguageDropdown value={language} onChange={onLanguageChange} />
      <VoiceDropdown value={voice} onChange={onVoiceChange} />
    </div>
  );
}
