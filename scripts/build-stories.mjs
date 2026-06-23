/**
 * build-stories — embeds the story Markdown corpus into a TypeScript module.
 *
 * WHY: the Reader's MSW handler + content loader run under three bundlers/runtimes
 * (Vitest/Vite, Next/Turbopack, and the MSW browser worker). No single raw-text
 * import (`*.md?raw`, `asset/source`, …) is honored by all of them — Turbopack
 * rejects `?raw` outright. Embedding the raw strings in a generated `.ts` module
 * is the one form every bundler imports natively, with zero config and zero deps.
 *
 * The `.md` files stay the human-authored source of truth; this script just
 * snapshots them into `corpus.generated.ts`. Re-run after editing any story:
 *   npm run stories:build
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const storiesDir = join(here, "..", "src", "content", "stories");
const outFile = join(
  here,
  "..",
  "src",
  "features",
  "reader",
  "content",
  "corpus.generated.ts",
);

const files = readdirSync(storiesDir)
  .filter((f) => f.endsWith(".md"))
  .sort();

const entries = files.map((file) => {
  const id = basename(file, ".md");
  const raw = readFileSync(join(storiesDir, file), "utf8");
  return `  ${JSON.stringify(id)}: ${JSON.stringify(raw)},`;
});

const out = `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Snapshot of src/content/stories/*.md, embedded as strings so the Reader's
 * content loader can run under every bundler/runtime (Vite, Turbopack, the MSW
 * browser worker, node). Regenerate after editing any story: npm run stories:build
 */
export const STORY_MARKDOWN: Record<string, string> = {
${entries.join("\n")}
};
`;

writeFileSync(outFile, out, "utf8");
console.log(`build-stories: wrote ${files.length} stories → ${outFile}`);
