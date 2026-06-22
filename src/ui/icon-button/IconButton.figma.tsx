/**
 * Figma Code Connect mapping for the IconButton primitive.
 *
 * NOTE (assumption): the Figma Components page has no dedicated IconButton
 * component set — the Button set (node 14:56) is label-first and exposes no
 * icon-only variant. This new primitive was specced by the design-lead to back
 * the Navbar mobile actions and the Modal close affordance. Until a dedicated
 * Figma component exists, we map to the closest existing node (Button 14:56) so
 * the codebase still surfaces in Dev Mode; the `variant`/`size` axes below are
 * the IconButton's own model, not Button's. Re-point `node-id` when an
 * IconButton component is added in Figma.
 *
 * This file is consumed by the Figma Code Connect CLI (`@figma/code-connect`),
 * not by the Next.js app build. It is excluded from `tsc`/`eslint` until the
 * Code Connect toolchain is installed in the repo.
 */
import figma from "@figma/code-connect";
import { IconButton } from "./IconButton";

figma.connect(
  IconButton,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5?node-id=14-56",
  {
    props: {
      variant: figma.enum("Variant", {
        Subtle: "subtle",
        Ghost: "ghost",
        Accent: "accent",
        // accent-subtle tint — Saved word-card listen button (1134:2641)
        "Accent Subtle": "accentSubtle",
      }),
      size: figma.enum("Size", {
        SM: "sm",
        // 36px — Saved word-card action buttons (1134:2638)
        Card: "card",
        MD: "md",
      }),
      // Hover is a CSS state; only Disabled surfaces as a prop.
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      icon: figma.instance("icon"),
    },
    example: ({ variant, size, disabled, icon }) => (
      <IconButton
        variant={variant}
        size={size}
        disabled={disabled}
        icon={icon}
        aria-label="Action"
      />
    ),
  },
);
