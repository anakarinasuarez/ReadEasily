import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { createRef } from "react";
import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { StatPill, type StatPillTone } from "./StatPill";

describe("StatPill — content", () => {
  it("renders the value and a 2-line label as plain text", () => {
    render(<StatPill value={8} label="words to review" />);
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("words to review")).toBeInTheDocument();
  });
});

describe("StatPill — non-interactive (reads as text, skipped in tab order)", () => {
  it("exposes no interactive role", () => {
    render(<StatPill value={2} label="practice sets" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("has no focusable element (skipped in tab order)", () => {
    const { container } = render(<StatPill value={2} label="practice sets" />);
    expect(container.querySelector("[tabindex]")).toBeNull();
    expect(container.querySelector("a, button, input, select, textarea")).toBeNull();
  });
});

describe("StatPill — API", () => {
  it("forwards the ref to the underlying div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<StatPill ref={ref} value={1} label="x" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("spreads rest props onto the root", () => {
    const onClick = vi.fn();
    render(<StatPill value={1} label="x" data-testid="pill" onClick={onClick} />);
    screen.getByTestId("pill").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("StatPill — numeral tone colour", () => {
  it.each<[StatPillTone, string]>([
    ["accent", "text-accent-text"],
    ["warning", "text-warning"],
    ["info", "text-info"],
    ["success", "text-success"],
  ])("%s tone maps the numeral to the %s token utility", (tone, util) => {
    render(<StatPill tone={tone} value={5} label="x" />);
    expect(screen.getByText("5").className).toContain(util);
  });

  /**
   * AA REGRESSION GUARD. The Figma "practice sets" numeral is raw amber #e0a838,
   * which fails AA. The warning numeral MUST use the AA-safe --feedback-warning
   * token (text-warning), and must NEVER emit the decorative solid amber.
   */
  it("warning numeral uses the AA-safe token, NOT raw/solid amber", () => {
    render(<StatPill tone="warning" value={2} label="practice sets" />);
    const numeral = screen.getByText("2");
    expect(numeral.className).toContain("text-warning");
    expect(numeral.className).not.toContain("warning-solid");
    expect(numeral.className).not.toContain("amber");
    // and never an inline raw-amber colour
    expect(numeral.getAttribute("style") ?? "").not.toMatch(/e0a838/i);
  });
});

/* ---------------------------------------------------------------------------
 * Static contrast assertion (jsdom applies no CSS, so axe's contrast rule is a
 * no-op here). We resolve the real token hex and verify the warning numeral
 * clears AA on the elevated pill surface — proving the AA-safe token, not raw
 * amber, is what the component points at.
 * ------------------------------------------------------------------------- */
function resolveTokenHex(name: string): string {
  const css = readFileSync(resolvePath(process.cwd(), "src/tokens/colors.css"), "utf8");
  const root = css.slice(css.indexOf(":root"), css.indexOf("}", css.indexOf(":root")));
  const vars: Record<string, string> = {};
  for (const m of root.matchAll(/(--[\w-]+):\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  let cur = vars[name] ?? "";
  for (let i = 0; i < 5 && cur.startsWith("var("); i++) {
    cur = (vars[cur.slice(4, cur.indexOf(")")).trim()] ?? "").trim();
  }
  const hex = cur.match(/#[0-9a-fA-F]{6}/);
  if (!hex) throw new Error(`cannot resolve ${name}`);
  return hex[0];
}

function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const ch = (i: number) => {
    const v = parseInt(c.substr(i, 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("StatPill — AA contrast of the numeral on the pill surface", () => {
  it("warning numeral (--feedback-warning) is the AA-safe value, not raw amber", () => {
    const warning = resolveTokenHex("--feedback-warning");
    expect(warning.toLowerCase()).toBe("#8a5a14");
    expect(warning.toLowerCase()).not.toBe("#e0a838");
  });

  it.each(["--feedback-warning", "--text-accent", "--feedback-info", "--feedback-success"])(
    "%s numeral clears AA (4.5:1) on bg-elevated",
    (token) => {
      const surface = resolveTokenHex("--bg-elevated");
      expect(ratio(resolveTokenHex(token), surface)).toBeGreaterThanOrEqual(4.5);
    },
  );
});

describe("StatPill — a11y (jest-axe)", () => {
  it.each<StatPillTone>(["accent", "warning", "info", "success"])(
    "%s tone has no violations",
    async (tone) => {
      const { container } = render(<StatPill tone={tone} value={9} label="words to review" />);
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
