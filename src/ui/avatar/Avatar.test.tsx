import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders an <img> with alt=name when src is provided", () => {
    render(<Avatar src="/ada.png" name="Ada Lovelace" />);
    const img = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("src", "/ada.png");
    expect(img).toHaveAttribute("alt", "Ada Lovelace");
  });

  it("renders the initials fallback (role=img + aria-label) when no src is given", () => {
    render(<Avatar name="Ada Lovelace" />);
    const fallback = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(fallback.tagName).toBe("SPAN");
    // initials are present but decorative
    expect(screen.getByText("AL")).toHaveAttribute("aria-hidden", "true");
  });

  it("flips to the initials fallback when the image fails to load (onError)", () => {
    render(<Avatar src="/broken.png" name="Grace Hopper" />);
    const img = screen.getByRole("img", { name: "Grace Hopper" });
    expect(img.tagName).toBe("IMG");

    fireEvent.error(img);

    const fallback = screen.getByRole("img", { name: "Grace Hopper" });
    expect(fallback.tagName).toBe("SPAN");
    expect(screen.getByText("GH")).toBeInTheDocument();
    // the broken <img> is gone
    expect(screen.queryByRole("img")).toBe(fallback);
  });

  it("derives initials from the first + last word, uppercased, max 2 chars", () => {
    render(<Avatar name="ada beatrice lovelace" />);
    // first letter of first word + first letter of last word
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("yields a single initial for a single-word name", () => {
    render(<Avatar name="cher" />);
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("applies the requested size", () => {
    const { rerender } = render(<Avatar name="Ada Lovelace" size="sm" />);
    expect(screen.getByRole("img")).toHaveClass("size-[32px]");
    rerender(<Avatar name="Ada Lovelace" size="lg" />);
    expect(screen.getByRole("img")).toHaveClass("size-[56px]");
  });

  it("defaults to md size", () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByRole("img")).toHaveClass("size-[40px]");
  });

  it("forwards ref and spreads rest props onto the root span", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<Avatar ref={ref} data-testid="avatar" name="Ada Lovelace" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(screen.getByTestId("avatar")).toBe(ref.current);
  });

  it("has no a11y violations — image case", async () => {
    const { container } = render(<Avatar src="/ada.png" name="Ada Lovelace" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no a11y violations — initials fallback case", async () => {
    const { container } = render(<Avatar name="Ada Lovelace" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
