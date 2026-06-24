import figma from "@figma/code-connect";
import { SegmentedControl } from "./SegmentedControl";

/**
 * Code Connect mapping for the SegmentedControl (Figma node 158:11, file
 * sc9DIhX0wvFgrvmL8NVBf5) — the single-select pill group inside the Profile
 * "Translation language" / "Reading accent" settings rows. Its mobile-wrapped
 * form is node 1434:4293 (same geometry, dropped to a full-width second row).
 *
 * The Figma node is a plain frame of pill segments, not a variant component, so
 * there are no Figma properties to bind. The example shows the canonical
 * info-tone Translation control; swap `tone="accent"` + the US/UK/AU/CA options
 * for the Reading-accent row.
 */
figma.connect(
  SegmentedControl,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=158-11",
  {
    example: () => (
      <SegmentedControl
        tone="info"
        aria-label="Translation language"
        options={[
          { value: "ES", label: "ES" },
          { value: "FR", label: "FR" },
          { value: "PT", label: "PT" },
        ]}
        value="ES"
        onChange={() => {}}
      />
    ),
  },
);
