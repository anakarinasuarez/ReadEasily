import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { WordToken } from "./WordToken";

/**
 * The reading passage type style (Reading/XL — Lora 28/44, `--text-secondary`)
 * from the Reading Card (Figma 1157:3132). There is no `text-reading-xl` token
 * utility yet, so this story scaffolds the paragraph with the Reading font token
 * plus the literal 28/44 values to demonstrate that WordToken inherits the type
 * and flows inline. WordToken itself declares NO font — it inherits this.
 */
const readingParagraph =
  "[font-family:var(--font-reading)] text-[28px] leading-[44px] text-[color:var(--text-secondary)] max-w-[680px]";

const meta = {
  title: "UI/WordToken",
  component: WordToken,
  parameters: { layout: "padded" },
  args: { word: "ants", selected: false, speaking: false, disabled: false },
  argTypes: {
    word: { control: "text" },
    selected: { control: "boolean" },
    speaking: { control: "boolean" },
    disabled: { control: "boolean" },
    onActivate: { action: "activate" },
  },
  decorators: [
    (Story) => (
      <p className={readingParagraph}>
        <Story />
      </p>
    ),
  ],
} satisfies Meta<typeof WordToken>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Resting — looks like plain reading text; discoverability comes from the tap hint, not chrome. */
export const Default: Story = {};

/**
 * Hover is a CSS-only state and can't be frozen as an arg. Hover the word below
 * to see the gentle warm affordance: a `--bg-accent-subtle` tint + a thin
 * `--border-accent` underline (motion-safe).
 */
export const HoverReference: Story = {};

/** Focus-visible — a 2px `--focus-ring` outline (AA), offset so it never clips neighbours. Tab to it. */
export const Focus: Story = {};

/** Selected — its meaning popover is open: terracotta underline + subtle tint, and `aria-current="true"`. */
export const Selected: Story = { args: { selected: true } };

/** Speaking — TTS is voicing this word: a stronger highlight to track the audio. Visual only, not announced. */
export const Speaking: Story = { args: { speaking: true } };

/**
 * The real use: a `text-reading-xl` passage rendered as a sequence of WordTokens
 * interleaved with plain separator text. One word is selected and one is
 * speaking so the inline flow + states are visible together — note the line
 * wraps and 44px line-height are unaffected by any state.
 */
export const InPassage: Story = {
  decorators: [],
  render: () => {
    // word | separator pairs (the separator is plain, non-interactive text).
    const tokens: Array<[string, string]> = [
      ["Near", " "],
      ["the", " "],
      ["path", ", "],
      ["a", " "],
      ["line", " "],
      ["of", " "],
      ["ants", " "],
      ["worked", " "],
      ["hard", ". "],
      ["They", " "],
      ["carried", " "],
      ["seeds", " "],
      ["and", " "],
      ["grain", " "],
      ["to", " "],
      ["their", " "],
      ["nest", ", "],
      ["one", " "],
      ["heavy", " "],
      ["step", " "],
      ["at", " "],
      ["a", " "],
      ["time", "."],
    ];
    return (
      <p className={readingParagraph}>
        {tokens.map(([word, sep], i) => (
          <span key={`${word}-${i}`}>
            <WordToken word={word} selected={word === "ants"} speaking={word === "grain"} />
            {sep}
          </span>
        ))}
      </p>
    );
  },
};

/**
 * Interactive — clicking a word "opens its popover" (here, marks it selected).
 * Demonstrates that activation toggles state without disturbing the line flow.
 */
export const Interactive: Story = {
  decorators: [],
  render: () => {
    const words = ["Cerca", "del", "sendero", "una", "fila", "de", "hormigas"];
    const [open, setOpen] = useState<string | null>(null);
    return (
      <p className={readingParagraph}>
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <WordToken
              word={word}
              selected={open === word}
              onActivate={() => setOpen((prev) => (prev === word ? null : word))}
            />
            {i < words.length - 1 ? " " : "."}
          </span>
        ))}
      </p>
    );
  },
};
