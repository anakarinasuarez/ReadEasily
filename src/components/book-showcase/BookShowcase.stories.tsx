import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { BookShowcase, type BookShowcaseItem } from "./BookShowcase";

/**
 * BookShowcase stories cover the fanned hero carousel: the default auto-cycling
 * fan, a controlled pairing with a hero copy block (how the Library feature
 * actually wires it via `onActiveChange`), the reduced-motion behaviour, and a
 * minimal 1-item edge case (no dots, no auto-cycle).
 *
 * Auto-cycle + reduced-motion can't be fully exercised in a static snapshot —
 * run the stories live: the fan advances every `autoAdvanceMs`, pauses on
 * hover / keyboard focus, and stops entirely when the OS requests reduced
 * motion (the dots still work).
 */

// A 7-cover featured set. Unsplash seeds stand in for the painted covers the
// MCP renders blank (external image fills).
const COVERS: BookShowcaseItem[] = [
  { coverSrc: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=640&q=80", alt: "The Sleepy Robot" },
  { coverSrc: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=640&q=80", alt: "A Trip to the Mountains" },
  { coverSrc: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=640&q=80", alt: "Lost at the Airport" },
  { coverSrc: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=640&q=80", alt: "The Ant and the Grasshopper" },
  { coverSrc: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=640&q=80", alt: "The Clever Crow" },
  { coverSrc: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=640&q=80", alt: "The Boy Who Cried Wolf" },
  { coverSrc: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=640&q=80", alt: "The Tortoise and the Hare" },
];

const meta = {
  title: "Components/BookShowcase",
  component: BookShowcase,
  parameters: { layout: "fullscreen" },
  args: { items: COVERS, autoAdvanceMs: 4500 },
  decorators: [
    (Story) => (
      <div className="bg-canvas px-4 py-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BookShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Uncontrolled — fans 7 covers and auto-cycles every 4.5s (hover to pause). */
export const Default: Story = {};

/** Faster cadence to make the auto-cycle obvious in the live story. */
export const FastAutoCycle: Story = { args: { autoAdvanceMs: 1500 } };

/**
 * Controlled — the hero copy block reads `onActiveChange` and stays in sync,
 * which is exactly how the Library hero composes BookShowcase.
 */
export const ControlledWithHeroCopy: Story = {
  render: (args) => {
    function Demo() {
      const [active, setActive] = useState(0);
      return (
        <div className="flex flex-col items-center gap-6">
          <BookShowcase {...args} activeIndex={active} onActiveChange={setActive} />
          <div className="text-center">
            <p className="text-sm text-[var(--text-muted)]">Featured story</p>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
              {COVERS[active].alt}
            </h2>
          </div>
        </div>
      );
    }
    return <Demo />;
  },
};

/**
 * Reduced motion — set your OS / browser to "reduce motion" and the fan will
 * NOT auto-advance; the dots remain fully usable to change the active cover.
 */
export const ReducedMotion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Honours `prefers-reduced-motion: reduce` — no auto-advance, transitions disabled; dots still navigate.",
      },
    },
  },
};

/** Single item — no dots, no auto-cycle; just the centered cover. */
export const SingleItem: Story = { args: { items: [COVERS[3]] } };
