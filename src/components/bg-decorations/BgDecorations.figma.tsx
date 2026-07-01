/**
 * Figma Code Connect mapping for BgDecorations → Figma node 254:2
 * ("Bg Decorations", file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * NOTE: `@figma/code-connect` (^1.4.8) + `figma.config.json` are now set up, so
 * this file is parsed and published by the Figma `code-connect` CLI
 * (`npm run figma:parse` / `figma:publish`), not the app `tsc` build (still
 * excluded in tsconfig.json). Publishing needs FIGMA_ACCESS_TOKEN + a paid seat.
 *
 * The Figma node has no variant properties — it is a fixed atmospheric frame of
 * three blurred ellipses. In code the three raster ellipses are reproduced with
 * token-bound, blurred CSS tints, so the mapping has no props to bind.
 */
import figma from "@figma/code-connect";
import { BgDecorations } from "./BgDecorations";

figma.connect(
  BgDecorations,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=254-2",
  {
    props: {},
    example: () => <BgDecorations />,
  },
);
