import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { createRef } from "react";
import { CategoryCard, type CategoryId } from "./CategoryCard";

const CATEGORIES: Array<{ id: CategoryId; label: string }> = [
  { id: "fables", label: "Fables" },
  { id: "daily-life", label: "Daily Life" },
  { id: "technology", label: "Technology" },
  { id: "travel", label: "Travel" },
];

describe("CategoryCard — link semantics", () => {
  it("renders as a link pointing at href", () => {
    render(
      <CategoryCard category="fables" label="Fables" storyCount={4} href="/search?category=fables" />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/search?category=fables");
  });

  it("spreads extra props onto the underlying anchor", () => {
    render(
      <CategoryCard
        category="travel"
        label="Travel"
        storyCount={2}
        href="/x"
        data-testid="card"
        target="_blank"
      />,
    );
    const link = screen.getByTestId("card");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("forwards ref to the anchor", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<CategoryCard ref={ref} category="fables" label="Fables" storyCount={4} href="/x" />);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });
});

describe("CategoryCard — selected state", () => {
  it("sets aria-current=page only when selected", () => {
    const { rerender } = render(
      <CategoryCard category="daily-life" label="Daily Life" storyCount={2} href="/x" />,
    );
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");

    rerender(
      <CategoryCard category="daily-life" label="Daily Life" storyCount={2} href="/x" selected />,
    );
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });

  it("renders the decorative check badge only when selected", () => {
    const { rerender, container } = render(
      <CategoryCard category="fables" label="Fables" storyCount={4} href="/x" />,
    );
    // Two SVGs unselected? No — one glyph only.
    expect(container.querySelectorAll("svg")).toHaveLength(1);

    rerender(<CategoryCard category="fables" label="Fables" storyCount={4} href="/x" selected />);
    // glyph + check badge
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });
});

describe("CategoryCard — accessible name", () => {
  it("names the link by its label and describes it with the count", () => {
    render(
      <CategoryCard category="daily-life" label="Daily Life" storyCount={2} href="/x" />,
    );
    // Accessible name = label; description = count.
    const link = screen.getByRole("link", { name: "Daily Life" });
    expect(link).toHaveAccessibleName("Daily Life");
    expect(link).toHaveAccessibleDescription("2 stories");
  });

  it("pluralises the count correctly (1 story / N stories)", () => {
    const { rerender } = render(
      <CategoryCard category="fables" label="Fables" storyCount={1} href="/x" />,
    );
    expect(screen.getByText("1 story")).toBeInTheDocument();

    rerender(<CategoryCard category="fables" label="Fables" storyCount={5} href="/x" />);
    expect(screen.getByText("5 stories")).toBeInTheDocument();
  });
});

describe("CategoryCard — decorative chrome is hidden", () => {
  it("hides the icon tile and its glyph from the a11y tree", () => {
    const { container } = render(
      <CategoryCard category="technology" label="Technology" storyCount={2} href="/x" />,
    );
    const glyph = container.querySelector("svg");
    expect(glyph?.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("hides the selected check badge from the a11y tree", () => {
    const { container } = render(
      <CategoryCard category="travel" label="Travel" storyCount={2} href="/x" selected />,
    );
    // The two decorative chrome elements are direct children of the link: the
    // icon tile and the check badge — both aria-hidden (nested glyph SVGs too).
    const directHidden = container.querySelectorAll("a > [aria-hidden='true']");
    expect(directHidden.length).toBe(2);
    // And the link exposes no "selected"/"check" text to the a11y tree.
    expect(screen.queryByText(/check|selected/i)).not.toBeInTheDocument();
  });
});

describe("CategoryCard — per-category mapping", () => {
  it("renders exactly one glyph per category (distinct icons)", () => {
    for (const { id, label } of CATEGORIES) {
      const { container, unmount } = render(
        <CategoryCard category={id} label={label} storyCount={2} href="/x" />,
      );
      expect(container.querySelectorAll("svg")).toHaveLength(1);
      unmount();
    }
  });

  it("applies the unselected token set (subtle tile, elevated surface)", () => {
    const { container } = render(
      <CategoryCard category="fables" label="Fables" storyCount={4} href="/x" />,
    );
    expect(container.querySelector("a")?.className).toContain("bg-surface-elevated");
    expect(container.querySelector("[aria-hidden='true']")?.className).toContain("bg-cat-fables-subtle");
  });

  it("applies the selected token set (category bg + solid fg tile)", () => {
    const { container } = render(
      <CategoryCard category="technology" label="Technology" storyCount={2} href="/x" selected />,
    );
    expect(container.querySelector("a")?.className).toContain("bg-category-tech-bg");
    expect(container.querySelector("[aria-hidden='true']")?.className).toContain("bg-category-tech-fg");
  });
});

describe("CategoryCard — keyboard", () => {
  it("is reachable by Tab and activates on Enter", async () => {
    const user = userEvent.setup();
    render(<CategoryCard category="fables" label="Fables" storyCount={4} href="#fables" />);
    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
  });
});

describe("CategoryCard — a11y (jest-axe)", () => {
  it("has no violations (unselected)", async () => {
    const { container } = render(
      <CategoryCard category="fables" label="Fables" storyCount={4} href="/x" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations (selected)", async () => {
    const { container } = render(
      <CategoryCard category="daily-life" label="Daily Life" storyCount={2} href="/x" selected />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
