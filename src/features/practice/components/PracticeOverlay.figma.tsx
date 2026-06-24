/**
 * Figma Code Connect mapping for the PracticeOverlay feature dialog.
 *
 * Mapped to the desktop overlay (node 879:1263 → practice-modal 881:1428); the
 * mobile variant (992:1657) is the same component's responsive bottom-sheet, not
 * a separate mapping. The overlay is data-driven (it fetches its own sentences),
 * so only the author-supplied identity/context props map to Figma text; the
 * sentence list, controls and states are composed internally.
 *
 * Consumed by the Figma Code Connect CLI (`@figma/code-connect`), not by the
 * Next.js app build; it is excluded from `tsc`/`eslint` until that toolchain is
 * installed in the repo.
 */
import figma from "@figma/code-connect";
import { PracticeOverlay } from "./PracticeOverlay";

figma.connect(
  PracticeOverlay,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5?node-id=879-1263",
  {
    props: {
      word: figma.string("Word"),
      translation: figma.string("Translation"),
    },
    example: ({ word, translation }) => (
      <PracticeOverlay
        open
        onOpenChange={() => {}}
        word={word}
        translation={translation}
        language="es"
        sourceStoryId="the-ant-and-the-grasshopper"
        sourceStoryTitle="The Ant & the Grasshopper"
      />
    ),
  },
);
