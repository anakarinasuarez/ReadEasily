/**
 * Figma Code Connect mapping for SettingsRow → Figma node 159:235
 * (component set "Settings Row" 158:62, file sc9DIhX0wvFgrvmL8NVBf5).
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency and this file is
 * compiled by the Figma `code-connect` CLI, not the app `tsc` build (excluded
 * in tsconfig.json). Add the devDependency + `figma.config.json` to publish.
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
        Motion: "accent",
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
