/**
 * Figma Code Connect mapping for BookShowcase → Figma node 1272:4611
 * (the "Book Carousel" fan, file sc9DIhX0wvFgrvmL8NVBf5, page "Components").
 *
 * NOTE: `@figma/code-connect` (^1.4.8) + a repo-root `figma.config.json` are now
 * in place, so these files are parsed and published by the Figma `code-connect`
 * CLI (`npm run figma:parse` / `figma:publish`), not the app `tsc` build (they
 * stay excluded in tsconfig.json). Publishing needs FIGMA_ACCESS_TOKEN + a paid
 * seat.
 *
 * The Figma fan is a static arrangement of 7 cover slots (center + 3 per side)
 * with the synced dot rail (node 1272:4600) as a sibling. In code those collapse
 * into one composite: `items` drives both the fan and the dots (each dot named
 * by its story's `alt`), the centered/active state is data (`activeIndex`), and
 * the centered cover links via the item's `href`. The fan transforms + active-
 * dot elongation are reproduced internally, so the mapping shows the wiring.
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
          { coverSrc: "/covers/The-tortoise-and-the-hare.webp", alt: "The Tortoise and the Hare", href: "/read/the-tortoise-and-the-hare" },
          { coverSrc: "/covers/A-trip-mountains.webp", alt: "A Trip to the Mountains", href: "/read/a-trip-to-the-mountains" },
          { coverSrc: "/covers/the-clever-crow.webp", alt: "The Clever Crow", href: "/read/the-clever-crow" },
          { coverSrc: "/covers/the-ant-grasshopper.webp", alt: "The Ant and the Grasshopper", href: "/read/the-ant-and-the-grasshopper" },
          { coverSrc: "/covers/The-boy-who-cried-wolf.webp", alt: "The Boy Who Cried Wolf", href: "/read/the-boy-who-cried-wolf" },
          { coverSrc: "/covers/A-morning-in-the-city.webp", alt: "A Morning in the City", href: "/read/a-morning-in-the-city" },
          { coverSrc: "/covers/My-first-Smartphone.webp", alt: "My First Smartphone", href: "/read/my-first-smartphone" },
        ]}
        onActiveChange={(index) => {
          // Library hero reads this to drive the title/level/duration copy block.
          void index;
        }}
      />
    ),
  },
);
