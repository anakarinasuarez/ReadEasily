/**
 * Figma Code Connect mapping for SectionHeader → Figma node 1261:3706
 * ("Section Header", file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * NOTE: `@figma/code-connect` (^1.4.8) is now a devDependency and
 * `figma.config.json` is at the repo root, so this file is parsed/published by
 * the Figma `code-connect` CLI (`npm run figma:parse` / `figma:publish`), not the
 * app `tsc` build (still excluded in tsconfig.json). Publishing needs
 * FIGMA_ACCESS_TOKEN + a paid seat.
 *
 * The Figma component has a single text property (the title) and a decorative
 * marker bar; there is no variant for heading level, so `as` is author-supplied.
 */
import figma from "@figma/code-connect";
import { SectionHeader } from "./SectionHeader";

figma.connect(
  SectionHeader,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=1261-3706",
  {
    props: {
      title: figma.string("Fables"),
    },
    example: ({ title }) => <SectionHeader title={title} />,
  },
);
