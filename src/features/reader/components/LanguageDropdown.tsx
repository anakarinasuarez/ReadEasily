"use client";

import {
  LANGUAGES,
  LANGUAGE_LABELS,
  TRANSLATION_OFF_LABEL,
  type TranslationSelection,
} from "../types";
import { GlobeIcon } from "./icons";
import { ReaderSelectMenu, type ReaderSelectOption } from "./ReaderSelectMenu";

/**
 * LanguageDropdown — the translation-language menu (Figma node 1154:3342),
 * opening from the header's ES/FR/PT pill. The pill text reflects the active
 * language's 2-letter code; the menu lists Español / Français / Português and a
 * final "Off" row (translation suppressed), marking the active one (info tint +
 * check). A thin wrapper over the shared `ReaderSelectMenu` so it stays 1:1 with
 * the voice dropdown.
 */
export interface LanguageDropdownProps {
  /** The active translation selection (drives the pill label + the check). */
  value: TranslationSelection;
  /** Commit a new selection (a language, or `"off"`). */
  onChange: (value: TranslationSelection) => void;
}

const OPTIONS: ReaderSelectOption<TranslationSelection>[] = [
  ...LANGUAGES.map((lang) => ({
    value: lang,
    code: lang.toUpperCase(),
    name: LANGUAGE_LABELS[lang],
  })),
  // Translation off — last row, so the language choices stay grouped first.
  { value: "off", code: "OFF", name: TRANSLATION_OFF_LABEL },
];

export function LanguageDropdown({ value, onChange }: LanguageDropdownProps) {
  return (
    <ReaderSelectMenu
      options={OPTIONS}
      value={value}
      onChange={onChange}
      label="Translation language"
      leadingIcon={<GlobeIcon />}
      pillText={value === "off" ? "OFF" : value.toUpperCase()}
      align="right"
    />
  );
}
