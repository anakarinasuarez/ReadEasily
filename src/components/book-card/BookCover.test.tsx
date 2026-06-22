import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { BookCover } from "./BookCover";

const SRC = "/covers/the-ant-grasshopper.webp";
const ALT = "The Ant & the Grasshopper cover";

describe("BookCover", () => {
  it("renders an image with the required alt", () => {
    render(<BookCover src={SRC} alt={ALT} />);
    expect(screen.getByRole("img", { name: ALT })).toBeInTheDocument();
  });

  it("applies the footprint for the requested size", () => {
    const { container, rerender } = render(
      <BookCover src={SRC} alt={ALT} size="thumbnail" />,
    );
    expect(container.firstChild).toHaveClass("w-[140px]", "h-[200px]");
    rerender(<BookCover src={SRC} alt={ALT} size="hero" />);
    expect(container.firstChild).toHaveClass("w-[320px]", "h-[480px]");
  });

  it("defaults to the small footprint", () => {
    const { container } = render(<BookCover src={SRC} alt={ALT} />);
    expect(container.firstChild).toHaveClass("w-[168px]", "h-[242px]");
  });

  it("flips to the warm fallback tile when the image fails to load", () => {
    render(<BookCover src="/broken.png" alt={ALT} />);
    const img = screen.getByRole("img", { name: ALT });
    expect(img.tagName).toBe("IMG");

    fireEvent.error(img);

    // the broken <img> is replaced by a labelled fallback element
    const fallback = screen.getByRole("img", { name: ALT });
    expect(fallback.tagName).not.toBe("IMG");
    expect(screen.queryByRole("img")).toBe(fallback);
  });

  it("has no a11y violations", async () => {
    const { container } = render(<BookCover src={SRC} alt={ALT} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
