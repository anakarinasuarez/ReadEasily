import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { EndOfStory } from "./EndOfStory";

/**
 * EndOfStory — the "The End" card (Figma 1058:1829). Presentational + controlled:
 * it renders the completion message for a story and emits "Read again" intent.
 * Under test: the announced text, focus landing on the primary action, the
 * callback, and a11y.
 */
describe("EndOfStory", () => {
  it("announces the completion and shows the finished story's title", () => {
    render(<EndOfStory storyTitle="The Clever Crow" onReadAgain={() => {}} />);

    // role=status → an announced live region carrying the completion copy.
    const card = screen.getByRole("status");
    expect(card).toHaveTextContent("The End");
    expect(card).toHaveTextContent(/You finished .*The Clever Crow/);
  });

  it("moves focus to 'Read again' on mount and fires the callback on click", async () => {
    const user = userEvent.setup();
    const onReadAgain = vi.fn();
    render(<EndOfStory storyTitle="The Clever Crow" onReadAgain={onReadAgain} />);

    const readAgain = screen.getByRole("button", { name: "Read again" });
    // The single obvious next action takes focus so a keyboard user can restart.
    await waitFor(() => expect(readAgain).toHaveFocus());

    await user.click(readAgain);
    expect(onReadAgain).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <EndOfStory storyTitle="The Clever Crow" onReadAgain={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
