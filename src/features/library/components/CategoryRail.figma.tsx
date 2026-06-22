/**
 * Figma Code Connect mapping for CategoryRail → Figma node 1272:4623
 * (a Library catalog shelf, file sc9DIhX0wvFgrvmL8NVBf5, page "Screens").
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency and these files
 * are compiled by the Figma `code-connect` CLI, not the app `tsc` build (they
 * are excluded in tsconfig.json). Add the devDependency + `figma.config.json`
 * to publish this mapping.
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
