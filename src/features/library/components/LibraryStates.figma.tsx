/**
 * Figma Code Connect mapping for the Library non-data states → Figma node
 * 1272:4578 (the Library content area, file sc9DIhX0wvFgrvmL8NVBf5, page
 * "Screens"). The Loading / Empty / Error treatments are distinct designed
 * states of this region; in code they are three colocated components.
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency and these files
 * are compiled by the Figma `code-connect` CLI, not the app `tsc` build (they
 * are excluded in tsconfig.json). Add the devDependency + `figma.config.json`
 * to publish this mapping. When each state gets its own Figma node id, split
 * the Empty/Error connects onto those nodes.
 */
import figma from "@figma/code-connect";
import { LibraryEmpty, LibraryError, LibrarySkeleton } from "./LibraryStates";

figma.connect(
  LibrarySkeleton,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=1272-4578",
  {
    variant: { State: "Loading" },
    example: () => <LibrarySkeleton />,
  },
);

figma.connect(
  LibraryEmpty,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=1272-4578",
  {
    variant: { State: "Empty" },
    example: () => <LibraryEmpty onShowAll={() => {}} />,
  },
);

figma.connect(
  LibraryError,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=1272-4578",
  {
    variant: { State: "Error" },
    example: () => <LibraryError onRetry={() => {}} />,
  },
);
