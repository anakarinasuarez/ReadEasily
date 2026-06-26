import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";

/**
 * Static WCAG AA contrast gate for the design tokens.
 *
 * Why this exists: jest-axe runs in jsdom, which applies NO CSS, so axe's
 * color-contrast rule is a no-op in our component tests — a tone that fails AA
 * still passes the a11y test (false green). This file resolves the actual token
 * hex values and checks the text/background pairs components really render, by
 * pure math, so a contrast regression fails CI.
 *
 * Light mode only (the verified theme). Dark-mode values are still [D]/unverified.
 */

const css = readFileSync(
  resolvePath(process.cwd(), "src/tokens/colors.css"),
  "utf8",
);

// Parse the first :root { ... } block (light mode) into a var map.
const rootBlock = css.slice(
  css.indexOf(":root"),
  css.indexOf("}", css.indexOf(":root")),
);
const vars: Record<string, string> = {};
for (const m of rootBlock.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
  vars[m[1]] = m[2].trim();
}

/** Resolve a token value, following up to 5 levels of var() indirection, to a #hex. */
function resolve(value: string): string {
  let cur = value;
  for (let i = 0; i < 5 && cur.startsWith("var("); i++) {
    const name = cur.slice(4, cur.indexOf(")")).trim();
    cur = (vars[name] ?? "").trim();
  }
  const hex = cur.match(/#[0-9a-fA-F]{6}/);
  if (!hex) throw new Error(`Could not resolve "${value}" to a hex color`);
  return hex[0];
}

function relativeLuminance(hex: string): number {
  const c = hex.replace("#", "");
  const channel = (i: number) => {
    const v = parseInt(c.substr(i, 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function contrast(textVar: string, bgVar: string): number {
  const L1 = relativeLuminance(resolve(vars[textVar]));
  const L2 = relativeLuminance(resolve(vars[bgVar]));
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

const AA_NORMAL = 4.5; // normal-size text (Badge label is 13px)

// [name, text token, background token] — the pairs we actually ship.
const badgeTonePairs: Array<[string, string, string]> = [
  ["selected", "--text-on-accent", "--bg-accent-strong"],
  ["info", "--feedback-info", "--feedback-info-subtle"],
  ["success", "--feedback-success", "--feedback-success-subtle"],
  ["warning", "--feedback-warning", "--feedback-warning-subtle"],
  ["danger", "--feedback-danger", "--feedback-danger-subtle"],
  ["accent", "--text-accent", "--bg-accent-subtle"],
  ["neutral", "--text-accent", "--bg-elevated"],
];

const generalPairs: Array<[string, string, string]> = [
  ["body text on canvas", "--text-primary", "--bg-canvas"],
  ["secondary text on canvas", "--text-secondary", "--bg-canvas"],
  ["muted text on canvas", "--text-muted", "--bg-canvas"],
  ["primary button label", "--text-on-accent", "--bg-accent-strong"],
  // Saved "practice sets" numeral renders on the elevated card surface, NOT on
  // warning-subtle — guard the AA-safe warning token there (raw #e0a838 fails).
  ["warning numeral on elevated", "--feedback-warning", "--bg-elevated"],
  // NOTE: the auth marketing panel is intentionally NOT gated here. Per the product
  // decision it is LITERAL Figma — small off-white copy on bright --bg-accent (#d66c44)
  // that fails AA 4.5:1 by design. It is decorative marketing (only the large headline
  // needs 3:1, which it clears); the form card stays AA-compliant. The retired
  // --bg-accent-panel surface-darkening pair was removed with that decision.
];

describe("token contrast (WCAG AA, light mode)", () => {
  it.each(badgeTonePairs)(
    "Badge %s text meets AA on its background",
    (_name, text, bg) => {
      expect(contrast(text, bg)).toBeGreaterThanOrEqual(AA_NORMAL);
    },
  );

  it.each(generalPairs)("%s meets AA", (_name, text, bg) => {
    expect(contrast(text, bg)).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});
