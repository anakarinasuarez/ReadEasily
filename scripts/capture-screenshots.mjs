// One-off: capture app screenshots for the README against a running dev server
// (`npm run dev` on :3000, MSW-mocked). Saves crisp 2x PNGs to docs/screenshots/.
//   node scripts/capture-screenshots.mjs
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const shots = [
  { name: "home", path: "/" },
  { name: "library", path: "/library" },
  { name: "story", path: "/story/the-clever-crow" },
  { name: "reader", path: "/read/the-clever-crow" },
  { name: "saved", path: "/saved" },
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 820 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce", // pause the auto-rotating hero so shots are stable
});

for (const { name, path } of shots) {
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60_000 });
  // Let fonts settle + lazy cover images decode.
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1500);
  // Nudge lazy images that only load on scroll, then return to top.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`✓ ${name} → ${OUT}/${name}.png`);
}

await browser.close();
console.log("done");
