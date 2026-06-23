/**
 * Figma Code Connect mapping for the WordPopover composite.
 *
 * Mapped to the Reader word-popover (node 1158:4019, the desktop overlay frame
 * 876:1243; mobile variant 1158:5223 shares this component, so one mapping
 * covers both breakpoints). The popover is presentational + controlled: its
 * `word`, `pos` and `translation` are text props; `status` and `saved` are the
 * state model. Handlers are author-supplied, so the example wires no-ops.
 *
 * Consumed by the Figma Code Connect CLI (`@figma/code-connect`), not by the
 * Next.js app build; it is excluded from `tsc`/`eslint` until that toolchain is
 * installed in the repo.
 */
import figma from "@figma/code-connect";
import { WordPopover } from "./WordPopover";

figma.connect(
  WordPopover,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5?node-id=1158-4019",
  {
    props: {
      word: figma.string("Word"),
      pos: figma.string("POS"),
      translation: figma.string("Translation"),
    },
    example: ({ word, pos, translation }) => (
      <WordPopover
        word={word}
        pos={pos}
        translation={translation}
        status="ready"
        saved={false}
        onPronounce={() => {}}
        onToggleSave={() => {}}
        onPractice={() => {}}
        onClose={() => {}}
      />
    ),
  },
);
