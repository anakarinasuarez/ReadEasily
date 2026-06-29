/**
 * Figma Code Connect mapping for the PlayerBar composite.
 *
 * Maps the Reader's bottom audio bar (Figma node 1128:2573 — "Player Bar /
 * Desktop") to this controlled component. The Figma node is a single static
 * frame, not a component set with variant properties, so the runtime states
 * (playing / loading / disabled, progress, speed, level) are this component's
 * own controlled API rather than Figma variant axes — the example below pins a
 * representative "playing, mid-progress" snapshot.
 *
 * This file is consumed by the Figma Code Connect CLI (`@figma/code-connect`),
 * not by the Next.js app build. It is excluded from `tsc`/`eslint` until the
 * Code Connect toolchain is installed in the repo.
 */
import figma from "@figma/code-connect";
import { PlayerBar } from "./PlayerBar";

figma.connect(
  PlayerBar,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5?node-id=1128-2573",
  {
    props: {
      // The Figma frame shows elapsed 0:09 / total 1:03 with a partial fill.
      elapsedLabel: figma.string("elapsed"),
      totalLabel: figma.string("total"),
    },
    example: ({ elapsedLabel, totalLabel }) => (
      <PlayerBar
        playing
        status="ready"
        progress={0.15}
        elapsedLabel={elapsedLabel}
        totalLabel={totalLabel}
        sentenceCount={8}
        speed={1}
        level="A2"
        onTogglePlay={() => {}}
        onSeek={() => {}}
        onPrevSentence={() => {}}
        onNextSentence={() => {}}
        onRestart={() => {}}
        onSkipEnd={() => {}}
        onCycleSpeed={() => {}}
        onToggleFullscreen={() => {}}
      />
    ),
  },
);
