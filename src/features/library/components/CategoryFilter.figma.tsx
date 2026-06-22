/**
 * Figma Code Connect mapping for CategoryFilter → Figma node 1272:4613
 * (the Library category chip row, file sc9DIhX0wvFgrvmL8NVBf5, page "Screens").
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency and these files
 * are compiled by the Figma `code-connect` CLI, not the app `tsc` build (they
 * are excluded in tsconfig.json). Add the devDependency + `figma.config.json`
 * to publish this mapping.
 *
 * The Figma row is a set of Chip instances with one in its Selected state. In
 * code that is a single-select control: the `categories` array + the active
 * `value` (a category id) + an `onValueChange` callback. The mapping shows the
 * canonical wiring with the "All" sentinel selected.
 */
import figma from "@figma/code-connect";
import { CategoryFilter } from "./CategoryFilter";

figma.connect(
  CategoryFilter,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=1272-4613",
  {
    example: () => (
      <CategoryFilter
        value="all"
        onValueChange={(value) => {
          // LibraryScreen owns this — it filters the visible rails in place.
          void value;
        }}
        categories={[
          { id: "all", label: "All" },
          { id: "fables", label: "Fables" },
          { id: "daily-life", label: "Daily Life" },
          { id: "technology", label: "Technology" },
          { id: "travel", label: "Travel" },
        ]}
      />
    ),
  },
);
