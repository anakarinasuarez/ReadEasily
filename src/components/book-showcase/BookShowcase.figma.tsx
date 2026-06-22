/**
 * Figma Code Connect mapping for BookShowcase → Figma node 1272:4611
 * (the "Book Carousel" fan, file sc9DIhX0wvFgrvmL8NVBf5, page "Components").
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency and these files
 * are compiled by the Figma `code-connect` CLI, not the app `tsc` build (they
 * are excluded in tsconfig.json). Add the devDependency + `figma.config.json`
 * to publish this mapping.
 *
 * The Figma fan is a static arrangement of 7 cover slots (center + 3 per side)
 * with the synced 10-pill dot rail (node 1272:4600) as a sibling. In code those
 * collapse into one composite: `items` drives both the fan and the dots, and
 * the centered/active state is data (`activeIndex`) rather than a Figma variant.
 * The fan transforms + active-dot elongation are reproduced internally, so the
 * mapping just shows the canonical wiring.
 */
import figma from "@figma/code-connect";
import { BookShowcase } from "./BookShowcase";

figma.connect(
  BookShowcase,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=1272-4611",
  {
    example: () => (
      <BookShowcase
        items={[
          { coverSrc: "/covers/placeholder-1.png", alt: "Featured story 1" },
          { coverSrc: "/covers/placeholder-2.png", alt: "Featured story 2" },
          { coverSrc: "/covers/placeholder-3.png", alt: "Featured story 3" },
          { coverSrc: "/covers/placeholder-4.png", alt: "Featured story 4" },
          { coverSrc: "/covers/placeholder-5.png", alt: "Featured story 5" },
          { coverSrc: "/covers/placeholder-6.png", alt: "Featured story 6" },
          { coverSrc: "/covers/placeholder-7.png", alt: "Featured story 7" },
        ]}
        onActiveChange={(index) => {
          // Library hero reads this to drive the title/level/duration copy block.
          void index;
        }}
      />
    ),
  },
);
