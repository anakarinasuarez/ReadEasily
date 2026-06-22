"use client";

import { BookCard } from "@/components/book-card";
import type { CatalogSection } from "../types";

/**
 * CategoryRail — one labelled shelf of books (Figma node 1272:4590): an accent
 * marker bar + title + subtitle header, then a left-aligned horizontal row of
 * BookCards. The row scrolls horizontally on narrow viewports while each card
 * keeps its 168px footprint (variant rule, not a rebuild).
 *
 * The rail is a `<section>` titled by its heading so the catalog reads as a set
 * of named regions to assistive tech.
 */
export function CategoryRail({ section }: { section: CatalogSection }) {
  const headingId = `rail-${section.id}`;

  return (
    <section aria-labelledby={headingId} className="flex w-full flex-col gap-md">
      <header className="flex items-stretch gap-md">
        {/* Accent marker — 5px solid bar spanning the full two-line header
            height (radius-sm), decorative. Its color is the section's own accent
            (Figma-measured per shelf: Continue → brand, Fables → green, etc.).
            `items-stretch` lets it match the title+subtitle block rather than a
            fixed stub. */}
        <span
          aria-hidden="true"
          className={`w-[5px] shrink-0 self-stretch rounded-sm ${section.accent}`}
        />
        <div className="flex flex-col gap-[2px]">
          <h2
            id={headingId}
            className="font-display font-extrabold text-primary [font-size:var(--text-heading-h3-size)] [line-height:var(--text-heading-h3-line-height)]"
          >
            {section.title}
          </h2>
          <p className="font-ui text-muted [font-size:var(--text-ui-m-size)] [line-height:var(--text-ui-m-line-height)]">
            {section.subtitle}
          </p>
        </div>
      </header>

      <div className="flex gap-xl overflow-x-auto pb-sm">
        {section.books.map((book) => (
          <div key={book.id} className="shrink-0">
            <BookCard
              book={{
                title: book.title,
                level: book.level,
                minutes: book.minutes,
                coverSrc: book.coverSrc,
              }}
              href={book.href}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * RailDivider — the decorative rule · dot · rule separator between rails
 * (Figma node 1272:4589). Purely visual, hidden from AT (the rails' own
 * headings already structure the catalog).
 */
export function RailDivider() {
  return (
    <div aria-hidden="true" className="flex items-center gap-md py-sm">
      <span className="h-[2px] flex-1 bg-border-default" />
      <span className="size-[8px] rounded-pill bg-border-default" />
      <span className="h-[2px] flex-1 bg-border-default" />
    </div>
  );
}
