/**
 * Figma Code Connect mapping for StatTile → Figma node 151:28
 * (component set "Card", file sc9DIhX0wvFgrvmL8NVBf5, page "Components").
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency and this file is
 * compiled by the Figma `code-connect` CLI, not the app `tsc` build (excluded
 * in tsconfig.json). Add the devDependency + `figma.config.json` to publish.
 *
 * The Figma "Card" exposes a `tone` variant (Accent | Warning | Info | Success)
 * plus `number` and `label` text props, and an instance-swap icon. `tone` maps
 * 1:1 to our `tone` prop; `number`/`label` to `value`/`label`. The icon is an
 * instance swap with no string handle, so the example supplies a placeholder
 * glyph — the consumer passes the real icon.
 */
import figma from "@figma/code-connect";
import { StatTile } from "./StatTile";

figma.connect(
  StatTile,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=151-28",
  {
    props: {
      value: figma.string("number"),
      label: figma.string("label"),
      tone: figma.enum("tone", {
        Accent: "accent",
        Warning: "warning",
        Info: "info",
        Success: "success",
      }),
    },
    example: ({ value, label, tone }) => (
      <StatTile
        tone={tone}
        value={value}
        label={label}
        icon={<svg viewBox="0 0 24 24" aria-hidden="true" />}
      />
    ),
  },
);
