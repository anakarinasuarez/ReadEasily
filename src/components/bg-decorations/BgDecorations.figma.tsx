/**
 * Figma Code Connect mapping for BgDecorations → Figma node 254:2
 * ("Bg Decorations", file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency; this file is
 * compiled by the Figma `code-connect` CLI, not the app `tsc` build (excluded
 * in tsconfig.json). Add the devDependency + `figma.config.json` to publish.
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
