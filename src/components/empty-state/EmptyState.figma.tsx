/**
 * Figma Code Connect mapping for EmptyState → Figma node 144:213
 * ("Saved — empty", file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency; this file is
 * compiled by the Figma `code-connect` CLI, not the app `tsc` build (it is
 * excluded in tsconfig.json). Add the devDependency + `figma.config.json` to
 * publish the mapping.
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
