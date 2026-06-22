import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import {
  BookShowcase,
  type ActiveChangeSource,
  type BookShowcaseItem,
} from "./BookShowcase";

/**
 * BookShowcase stories cover the circular cover-flow carousel: the default
 * auto-rotating N=7 fan, a host-controlled pairing with a Pause/Play toggle +
 * hero copy (how the Library feature wires it), the paused + reduced-motion
 * states, the N=1 edge case, and an N=10 set that shows back-ring windowing.
 *
 * Auto-rotation can't be fully seen in a static snapshot — run live: the fan
 * steps every `autoAdvanceMs`, pauses on hover / keyboard focus, exposes a
 * Pause/Play toggle, and stops entirely under reduced motion (dots still work).
 */

// Unsplash seeds stand in for the painted covers the MCP renders blank.
const COVERS: BookShowcaseItem[] = [
  { coverSrc: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=640&q=80", alt: "The Sleepy Robot", href: "#" },
  { coverSrc: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=640&q=80", alt: "A Trip to the Mountains", href: "#" },
  { coverSrc: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=640&q=80", alt: "Lost at the Airport", href: "#" },
  { coverSrc: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=640&q=80", alt: "The Ant and the Grasshopper", href: "#" },
  { coverSrc: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=640&q=80", alt: "The Clever Crow", href: "#" },
  { coverSrc: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=640&q=80", alt: "The Boy Who Cried Wolf", href: "#" },
  { coverSrc: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=640&q=80", alt: "The Tortoise and the Hare", href: "#" },
];

// N=10 — three extra covers to exercise the back-ring windowing (covers beyond
// the fan width ride at the back, faded, and teleport across the seam).
const MANY: BookShowcaseItem[] = [
  ...COVERS,
  { coverSrc: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca1?w=640&q=80", alt: "The Lost Keys", href: "#" },
  { coverSrc: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=640&q=80", alt: "My First Smartphone", href: "#" },
  { coverSrc: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=640&q=80", alt: "The Helpful Robot", href: "#" },
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

/** Default — N=7, auto-rotating step-and-rest every 4.5s (hover/focus pauses). */
export const Default: Story = {};

/** Faster cadence to make the step-and-rest motion obvious in the live story. */
export const FastAutoCycle: Story = { args: { autoAdvanceMs: 1500 } };

/**
 * Host-controlled — mirrors the Library hero: owns `playing` + the live copy,
 * shows the Pause/Play toggle, and hard-stops auto on any user navigation.
 */
export const WithPlayToggle: Story = {
  render: (args) => {
    function Demo() {
      const [active, setActive] = useState(() => Math.floor(args.items.length / 2));
      const [playing, setPlaying] = useState(true);
      const onChange = (index: number, source: ActiveChangeSource) => {
        setActive(index);
        if (source === "user") setPlaying(false); // user nav hard-stops auto
      };
      return (
        <div className="flex flex-col items-center gap-6">
          <BookShowcase
            {...args}
            activeIndex={active}
            onActiveChange={onChange}
            autoAdvance={playing}
            playing={playing}
            onTogglePlay={() => setPlaying((p) => !p)}
          />
          <div className="text-center">
            <p className="text-sm text-[var(--text-muted)]">
              {playing ? "Playing" : "Paused"} — centred story
            </p>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
              {args.items[active].alt}
            </h2>
          </div>
        </div>
      );
    }
    return <Demo />;
  },
};

/** Paused — auto-rotation off via `playing={false}`; the toggle reads "Play". */
export const Paused: Story = {
  args: { autoAdvance: false, playing: false, onTogglePlay: () => {} },
};

/**
 * Reduced motion — set your OS / browser to "reduce motion": no auto-advance,
 * transitions disabled, and the Pause/Play toggle is hidden (nothing to pause);
 * the dots remain fully usable to change the active cover.
 */
export const ReducedMotion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Honours `prefers-reduced-motion: reduce` — no auto-advance, transitions off, toggle hidden; dots still navigate.",
      },
    },
  },
};

/** Single item (N=1) — no dots, no toggle, no auto-cycle; just the centered cover. */
export const SingleItem: Story = { args: { items: [COVERS[3]] } };

/** Many covers (N=10) — surplus covers ride the back rings and teleport the seam. */
export const ManyCovers: Story = { args: { items: MANY } };

/**
 * Decorative — for single-featured-story hosts. The fan still auto-cycles
 * visually, but the region is `aria-hidden`, tiles are non-interactive, and the
 * dots are inert indicators — no control that does nothing.
 */
export const Decorative: Story = { args: { decorative: true } };
