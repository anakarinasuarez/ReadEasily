/**
 * Figma Code Connect mapping for SectionHeader → Figma node 1261:3706
 * ("Section Header", file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency; this file is
 * compiled by the Figma `code-connect` CLI, not the app `tsc` build (excluded
 * in tsconfig.json). Add the devDependency + `figma.config.json` to publish.
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
