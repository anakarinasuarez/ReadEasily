/**
 * Figma Code Connect mapping for Badge → Figma node 17:42
 * (file sc9DIhX0wvFgrvmL8NVBf5, page "Components").
 *
 * NOTE: `@figma/code-connect` (^1.4.8) + `figma.config.json` are now set up, so
 * these files are parsed and published by the Figma `code-connect` CLI
 * (`npm run figma:parse` / `figma:publish`), not the app `tsc` build (they stay
 * excluded in tsconfig.json); publishing needs FIGMA_ACCESS_TOKEN + a paid seat.
 * The variant → prop model below mirrors node 17:42:
 *   size: SM | MD            -> "sm" | "md"
 *   tone: Neutral … Selected -> "neutral" … "selected"
 *   the "Label" text         -> children
 */
import figma from "@figma/code-connect";
import { Badge } from "./Badge";

figma.connect(
  Badge,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=17-42",
  {
    props: {
      size: figma.enum("size", { SM: "sm", MD: "md" }),
      tone: figma.enum("tone", {
        Neutral: "neutral",
        Accent: "accent",
        Success: "success",
        Warning: "warning",
        Danger: "danger",
        Info: "info",
        Selected: "selected",
      }),
      label: figma.string("Label"),
    },
    example: ({ size, tone, label }) => (
      <Badge tone={tone} size={size}>
        {label}
      </Badge>
    ),
  },
);
