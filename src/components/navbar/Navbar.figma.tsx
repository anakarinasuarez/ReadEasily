/**
 * Figma Code Connect mapping for the Navbar composite (node 81:102).
 *
 * The Figma component models the active item as an `active` enum
 * (Library | Search | Saved | None) and exposes `badgeCount` / `showBadge` /
 * `platform`. In code those map onto: `activeKey` (string), an item's `badge`
 * field, and the responsive variant (CSS, not a prop). `items` and `user` are
 * data inputs with no Figma counterpart, so the example seeds representative
 * values. `platform` is intentionally NOT surfaced as a prop — mobile is a
 * responsive variant, not a separate build.
 *
 * Consumed by the Figma Code Connect CLI (`@figma/code-connect`), not the
 * Next.js build; excluded from `tsc`/`eslint` via the `**/*.figma.tsx` rule
 * until the Code Connect toolchain is installed.
 */
import figma from "@figma/code-connect";
import { Navbar } from "./Navbar";

figma.connect(
  Navbar,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5?node-id=81-102",
  {
    props: {
      activeKey: figma.enum("active", {
        Library: "library",
        Search: "search",
        Saved: "saved",
        None: undefined,
      }),
    },
    example: ({ activeKey }) => (
      <Navbar
        activeKey={activeKey}
        user={{ name: "Karina Aguilar" }}
        items={[
          { key: "library", label: "Library", icon: <span />, href: "/library" },
          { key: "search", label: "Search", icon: <span />, href: "/search" },
          { key: "saved", label: "Saved", icon: <span />, href: "/saved" },
        ]}
      />
    ),
  },
);
