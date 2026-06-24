import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../../../tests/mocks/server";
import { getLibrary } from "./getLibrary";

/**
 * Contract test for the Library data seam. MSW (wired in tests/setup.ts) serves
 * the same `/api/library` handler dev and e2e use, so this asserts the real
 * mocked payload, not a bespoke fixture.
 */
describe("getLibrary", () => {
  it("returns a typed LibraryData payload from /api/library", async () => {
    const data = await getLibrary();

    // Featured fan — an ordered array of distinct stories; the centre (middle
    // index, where BookShowcase opens) is "The Ant and the Grasshopper".
    expect(data.featured).toHaveLength(7);
    const centre = data.featured[Math.floor(data.featured.length / 2)];
    expect(centre.title).toBe("The Ant and the Grasshopper");
    expect(centre.level).toBe("A2");
    // Every featured story routes to /read/${id} and carries a per-story eyebrow.
    for (const story of data.featured) {
      expect(story.href).toBe(`/read/${story.id}`);
      expect(story.eyebrow).toBeTruthy();
    }
    // Only the centre is an editor's pick (badge is optional).
    expect(centre.badgeLabel).toBeTruthy();

    // Categories always lead with the `all` sentinel chip.
    expect(data.categories[0]).toEqual({ id: "all", label: "All" });

    // A `continue` section, when present, sorts first.
    expect(data.sections[0].id).toBe("continue");

    // Every section names a solid accent utility; every CARD now routes to
    // Story Detail (/story/${id}) — the card's "Read & Listen" CTA is the hop on
    // to the reader. (The featured HERO above keeps its direct /read CTA.)
    for (const section of data.sections) {
      expect(section.accent).toBeTruthy();
    }
    const books = data.sections.flatMap((s) => s.books);
    expect(books.length).toBeGreaterThan(0);
    for (const book of books) {
      expect(book.href).toBe(`/story/${book.id}`);
    }
  });

  it("throws on a non-2xx response so the query surfaces the error", async () => {
    server.use(
      http.get("/api/library", () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );

    await expect(getLibrary()).rejects.toThrow(/getLibrary failed: 500/);
  });
});
