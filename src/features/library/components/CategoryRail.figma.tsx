/**
 * Figma Code Connect mapping for CategoryRail → Figma node 1272:4623
 * (a Library catalog shelf, file sc9DIhX0wvFgrvmL8NVBf5, page "Screens").
 *
 * NOTE: `@figma/code-connect` (^1.4.8) + `figma.config.json` are now set up, so
 * these files are parsed and published by the Figma `code-connect` CLI
 * (`npm run figma:parse` / `figma:publish`), not the app `tsc` build (they stay
 * excluded in tsconfig.json); publishing needs FIGMA_ACCESS_TOKEN + a paid seat.
 *
 * The Figma shelf is a header (full-height accent marker + title + subtitle)
 * over a horizontal row of Book Cards. In code that is one data-driven
 * `section`: the heading text + the `books` array. The mapping shows the
 * canonical wiring with a representative shelf.
 */
import figma from "@figma/code-connect";
import { CategoryRail } from "./CategoryRail";

figma.connect(
  CategoryRail,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=1272-4623",
  {
    example: () => (
      <CategoryRail
        section={{
          id: "fables",
          title: "Fables",
          subtitle: "Timeless tales, gently retold",
          accent: "bg-cat-fables-rail",
          books: [
            {
              id: "the-ant-and-the-grasshopper",
              title: "The Ant and the Grasshopper",
              level: "A2",
              minutes: 6,
              coverSrc: "/covers/the-ant-grasshopper.webp",
              category: "fables",
              href: "/read/the-ant-and-the-grasshopper",
            },
            {
              id: "the-clever-crow",
              title: "The Clever Crow",
              level: "A1",
              minutes: 4,
              coverSrc: "/covers/the-clever-crow.webp",
              category: "fables",
              href: "/read/the-clever-crow",
            },
          ],
        }}
      />
    ),
  },
);
