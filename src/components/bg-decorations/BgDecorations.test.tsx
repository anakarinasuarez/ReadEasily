import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { BgDecorations } from "./BgDecorations";

describe("BgDecorations — decorative contract", () => {
  it("is hidden from the accessibility tree", () => {
    const { container } = render(<BgDecorations data-testid="bg" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
  });

  it("does not intercept pointer events", () => {
    const { container } = render(<BgDecorations />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("pointer-events-none");
  });

  it("sits behind content (negative z-index) and is absolute by default", () => {
    const { container } = render(<BgDecorations />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("-z-10");
    expect(root.className).toContain("absolute");
  });

  it("can be pinned to the viewport with `fixed`", () => {
    const { container } = render(<BgDecorations fixed />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("fixed");
    expect(root.className).not.toContain("absolute");
  });

  it("contains no focusable elements (never traps the keyboard)", () => {
    const { container } = render(<BgDecorations />);
    expect(
      container.querySelectorAll(
        "a, button, input, select, textarea, [tabindex]",
      ),
    ).toHaveLength(0);
  });

  it("forwards extra class names", () => {
    const { container } = render(<BgDecorations className="custom-bg" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("custom-bg");
  });
});

describe("BgDecorations — a11y (jest-axe)", () => {
  it("has no violations behind sample content", async () => {
    const { container } = render(
      <div style={{ position: "relative" }}>
        <BgDecorations />
        <main>
          <h1>Sample heading</h1>
          <p>Some content sits above the decorations.</p>
        </main>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
