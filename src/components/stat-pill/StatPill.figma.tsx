/**
 * Figma Code Connect mapping for StatPill → Figma node 999:1714
 * (the Saved-header "pills" node, file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * NOTE: `@figma/code-connect` (^1.4.8) + `figma.config.json` are now in place, so
 * this file is parsed/published by the Figma `code-connect` CLI
 * (`npm run figma:parse` / `figma:publish`), not the app `tsc` build (still
 * excluded in tsconfig.json). Publishing needs FIGMA_ACCESS_TOKEN + a paid seat.
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
