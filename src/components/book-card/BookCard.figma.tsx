/**
 * Figma Code Connect mapping for BookCard → Figma node 267:24
 * (file sc9DIhX0wvFgrvmL8NVBf5, page "Components").
 *
 * NOTE: `@figma/code-connect` (^1.4.8) is now installed and `figma.config.json`
 * is at the repo root, so these files are parsed and published by the Figma
 * `code-connect` CLI (`npm run figma:parse` / `figma:publish`), not the app
 * `tsc` build (they stay excluded in tsconfig.json). Publishing needs
 * FIGMA_ACCESS_TOKEN + a paid seat.
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
          coverSrc: "/covers/the-ant-grasshopper.webp",
        }}
      />
    ),
  },
);
