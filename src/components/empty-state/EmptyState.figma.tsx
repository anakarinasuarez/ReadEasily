/**
 * Figma Code Connect mapping for EmptyState → Figma node 144:213
 * ("Saved — empty", file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * NOTE: `@figma/code-connect` (^1.4.8) + `figma.config.json` are now set up, so
 * this file is parsed and published by the Figma `code-connect` CLI
 * (`npm run figma:parse` / `figma:publish`), not the app `tsc` build (it stays
 * excluded in tsconfig.json). Publishing the mapping needs FIGMA_ACCESS_TOKEN +
 * a paid seat.
 *
 * The Figma node is a static frame (no variant properties): a rounded-square
 * icon tile + title + Lora-italic body + a primary Button CTA. The mapping
 * pulls the two text layers as strings and the CTA label from the nested Button
 * instance; the icon glyph and the action handler are author-supplied in code.
 */
import figma from "@figma/code-connect";
import { EmptyState } from "./EmptyState";

figma.connect(
  EmptyState,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=144-213",
  {
    props: {
      title: figma.string("No saved words yet"),
      body: figma.string("You haven't saved any words yet."),
      actionLabel: figma.nestedProps("Button", {
        label: figma.string("label"),
      }),
    },
    example: ({ title, body, actionLabel }) => (
      <EmptyState
        icon={<svg />}
        title={title}
        body={body}
        action={{ label: actionLabel.label, onClick: () => {} }}
      />
    ),
  },
);
