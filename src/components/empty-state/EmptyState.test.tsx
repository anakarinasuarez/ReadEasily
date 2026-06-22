import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { EmptyState } from "./EmptyState";

const Glyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M0 0h24v24H0z" />
  </svg>
);

describe("EmptyState — region semantics", () => {
  it("is a region named by its title", () => {
    render(<EmptyState icon={<Glyph />} title="No saved words yet" />);
    expect(
      screen.getByRole("region", { name: "No saved words yet" }),
    ).toBeInTheDocument();
  });

  it("renders the body copy when provided", () => {
    render(
      <EmptyState
        icon={<Glyph />}
        title="No saved words yet"
        body="Tap a word while reading to keep it here."
      />,
    );
    expect(
      screen.getByText("Tap a word while reading to keep it here."),
    ).toBeInTheDocument();
  });
});

describe("EmptyState — action", () => {
  it("renders the CTA as a button and fires onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <EmptyState
        icon={<Glyph />}
        title="No saved words yet"
        action={{ label: "Start reading", onClick }}
      />,
    );

    const cta = screen.getByRole("button", { name: "Start reading" });
    await user.click(cta);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders the CTA as a link when href is given", () => {
    render(
      <EmptyState
        icon={<Glyph />}
        title="No saved words yet"
        action={{ label: "Start reading", href: "/library" }}
      />,
    );
    const link = screen.getByRole("link", { name: "Start reading" });
    expect(link).toHaveAttribute("href", "/library");
  });

  it("activates the CTA with the keyboard and shows it is the only focusable element", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <EmptyState
        icon={<Glyph />}
        title="Nothing yet"
        body="Some copy"
        action={{ label: "Start reading", onClick }}
      />,
    );

    await user.tab();
    const cta = screen.getByRole("button", { name: "Start reading" });
    expect(cta).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);

    // No nested-interactive trap: the action is the sole focusable control.
    await user.tab();
    expect(cta).not.toHaveFocus();
  });

  it("renders no action element when none is supplied", () => {
    render(<EmptyState icon={<Glyph />} title="Type to search" body="Start typing." />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("EmptyState — a11y (jest-axe)", () => {
  it("has no violations with a button action", async () => {
    const { container } = render(
      <EmptyState
        icon={<Glyph />}
        title="No saved words yet"
        body="Tap a word while reading."
        action={{ label: "Start reading", onClick: () => {} }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations with a link action", async () => {
    const { container } = render(
      <EmptyState
        icon={<Glyph />}
        title="No stories found"
        body="Try another word."
        action={{ label: "Browse", href: "/library" }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
