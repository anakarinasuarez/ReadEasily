/**
 * Figma Code Connect mapping for CategoryCard → the Figma "Category Card"
 * component SET (file sc9DIhX0wvFgrvmL8NVBf5, page "Components").
 *
 * The set exposes two variant properties:
 *   - `category`  (Fables | Daily Life | Technology | Travel)
 *   - `selected`  (False | True)
 * plus the editable `label` and `count` text layers.
 *
 * We map the Figma `category` enum to our data-id union, `selected` to the
 * boolean prop, and fold the count text into `storyCount`. `href` has no Figma
 * counterpart (navigation lives in the prototype), so the example supplies a
 * placeholder.
 *
 * NOTE: `@figma/code-connect` (^1.4.8) + `figma.config.json` are now in place, so
 * these files are parsed and published by the Figma `code-connect` CLI
 * (`npm run figma:parse` / `figma:publish`), not the app `tsc` build (they stay
 * excluded in tsconfig.json). Per the read-figma skill, server-publish needs
 * FIGMA_ACCESS_TOKEN + a paid Dev/Full seat — `figma:parse` validates it locally.
 */
import figma from "@figma/code-connect";
import { CategoryCard } from "./CategoryCard";

figma.connect(
  CategoryCard,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=1260-3510",
  {
    props: {
      category: figma.enum("category", {
        Fables: "fables",
        "Daily Life": "daily-life",
        Technology: "technology",
        Travel: "travel",
      }),
      selected: figma.enum("selected", { True: true, False: false }),
      label: figma.string("label"),
      count: figma.string("count"),
    },
    example: ({ category, selected, label, count }) => (
      <CategoryCard
        category={category}
        label={label}
        // `count` arrives as e.g. "4 stories"; the primitive takes the number.
        storyCount={Number.parseInt(count, 10)}
        selected={selected}
        href={`/search?category=${category}`}
      />
    ),
  },
);
