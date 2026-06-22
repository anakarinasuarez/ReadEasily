/**
 * Figma Code Connect mapping for FeaturedHero → Figma node 1272:4575
 * (the Library "Featured" hero, file sc9DIhX0wvFgrvmL8NVBf5, page "Screens").
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency and these files
 * are compiled by the Figma `code-connect` CLI, not the app `tsc` build (they
 * are excluded in tsconfig.json). Add the devDependency + `figma.config.json`
 * to publish this mapping.
 *
 * The Figma hero is an interactive composition (cover fan + per-story eyebrow +
 * optional editor's-pick badge + title + teaser + meta row + CTA). In code those
 * collapse into one data-driven component: the `featured` array drives the fan,
 * and the centered story's fields populate the copy block + CTA. The mapping
 * shows the canonical wiring with a representative featured fan.
 */
import figma from "@figma/code-connect";
import { FeaturedHero } from "./FeaturedHero";

figma.connect(
  FeaturedHero,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=1272-4575",
  {
    example: () => (
      <FeaturedHero
        featured={[
          {
            id: "the-tortoise-and-the-hare",
            title: "The Tortoise and the Hare",
            level: "A1",
            levelLabel: "Beginner",
            minutes: 5,
            words: 240,
            coverSrc: "/covers/The-tortoise-and-the-hare.webp",
            category: "fables",
            href: "/read/the-tortoise-and-the-hare",
            eyebrow: "Featured Fable",
            teaser:
              "The hare laughs at the slow tortoise — until a steady pace turns a sure win into a famous lesson.",
          },
          {
            id: "the-ant-and-the-grasshopper",
            title: "The Ant and the Grasshopper",
            level: "A2",
            levelLabel: "Elementary",
            minutes: 6,
            words: 312,
            coverSrc: "/covers/the-ant-grasshopper.webp",
            category: "fables",
            href: "/read/the-ant-and-the-grasshopper",
            eyebrow: "Featured Fable",
            badgeLabel: "Editor's pick",
            teaser:
              "All summer long the grasshopper sings while the ants store grain. When winter comes, only one of them is ready.",
          },
        ]}
      />
    ),
  },
);
