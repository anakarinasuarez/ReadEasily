import figma from "@figma/code-connect";
import { Toggle } from "./Toggle";

/**
 * Code Connect mapping for the Figma Toggle component set (node 19:18).
 *
 * Figma variant model:
 *   Size  -> SM | MD
 *   State -> Off | On | Disabled-Off | Disabled-On
 *
 * The single Figma `State` enum collapses two independent React concerns —
 * checked and disabled — so we derive both `checked` and `disabled` from it.
 */
figma.connect(
  Toggle,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/?node-id=19-18",
  {
    props: {
      size: figma.enum("Size", {
        SM: "sm",
        MD: "md",
      }),
      checked: figma.enum("State", {
        Off: false,
        On: true,
        "Disabled-Off": false,
        "Disabled-On": true,
      }),
      disabled: figma.enum("State", {
        Off: false,
        On: false,
        "Disabled-Off": true,
        "Disabled-On": true,
      }),
    },
    example: ({ size, checked, disabled }) => (
      <Toggle
        size={size}
        checked={checked}
        disabled={disabled}
        label="Setting"
      />
    ),
  },
);
