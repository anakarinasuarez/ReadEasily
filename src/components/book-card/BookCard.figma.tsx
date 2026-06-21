/**
 * Figma Code Connect mapping for BookCard → Figma node 267:24
 * (file sc9DIhX0wvFgrvmL8NVBf5, page "Components").
 *
 * NOTE: `@figma/code-connect` is not yet a project dependency and these files
 * are compiled by the Figma `code-connect` CLI, not the app `tsc` build (they
 * are excluded in tsconfig.json). Add the devDependency + `figma.config.json`
 * to publish this mapping.
 *
 * The Figma "Book Card" exposes a `state` variant (Default | Hover) plus the
 * `title`, `level` and `duration` text props. Hover is a CSS-only state in
 * code (the scrim + play FAB reveal on `:hover`/`:focus-within`), so it is not
 * a code prop — the mapping folds the text props into the `book` object the
 * primitive actually takes.
 */
import figma from "@figma/code-connect";
import { BookCard } from "./BookCard";

figma.connect(
  BookCard,
  "https://www.figma.com/design/sc9DIhX0wvFgrvmL8NVBf5/ReadEasily?node-id=267-24",
  {
    props: {
      title: figma.string("title"),
      level: figma.string("level"),
      duration: figma.string("duration"),
    },
    example: ({ title, level, duration }) => (
      <BookCard
        href="#"
        book={{
          title,
          level,
          // `duration` arrives as e.g. "6 min"; the primitive takes minutes.
          minutes: Number.parseInt(duration, 10),
          coverSrc: "/covers/placeholder.png",
        }}
      />
    ),
  },
);
