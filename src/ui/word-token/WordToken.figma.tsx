import figma from "@figma/code-connect";
import { WordToken } from "./WordToken";

/**
 * Code Connect mapping for the interactive word inside the Reading Card
 * (Figma node 1157:3132, file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * The reading passage in Figma is a single Lora 28/44 `--text-secondary`
 * paragraph (Reading/XL) with no per-word layers — the static design shows
 * resting reading text. WordToken is the per-word interactive primitive the
 * design-lead spec adds on top: the passage is rendered as a sequence of these.
 * Its `selected` / `speaking` states are interaction states, not Figma variant
 * properties, so they are not bound here.
 *
 * Commit this mapping locally only; server publish needs a paid Dev/Full seat.
 */
figma.connect(
  WordToken,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=1157-3132",
  {
    example: () => <WordToken word="ants" onActivate={() => {}} />,
  },
);
