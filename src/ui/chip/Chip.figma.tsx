import figma from "@figma/code-connect";
import { Chip } from "./Chip";

/**
 * Code Connect mapping for the Chip component set (Figma node 808:14,
 * file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * Figma variant model → code props:
 *   - `Selected` (boolean)  → `selected`
 *   - `State` = Disabled    → `disabled` (Hover/Default are CSS states, not props)
 *   - `Label` (text)        → children
 */
figma.connect(
  Chip,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=808-14",
  {
    props: {
      label: figma.string("Label"),
      selected: figma.boolean("Selected"),
      disabled: figma.enum("State", { Disabled: true }),
    },
    example: ({ label, selected, disabled }) => (
      <Chip selected={selected} disabled={disabled}>
        {label}
      </Chip>
    ),
  },
);
