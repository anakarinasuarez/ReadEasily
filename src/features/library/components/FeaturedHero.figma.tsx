/**
 * Figma Code Connect mapping for FeaturedHero → Figma node 1272:4575
 * (the Library "Featured" hero, file sc9DIhX0wvFgrvmL8NVBf5, page "Screens").
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency and these files
 * are compiled by the Figma `code-connect` CLI, not the app `tsc` build (they
 * are excluded in tsconfig.json). Add the devDependency + `figma.config.json`
 * to publish this mapping.
 *
 * The Figma hero is a static composition (cover fan + eyebrow + editor's-pick
 * badge + title + teaser + meta row + CTA). In code those collapse into one
 * data-driven component: every text/marketing value is a field on the
 * `featured` book, and the fan is the decorative BookShowcase. The mapping
 * shows the canonical wiring with a representative featured story.
 */
import figma from "@figma/code-connect";
import { FeaturedHero } from "./FeaturedHero";

figma.connect(
  FeaturedHero,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=1272-4575",
  {
    example: () => (
      <FeaturedHero
        featured={{
          id: "the-ant-and-the-grasshopper",
          title: "The Ant and the Grasshopper",
          level: "A2",
          levelLabel: "Elementary",
          minutes: 6,
          words: 312,
          coverSrc: "/covers/ant-grasshopper.svg",
          category: "fables",
          href: "/read/the-ant-and-the-grasshopper",
          teaser:
            "All summer long the grasshopper sings while the ants store grain. When winter comes, only one of them is ready.",
          badgeLabel: "Editor's pick",
          showcaseCovers: [
            "/covers/ant-grasshopper.svg",
            "/covers/tortoise-hare.svg",
            "/covers/lion-mouse.svg",
            "/covers/fox-grapes.svg",
            "/covers/crying-wolf.svg",
            "/covers/lighthouse.svg",
            "/covers/market.svg",
          ],
        }}
      />
    ),
  },
);
