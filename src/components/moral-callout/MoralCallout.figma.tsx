/**
 * Figma Code Connect mapping for the MoralCallout composite.
 *
 * Mapped to the Story Detail moral callout (node 26:2 desktop; mobile variant
 * 844:1152 shares this component, so one mapping covers both breakpoints).
 * MoralCallout is purely presentational: the eyebrow `label` and the `moral`
 * body are text props.
 *
 * LOCAL ONLY: Code Connect publish needs a paid Figma Dev/Full seat (see the
 * read-figma skill), so this mapping is committed but never pushed to the
 * server. It is consumed by the Figma Code Connect CLI (`@figma/code-connect`),
 * not by the Next.js app build, and is excluded from `tsc`/`eslint`.
 */
import figma from "@figma/code-connect";
import { MoralCallout } from "./MoralCallout";

figma.connect(
  MoralCallout,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5?node-id=26-2",
  {
    props: {
      label: figma.string("THE MORAL"),
      moral: figma.string("Body"),
    },
    example: ({ label, moral }) => (
      <MoralCallout label={label} moral={moral} />
    ),
  },
);
