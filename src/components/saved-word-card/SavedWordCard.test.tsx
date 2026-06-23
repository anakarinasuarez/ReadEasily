import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SavedWordCard } from "./SavedWordCard";

const BASE = {
  word: "Path",
  translation: "sendero, camino",
  sourceStoryTitle: "The Ant & the Grasshopper",
  sentencesReady: 10,
} as const;

describe("SavedWordCard", () => {
  it("renders the word, translation and source title", () => {
    render(<SavedWordCard {...BASE} />);
    expect(screen.getByText("Path")).toBeInTheDocument();
    expect(screen.getByText("sendero, camino")).toBeInTheDocument();
    expect(screen.getByText("The Ant & the Grasshopper")).toBeInTheDocument();
  });

  it("renders the phonetic line only when provided", () => {
    const { rerender } = render(<SavedWordCard {...BASE} />);
    expect(screen.queryByText("/pɑːθ/")).not.toBeInTheDocument();
    rerender(<SavedWordCard {...BASE} phonetic="/pɑːθ/" />);
    expect(screen.getByText("/pɑːθ/")).toBeInTheDocument();
  });

  it("fires onListen from the audio button named for the word", async () => {
    const onListen = vi.fn();
    const user = userEvent.setup();
    render(<SavedWordCard {...BASE} onListen={onListen} />);
    await user.click(
      screen.getByRole("button", { name: "Listen to Path" }),
    );
    expect(onListen).toHaveBeenCalledTimes(1);
  });

  it("fires onRemove from the unsave button named 'Remove <word> from saved'", async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(<SavedWordCard {...BASE} onRemove={onRemove} />);
    await user.click(
      screen.getByRole("button", { name: "Remove Path from saved" }),
    );
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("shows the badge and labels the action 'Review' when sentencesReady > 0", () => {
    render(<SavedWordCard {...BASE} sentencesReady={10} />);
    expect(screen.getByText("10 sentences ready")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Review Path" }),
    ).toBeInTheDocument();
  });

  it("hides the badge and labels the action 'Practice' when sentencesReady is 0", () => {
    render(<SavedWordCard {...BASE} sentencesReady={0} />);
    expect(screen.queryByText(/sentences ready/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Practice Path" }),
    ).toBeInTheDocument();
  });

  it("singularizes the badge for a single ready sentence", () => {
    render(<SavedWordCard {...BASE} sentencesReady={1} />);
    expect(screen.getByText("1 sentence ready")).toBeInTheDocument();
  });

  it("makes the word a link only when wordHref is set", () => {
    const { rerender } = render(<SavedWordCard {...BASE} />);
    expect(
      screen.queryByRole("link", { name: "Path" }),
    ).not.toBeInTheDocument();
    rerender(<SavedWordCard {...BASE} wordHref="/read/ant#path" />);
    expect(screen.getByRole("link", { name: "Path" })).toHaveAttribute(
      "href",
      "/read/ant#path",
    );
  });

  it("renders the practice action as a link when practiceHref is set", () => {
    render(<SavedWordCard {...BASE} practiceHref="/practice/path" />);
    expect(
      screen.getByRole("link", { name: "Review Path" }),
    ).toHaveAttribute("href", "/practice/path");
  });

  it("fires onPractice from the action button", async () => {
    const onPractice = vi.fn();
    const user = userEvent.setup();
    render(<SavedWordCard {...BASE} sentencesReady={0} onPractice={onPractice} />);
    await user.click(screen.getByRole("button", { name: "Practice Path" }));
    expect(onPractice).toHaveBeenCalledTimes(1);
  });

  it("does NOT nest the controls inside a card-wide link (no nested-interactive trap)", () => {
    const { container } = render(
      <SavedWordCard {...BASE} wordHref="/read/ant#path" />,
    );
    // The root is a presentational <article>, not a link.
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("ARTICLE");
    // No interactive control lives inside any link.
    for (const link of screen.getAllByRole("link")) {
      expect(within(link).queryByRole("button")).toBeNull();
    }
  });

  it("is keyboard operable across word link and all controls", async () => {
    const onListen = vi.fn();
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(
      <SavedWordCard
        {...BASE}
        wordHref="/read/ant#path"
        onListen={onListen}
        onRemove={onRemove}
      />,
    );
    await user.tab();
    expect(screen.getByRole("link", { name: "Path" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Listen to Path" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onListen).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Remove Path from saved" }),
    ).toHaveFocus();
  });

  it("has no axe violations (badge variant with word link)", async () => {
    const { container } = render(
      <SavedWordCard
        {...BASE}
        phonetic="/pɑːθ/"
        wordHref="/read/ant#path"
        practiceHref="/practice/path"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations (plain variant, button action)", async () => {
    const { container } = render(
      <SavedWordCard {...BASE} sentencesReady={0} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
