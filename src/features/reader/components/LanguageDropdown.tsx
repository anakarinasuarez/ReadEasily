"use client";

import {
  LANGUAGES,
  LANGUAGE_LABELS,
  type Language,
} from "../types";
import { GlobeIcon } from "./icons";
import { ReaderSelectMenu, type ReaderSelectOption } from "./ReaderSelectMenu";

/**
 * LanguageDropdown — the translation-language menu (Figma node 1154:3342),
 * opening from the header's ES/FR/PT pill. The pill text reflects the active
 * language's 2-letter code; the menu lists Español / Français / Português and
 * marks the active one (info tint + check). A thin wrapper over the shared
 * `ReaderSelectMenu` so it stays 1:1 with the voice dropdown.
 */
export interface LanguageDropdownProps {
  /** The active translation language (drives the pill label + the check). */
  value: Language;
  /** Commit a new language. */
  onChange: (language: Language) => void;
}

const OPTIONS: ReaderSelectOption<Language>[] = LANGUAGES.map((lang) => ({
  value: lang,
  code: lang.toUpperCase(),
  name: LANGUAGE_LABELS[lang],
}));

export function LanguageDropdown({ value, onChange }: LanguageDropdownProps) {
  return (
    <ReaderSelectMenu
      options={OPTIONS}
      value={value}
      onChange={onChange}
      label="Translation language"
      leadingIcon={<GlobeIcon />}
      pillText={value.toUpperCase()}
      align="right"
    />
  );
}
