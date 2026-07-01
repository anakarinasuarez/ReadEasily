/**
 * Figma Code Connect mapping for SettingsRow → Figma node 159:235
 * (component set "Settings Row" 158:62, file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * NOTE: `@figma/code-connect` (^1.4.8) + `figma.config.json` are now in place, so
 * this file is parsed and published by the Figma `code-connect` CLI
 * (`npm run figma:parse` / `figma:publish`), not the app `tsc` build (still
 * excluded in tsconfig.json). Publishing needs FIGMA_ACCESS_TOKEN + a paid seat.
 *
 * Variant-model reconciliation (important):
 *   Figma's `variant` property is the SETTING TYPE — it bundles a control
 *   archetype with a color theme:
 *     Translation   → segmented (info blue)   ┐ segmented control:
 *     ReadingAccent → segmented (terracotta)  ┘ no primitive yet → `custom`
 *     Autoplay      → toggle (success green)   ┐
 *     Pronounce     → toggle (warning gold)    ├ map to `variant="toggle"`
 *     Motion        → toggle (plum)            ┘ (plum has no token — see report)
 *   Our React API splits that into `variant` (control type) + `iconTone`
 *   (tile color), so this mapping translates the Figma enum into BOTH.
 */
import figma from "@figma/code-connect";
import { SettingsRow } from "./SettingsRow";

figma.connect(
  SettingsRow,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=159-235",
  {
    props: {
      label: figma.string("Setting title"),
      description: figma.string("Setting description"),
      iconTone: figma.enum("variant", {
        Translation: "info",
        ReadingAccent: "accent",
        Autoplay: "success",
        Pronounce: "warning",
        Motion: "plum",
      }),
    },
    // The Figma canonical node is the Translation (segmented) row; its trailing
    // control has no primitive yet, so the example shows the `custom` slot.
    example: ({ label, description, iconTone }) => (
      <SettingsRow
        variant="custom"
        iconTone={iconTone}
        label={label}
        description={description}
        control={<span>ES · FR · PT</span>}
      />
    ),
  },
);
