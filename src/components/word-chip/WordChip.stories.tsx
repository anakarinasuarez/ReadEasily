import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WordChip } from "./WordChip";

const meta = {
  title: "Components/WordChip",
  component: WordChip,
  parameters: { layout: "centered" },
  args: {
    word: "grasshopper",
    translation: "saltamontes",
    pos: "noun",
  },
} satisfies Meta<typeof WordChip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Front face — the English word, with the "+" save affordance. */
export const Default: Story = {};

/** Already saved — the "+" becomes a filled accent check. */
export const Saved: Story = {
  args: { saved: true },
};

/**
 * Flipped — shows the back face (meaning + part of speech). Rendered from a
 * harness that clicks the body once so the static story captures the back face.
 */
export const Flipped: Story = {
  render: (args) => {
    function Demo() {
      const [saved, setSaved] = useState(false);
      return (
        <WordChip {...args} saved={saved} onSave={() => setSaved((s) => !s)} />
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const body = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-expanded]',
    );
    body?.click();
  },
};

/** Long word — the pill grows with content; the flip reserves the wider face. */
export const LongWord: Story = {
  args: {
    word: "extraordinarily",
    translation: "extraordinariamente",
    pos: "adverb",
  },
};

/** A wrapped row of chips, mirroring the Story Detail "key words" cluster. */
export const Cluster: Story = {
  render: () => {
    const words: Array<{ word: string; translation: string; pos?: string }> = [
      { word: "grasshopper", translation: "saltamontes", pos: "noun" },
      { word: "field", translation: "campo", pos: "noun" },
      { word: "summer", translation: "verano", pos: "noun" },
      { word: "winter", translation: "invierno", pos: "noun" },
      { word: "ant", translation: "hormiga", pos: "noun" },
      { word: "grain", translation: "grano", pos: "noun" },
      { word: "seeds", translation: "semillas", pos: "noun" },
    ];

    function Demo() {
      const [saved, setSaved] = useState<Record<string, boolean>>({});
      return (
        <div className="flex max-w-[360px] flex-wrap gap-[10px]">
          {words.map((w) => (
            <WordChip
              key={w.word}
              word={w.word}
              translation={w.translation}
              pos={w.pos}
              saved={!!saved[w.word]}
              onSave={() =>
                setSaved((s) => ({ ...s, [w.word]: !s[w.word] }))
              }
            />
          ))}
        </div>
      );
    }
    return <Demo />;
  },
};
