import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { BookCard } from "./BookCard";

const BOOK = {
  title: "The Ant & the Grasshopper",
  level: "A2",
  minutes: 6,
  coverSrc: "/covers/ant.png",
};

describe("BookCard", () => {
  it("renders a single link to the book", () => {
    render(<BookCard book={BOOK} href="/read/ant" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/read/ant");
  });

  it("renders the title and the `level · minutes` meta", () => {
    render(<BookCard book={BOOK} href="/read/ant" />);
    expect(screen.getByText("The Ant & the Grasshopper")).toBeInTheDocument();
    expect(screen.getByText("A2")).toBeInTheDocument();
    expect(screen.getByText("6 min")).toBeInTheDocument();
  });

  it("uses the title as the cover alt by default and honors an override", () => {
    const { rerender } = render(<BookCard book={BOOK} href="/read/ant" />);
    expect(
      screen.getByRole("img", { name: "The Ant & the Grasshopper" }),
    ).toBeInTheDocument();
    rerender(
      <BookCard book={BOOK} href="/read/ant" coverAlt="A painted ant and grasshopper" />,
    );
    expect(
      screen.getByRole("img", { name: "A painted ant and grasshopper" }),
    ).toBeInTheDocument();
  });

  it("keeps the play affordance non-interactive when onPlay is omitted", () => {
    render(<BookCard book={BOOK} href="/read/ant" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a labelled nested play button when onPlay is provided", () => {
    render(<BookCard book={BOOK} href="/read/ant" onPlay={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Play The Ant & the Grasshopper" }),
    ).toBeInTheDocument();
  });

  it("fires onPlay and stops propagation to the card link", async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    const onCardClick = vi.fn();
    render(
      <BookCard book={BOOK} href="/read/ant" onPlay={onPlay} onClick={onCardClick} />,
    );
    await user.click(screen.getByRole("button", { name: /Play/ }));
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it("renders a skeleton (no link) while loading", () => {
    render(<BookCard book={BOOK} href="/read/ant" loading />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Loading book");
  });

  it("has no a11y violations (default)", async () => {
    const { container } = render(<BookCard book={BOOK} href="/read/ant" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no a11y violations (with play button)", async () => {
    const { container } = render(
      <BookCard book={BOOK} href="/read/ant" onPlay={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no a11y violations (loading)", async () => {
    const { container } = render(<BookCard book={BOOK} href="/read/ant" loading />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
