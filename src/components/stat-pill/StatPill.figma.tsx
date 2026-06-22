/**
 * Figma Code Connect mapping for StatPill → Figma node 999:1714
 * (the Saved-header "pills" node, file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency and this file is
 * compiled by the Figma `code-connect` CLI, not the app `tsc` build (excluded
 * in tsconfig.json). Add the devDependency + `figma.config.json` to publish.
 *
 * 999:1714 is a layout frame holding two pill instances; it is NOT a component
 * set with variant props, so the value/label/tone here are illustrative of a
 * single pill rather than bound Figma properties. The canonical pair is
 * accent "words to review" + warning "practice sets" — and the warning numeral
 * ships in the AA-safe --feedback-warning (text-warning), never raw amber.
 */
import figma from "@figma/code-connect";
import { StatPill } from "./StatPill";

figma.connect(
  StatPill,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=999-1714",
  {
    example: () => <StatPill tone="accent" value={8} label="words to review" />,
  },
);
