import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlayerBar, type PlayerBarStatus } from "./PlayerBar";

/** Format seconds → "m:ss" for the time labels. */
function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SPEEDS = [0.75, 1, 1.25, 1.5];
const DURATION = 63; // 1:03 — matches the Figma frame total
const SENTENCES = 8;

/**
 * Stateful harness — PlayerBar is fully controlled, so the story owns playing /
 * progress / speed and wires the handlers, mirroring how the Reader feature
 * will. No real audio: progress is moved by seek + the transport buttons.
 */
function PlayerDemo({
  status = "ready",
  initialPlaying = false,
  initialProgress = 0,
}: {
  status?: PlayerBarStatus;
  initialPlaying?: boolean;
  initialProgress?: number;
}) {
  const [playing, setPlaying] = useState(initialPlaying);
  const [progress, setProgress] = useState(initialProgress);
  const [speedIndex, setSpeedIndex] = useState(1); // 1×

  const elapsed = progress * DURATION;
  const sentenceStep = 1 / SENTENCES;

  return (
    <div className="min-h-[200px] bg-[var(--bg-canvas)] p-[var(--space-2xl)]">
      <div className="mx-auto max-w-[1100px]">
        <PlayerBar
          status={status}
          playing={playing}
          progress={progress}
          elapsedLabel={fmt(elapsed)}
          totalLabel={fmt(DURATION)}
          sentenceCount={SENTENCES}
          speed={SPEEDS[speedIndex]}
          level="A2"
          onTogglePlay={() => setPlaying((p) => !p)}
          onSeek={setProgress}
          onPrevSentence={() =>
            setProgress((p) => Math.max(0, p - sentenceStep))
          }
          onNextSentence={() =>
            setProgress((p) => Math.min(1, p + sentenceStep))
          }
          onRestart={() => {
            setProgress(0);
            setPlaying(false);
          }}
          onSkipEnd={() => {
            setProgress(1);
            setPlaying(false);
          }}
          onCycleSpeed={() =>
            setSpeedIndex((i) => (i + 1) % SPEEDS.length)
          }
          onToggleFullscreen={() => {}}
        />
      </div>
    </div>
  );
}

const meta = {
  title: "Composites/PlayerBar",
  component: PlayerBar,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PlayerBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Idle — audio ready, paused, at the start. */
export const Idle: Story = {
  render: () => <PlayerDemo status="ready" initialPlaying={false} />,
};

/** Playing — pause glyph showing, mid-progress. */
export const Playing: Story = {
  render: () => (
    <PlayerDemo status="ready" initialPlaying initialProgress={0.32} />
  ),
};

/** Mid-progress — the orange fill over the dotted rail + playhead visible
 *  (Figma 1128:2573: the unfilled track is a uniform dotted rail, not a solid
 *  bar or per-sentence ticks). */
export const MidProgressDottedRail: Story = {
  render: () => <PlayerDemo status="ready" initialProgress={0.55} />,
};

/** Mobile transport (Figma 856:928) — at <768px the level chip and the settings
 *  gear drop out, leaving speed · restart · prev · play · next · skip. Rendered
 *  at a 390px viewport so the `hidden md:flex` controls are absent. */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => <PlayerDemo status="ready" initialProgress={0.32} />,
};

/** Loading — the play button buffers (spinner, aria-busy). */
export const Loading: Story = {
  render: () => <PlayerDemo status="loading" initialProgress={0.1} />,
};

/** Disabled — no audio for this story: every control inert + an sr-only note. */
export const DisabledNoAudio: Story = {
  render: () => <PlayerDemo status="disabled" />,
};

/** Speed variants — the pill renders whatever `speed` the feature owns. */
export const SpeedVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-lg)] bg-[var(--bg-canvas)] p-[var(--space-2xl)]">
      {SPEEDS.map((s) => (
        <PlayerBar
          key={s}
          status="ready"
          playing={false}
          progress={0.4}
          elapsedLabel="0:25"
          totalLabel="1:03"
          sentenceCount={SENTENCES}
          speed={s}
          level="B1"
          onTogglePlay={() => {}}
          onSeek={() => {}}
          onCycleSpeed={() => {}}
        />
      ))}
    </div>
  ),
};
