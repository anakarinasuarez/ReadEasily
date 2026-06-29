import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG, STORY_IDS, getCatalogEntry } from "./catalog";

const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

describe("story catalog", () => {
  it("derives one well-formed entry per story", () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(10);
    for (const e of CATALOG) {
      expect(e.id).toMatch(/^[a-z0-9-]+$/);
      expect(e.title.length).toBeGreaterThan(0);
      expect(LEVELS.has(e.level)).toBe(true);
      expect(e.category.length).toBeGreaterThan(0);
      expect(e.words).toBeGreaterThan(0);
    }
  });

  it("has a real, unique teaser for every story (no title fallback)", () => {
    const teasers = new Set<string>();
    for (const e of CATALOG) {
      expect(e.teaser.length).toBeGreaterThan(20);
      expect(e.teaser).not.toBe(e.title); // not the fallback
      teasers.add(e.teaser);
    }
    expect(teasers.size).toBe(CATALOG.length);
  });

  it("points every cover at a file that exists under /public", () => {
    for (const e of CATALOG) {
      expect(e.coverSrc).toMatch(/^\/covers\/.+\.webp$/);
      const onDisk = join(process.cwd(), "public", e.coverSrc);
      expect(existsSync(onDisk), `missing cover for ${e.id}: ${e.coverSrc}`).toBe(
        true,
      );
    }
  });

  it("exposes a consistent id list + lookup", () => {
    expect(new Set(STORY_IDS).size).toBe(STORY_IDS.length); // unique
    for (const id of STORY_IDS) {
      expect(getCatalogEntry(id)?.id).toBe(id);
    }
    expect(getCatalogEntry("does-not-exist")).toBeUndefined();
  });
});
