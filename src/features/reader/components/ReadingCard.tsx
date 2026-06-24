"use client";

import type { StoryPage } from "../types";
import { ReadingParagraph } from "./ReadingParagraph";
import { ReadingProgress } from "./ReadingProgress";
import { GlobeIcon } from "./icons";

/**
 * ReadingCard — the elevated reading surface (Figma "Reading Card / Desktop"
 * node 1157:3132). Stacks, top to bottom:
 *   1. the page's English passage (ReadingParagraph — tappable words),
 *   2. a hairline divider,
 *   3. the translation block (globe + the active language's uppercased label +
 *      the italic translation), shown only when the story has a translation in
 *      the selected language,
 *   4. a hairline divider,
 *   5. ReadingProgress ("Page X of N" + page chevrons).
 *
 * Geometry follows Figma exactly: `--bg-elevated`, 28px radius, the reading-card
 * shadow, and responsive insets — mobile `px-[var(--space-xl)] pt-[var(--space-2xl)]`
 * (~24/32, Figma mobile 856:928) stepping up to the off-scale desktop
 * `md:px-[60px] md:pt-[50px]` (a 60px inset would cramp a ~358px mobile card).
 * The card content is keyed by page so a page change cross-fades (same-screen
 * morph; honored only under no-reduced-motion via the `.re-fade-in` utility).
 */
export interface ReadingCardProps {
  /** The page to render. */
  page: StoryPage;
  /** Total pages (for the progress label + chevron bounds). */
  pageCount: number;
  /** Whether the translation block is shown (sidecar present + reader hasn't
   *  switched to a language that has none). */
  translationVisible: boolean;
  /** The translation block's label, e.g. "Español" / "Français" (uppercased in
   *  the UI), reflecting the active language. */
  translationLabel: string;
  /** BCP-47 lang for the translation paragraphs' `lang` attribute (es/fr/pt). */
  translationLang: string;
  /** The open word's id, and the voiced word's id (highlight states). */
  selectedWordId?: string | null;
  speakingWordId?: string | null;
  /** Inclusive word-index range of the sentence currently being voiced (TTS). */
  speakingWordRange?: { start: number; end: number } | null;
  /** Word tapped → open the popover. */
  onActivateWord: (info: { id: string; surface: string }) => void;
  /** Page navigation. */
  onPrevPage: () => void;
  onNextPage: () => void;
}

const dividerClasses = "h-px w-full bg-[var(--border-default)]";

const translationLabelClasses =
  "uppercase whitespace-nowrap text-[color:var(--feedback-info)] " +
  "[font-family:var(--text-label-m-family)] [font-size:var(--text-label-m-size)] " +
  "[font-weight:var(--text-label-m-weight)] [line-height:var(--text-label-m-line-height)] " +
  "[letter-spacing:var(--text-label-m-tracking)]";

const translationTextClasses =
  "w-full text-left text-[color:var(--text-secondary)] italic " +
  "[font-family:var(--text-reading-l-family)] [font-size:var(--text-reading-l-size)] " +
  "[font-weight:var(--text-reading-l-weight)] [line-height:var(--text-reading-l-line-height)]";

export function ReadingCard({
  page,
  pageCount,
  translationVisible,
  translationLabel,
  translationLang,
  selectedWordId = null,
  speakingWordId = null,
  speakingWordRange = null,
  onActivateWord,
  onPrevPage,
  onNextPage,
}: ReadingCardProps) {
  const showTranslation =
    translationVisible && page.translationParagraphs.length > 0;

  return (
    <div className="flex w-full max-w-[745px] flex-col gap-[var(--space-xl)] rounded-[28px] bg-[var(--bg-elevated)] shadow-[var(--shadow-reading-card)] px-[var(--space-xl)] pt-[var(--space-2xl)] pb-[var(--space-xl)] md:px-[60px] md:pt-[50px]">
      {/* Reading body ONLY is keyed by page → cross-fade it on a page change
          (morph). The footer below is a stable sibling (see ReadingProgress). */}
      <div
        key={page.index}
        className="re-fade-in flex w-full flex-col gap-[var(--space-xl)]"
      >
        <ReadingParagraph
          paragraphs={page.paragraphs}
          pageIndex={page.index}
          selectedWordId={selectedWordId}
          speakingWordId={speakingWordId}
          speakingWordRange={speakingWordRange}
          onActivateWord={onActivateWord}
        />

        {showTranslation && (
          <>
            <div aria-hidden="true" className={dividerClasses} />
            <div className="flex w-full flex-col gap-[10px]">
              <div className="flex items-center gap-[var(--space-sm)]">
                <span
                  aria-hidden="true"
                  className="inline-flex size-[16px] items-center justify-center text-[color:var(--feedback-info)] [&>svg]:size-full"
                >
                  <GlobeIcon />
                </span>
                <span className={translationLabelClasses}>{translationLabel}</span>
              </div>
              {page.translationParagraphs.map((paragraph, i) => (
                <p key={i} className={translationTextClasses} lang={translationLang}>
                  {paragraph}
                </p>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stable footer — NOT remounted on a page turn, so the chevrons keep
          focus and the live region announces in place. */}
      <div aria-hidden="true" className={dividerClasses} />
      <ReadingProgress
        pageIndex={page.index}
        pageCount={pageCount}
        onPrev={onPrevPage}
        onNext={onNextPage}
      />
    </div>
  );
}
