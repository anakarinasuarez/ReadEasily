/**
 * Figma Code Connect mapping for the Button primitive.
 * Source component: ReadEasily / Components / Button — node 14:56
 * (file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * This file is consumed by the Figma Code Connect CLI (`@figma/code-connect`),
 * not by the Next.js app build. It is excluded from `tsc`/`eslint` until the
 * Code Connect toolchain is installed in the repo.
 *
 * Variant model mapping (Figma property -> code prop):
 *   Variant   Primary | Secondary | Ghost  -> variant
 *   Size      SM | MD | LG                  -> size
 *   State     Default | Hover | Disabled    -> CSS states; only Disabled is a prop
 *   hasLeftIcon / hasRightIcon (bool)        -> leftIcon / rightIcon
 *   label (text)                             -> children
 */
import figma from "@figma/code-connect";
import { Button } from "./Button";

figma.connect(
  Button,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5?node-id=14-56",
  {
    props: {
      variant: figma.enum("Variant", {
        Primary: "primary",
        Secondary: "secondary",
        Ghost: "ghost",
      }),
      size: figma.enum("Size", {
        SM: "sm",
        MD: "md",
        LG: "lg",
      }),
      // Hover is a CSS state; only Disabled surfaces as a prop.
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      leftIcon: figma.boolean("hasLeftIcon", {
        true: figma.instance("btn-leftIcon"),
        false: undefined,
      }),
      rightIcon: figma.boolean("hasRightIcon", {
        true: figma.instance("btn-icon"),
        false: undefined,
      }),
      label: figma.string("label"),
    },
    example: ({ variant, size, disabled, leftIcon, rightIcon, label }) => (
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
      >
        {label}
      </Button>
    ),
  },
);
