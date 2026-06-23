import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { WordPopover, type WordPopoverProps } from "./WordPopover";

/** Default props for a ready popover; each test overrides what it needs. */
function renderPopover(props: Partial<WordPopoverProps> = {}) {
  return render(
    <WordPopover
      word="Path"
      pos="noun"
      translation="sendero, camino"
      {...props}
    />,
  );
}

describe("WordPopover", () => {
  it("renders the word, POS and translation in a labelled dialog", () => {
    renderPopover();
    const dialog = screen.getByRole("dialog", { name: "Path" });
    expect(within(dialog).getByText("Path")).toBeInTheDocument();
    expect(within(dialog).getByText("noun")).toBeInTheDocument();
    expect(within(dialog).getByText("sendero, camino")).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("omits the POS pill when no pos is supplied", () => {
    renderPopover({ pos: undefined });
    expect(screen.queryByText("noun")).not.toBeInTheDocument();
  });

  it("toggles Save → Saved and fires onToggleSave", async () => {
    const user = userEvent.setup();
    const onToggleSave = vi.fn();

    function Harness() {
      const [saved, setSaved] = useState(false);
      return (
        <WordPopover
          word="Path"
          translation="sendero"
          saved={saved}
          onToggleSave={() => {
            setSaved((s) => !s);
            onToggleSave();
          }}
        />
      );
    }
    render(<Harness />);

    const save = screen.getByRole("button", { name: "Save word" });
    expect(save).toHaveAttribute("aria-pressed", "false");
    await user.click(save);

    expect(onToggleSave).toHaveBeenCalledTimes(1);
    const saved = screen.getByRole("button", { name: "Saved" });
    expect(saved).toHaveAttribute("aria-pressed", "true");
  });

  it("fires onPractice from the Practice button", async () => {
    const user = userEvent.setup();
    const onPractice = vi.fn();
    renderPopover({ onPractice });
    await user.click(screen.getByRole("button", { name: "Practice" }));
    expect(onPractice).toHaveBeenCalledTimes(1);
  });

  it("fires onPronounce from the pronounce chip with a per-word name", async () => {
    const user = userEvent.setup();
    const onPronounce = vi.fn();
    renderPopover({ onPronounce });
    await user.click(screen.getByRole("button", { name: "Pronounce Path" }));
    expect(onPronounce).toHaveBeenCalledTimes(1);
  });

  it("fires onClose from the close button and on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderPopover({ onClose });

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("moves focus into the popover on mount", async () => {
    renderPopover();
    const dialog = screen.getByRole("dialog");
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it("traps Tab focus within the popover", async () => {
    const user = userEvent.setup();
    renderPopover();
    const dialog = screen.getByRole("dialog");

    // Tab through every control several times; focus must never leave the panel.
    for (let i = 0; i < 8; i += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    // And in reverse.
    for (let i = 0; i < 8; i += 1) {
      await user.tab({ shift: true });
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("shows skeletons (not the translation) while loading", () => {
    renderPopover({ status: "loading" });
    expect(screen.getByTestId("word-popover-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("sendero, camino")).not.toBeInTheDocument();
    expect(screen.queryByText("noun")).not.toBeInTheDocument();
    // The header word is always present.
    expect(screen.getByRole("dialog", { name: "Path" })).toBeInTheDocument();
  });

  it("shows a retry affordance in the error state and fires onRetry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderPopover({ status: "error", onRetry });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("sendero, camino")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations in the ready state", async () => {
    const { container } = renderPopover();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in the loading and error states", async () => {
    const loading = renderPopover({ status: "loading" });
    expect(await axe(loading.container)).toHaveNoViolations();
    loading.unmount();

    const error = renderPopover({ status: "error" });
    expect(await axe(error.container)).toHaveNoViolations();
  });
});
