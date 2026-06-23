"use client";

import { BookCard } from "@/components/book-card";
import type { SearchStory } from "../types";

/**
 * ResultsGrid — the story tiles for the active view. A grid of BookCards: 4
 * columns (desktop, gap 22) collapsing to 2 columns (mobile). Figma "Screen /
 * Search" node 132:193.
 *
 * A11y: a real list (`<ul>`/`<li>`) labelled by the section heading above it
 * (`aria-labelledby`), each tile a single link into the reader. The list is the
 * region the SectionHeader titles, so screen-reader users hear e.g. "Fables,
 * list, 4 items".
 */

export interface ResultsGridProps {
  /** Stories to show — already filtered to the active view by the screen. */
  stories: SearchStory[];
  /** Id of the heading that names this list (the SectionHeader). */
  labelledBy: string;
}

export function ResultsGrid({ stories, labelledBy }: ResultsGridProps) {
  return (
    <ul
      aria-labelledby={labelledBy}
      className="grid list-none p-0 m-0 justify-items-center gap-x-[22px] gap-y-xl [grid-template-columns:repeat(2,168px)] md:[grid-template-columns:repeat(4,168px)]"
    >
      {stories.map((story) => (
        <li key={story.id} className="flex">
          <BookCard
            book={{
              title: story.title,
              level: story.level,
              minutes: story.minutes,
              coverSrc: story.coverSrc,
            }}
            href={story.href}
          />
        </li>
      ))}
    </ul>
  );
}
