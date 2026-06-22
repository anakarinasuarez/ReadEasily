// Code Connect mapping for the Figma SearchField (node 132:158, desktop;
// 861:1050 is the mobile instance of the same component).
// `@figma/code-connect` is added in a later phase; these `*.figma.tsx` files are
// excluded from `tsc` (see tsconfig "exclude") and compile under the
// `figma connect` CLI instead. Committed locally only — publish needs a paid
// Dev/Full Figma seat (see the read-figma skill), so we do NOT push to a server.
import figma from "@figma/code-connect";
import { SearchField } from "./SearchField";

/**
 * Code Connect mapping — Figma "SearchField" (node 132:158).
 *
 * Figma ships only the idle frame: a static placeholder string, no variant
 * properties. In code the field is a controlled primitive, so `value` /
 * `onValueChange` have no Figma counterpart and are wired by the example. The
 * placeholder maps to the design's literal copy.
 */
figma.connect(
  SearchField,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/?node-id=132-158",
  {
    props: {
      placeholder: figma.string("placeholder"),
    },
    example: ({ placeholder }) => (
      <SearchField
        value=""
        onValueChange={() => {}}
        placeholder={placeholder}
        aria-label="Search stories"
      />
    ),
  },
);
