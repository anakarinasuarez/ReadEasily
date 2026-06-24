/**
 * Figma Code Connect mapping for the WordChip composite.
 *
 * Mapped to the Story Detail word-chips cluster (node 844:1158); the individual
 * chip is 844:1159. WordChip is presentational: `word` and `translation` are
 * text props, `saved` is the state model, and the flip is internal. The save
 * handler is author-supplied, so the example wires a no-op.
 *
 * LOCAL ONLY: Code Connect publish needs a paid Figma Dev/Full seat (see the
 * read-figma skill), so this mapping is committed but never pushed to the
 * server. It is consumed by the Figma Code Connect CLI (`@figma/code-connect`),
 * not by the Next.js app build, and is excluded from `tsc`/`eslint`.
 */
import figma from "@figma/code-connect";
import { WordChip } from "./WordChip";

figma.connect(
  WordChip,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5?node-id=844-1158",
  {
    props: {
      word: figma.string("Word"),
    },
    example: ({ word }) => (
      <WordChip
        word={word}
        translation="saltamontes"
        pos="noun"
        saved={false}
        onSave={() => {}}
      />
    ),
  },
);
