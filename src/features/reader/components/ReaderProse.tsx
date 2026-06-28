import type { StoryProse } from "../server/getStoryProse";
import { AudioWaveIcon } from "./icons";

/**
 * ReaderProse — the server-rendered reading base layer. Shown in the Reader's
 * pending/SSR pass (when `initialProse` is supplied), it puts the full story
 * text + title into the prerendered HTML so crawlers and no-JS readers get the
 * real, readable story. Once the client `/api/story/:id` query resolves, the
 * interactive paginated Reader replaces it. Inert and presentational — no taps,
 * no audio, no pagination; matches the loaded title + reading-card footprint so
 * the hand-off doesn't jar.
 */
export function ReaderProse({ prose }: { prose: StoryProse }) {
  return (
    <>
      {/* Title — mirrors the loaded reader's H1 (Figma 125:159). */}
      <h1 className="flex items-center justify-center gap-md text-center text-[color:var(--text-primary)] [font-family:var(--text-display-l-family)] [font-weight:var(--text-display-l-weight)] text-heading-h1 md:text-[length:var(--text-display-l-size)] md:[line-height:var(--text-display-l-line-height)] md:[letter-spacing:var(--text-display-l-tracking)]">
        {prose.title}
        <span
          aria-hidden="true"
          className="inline-flex size-[18px] shrink-0 items-center justify-center text-[color:var(--text-accent)] [&>svg]:size-full"
        >
          <AudioWaveIcon />
        </span>
      </h1>

      {/* The story body on the reading card (same footprint as the live card). */}
      <article className="w-full max-w-[745px] rounded-2xl bg-[var(--bg-elevated)] px-[60px] pt-[50px] pb-[var(--space-xl)] shadow-[var(--shadow-reading-card)]">
        <div className="flex flex-col gap-[var(--space-lg)] font-reading text-[color:var(--text-primary)] [font-size:var(--text-body-l-size)] [line-height:var(--text-body-l-line-height)]">
          {prose.paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
    </>
  );
}
