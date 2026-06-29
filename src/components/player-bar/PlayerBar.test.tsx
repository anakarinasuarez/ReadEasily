import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { PlayerBar } from "./PlayerBar";

describe("PlayerBar", () => {
  it("renders a labelled region with both transport rows", () => {
    render(<PlayerBar elapsedLabel="0:09" totalLabel="1:03" />);
    expect(
      screen.getByRole("region", { name: "Audio player" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Playback controls" }),
    ).toBeInTheDocument();
    expect(screen.getByText("0:09")).toBeInTheDocument();
    expect(screen.getByText("1:03")).toBeInTheDocument();
  });

  it("shows Play when paused and fires onTogglePlay on click", async () => {
    const user = userEvent.setup();
    const onTogglePlay = vi.fn();
    render(<PlayerBar playing={false} onTogglePlay={onTogglePlay} />);
    const play = screen.getByRole("button", { name: "Play" });
    await user.click(play);
    expect(onTogglePlay).toHaveBeenCalledTimes(1);
    // No stale Pause name while paused.
    expect(screen.queryByRole("button", { name: "Pause" })).toBeNull();
  });

  it("flips the accessible name to Pause when playing", () => {
    render(<PlayerBar playing onTogglePlay={() => {}} />);
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Play" })).toBeNull();
  });

  it("fires each transport handler from its own button", async () => {
    const user = userEvent.setup();
    const handlers = {
      onRestart: vi.fn(),
      onPrevSentence: vi.fn(),
      onNextSentence: vi.fn(),
      onSkipEnd: vi.fn(),
      onToggleFullscreen: vi.fn(),
    };
    render(<PlayerBar {...handlers} />);

    await user.click(screen.getByRole("button", { name: "Restart" }));
    await user.click(screen.getByRole("button", { name: "Previous sentence" }));
    await user.click(screen.getByRole("button", { name: "Next sentence" }));
    await user.click(screen.getByRole("button", { name: "Skip to end" }));
    await user.click(screen.getByRole("button", { name: "Enter full screen" }));

    expect(handlers.onRestart).toHaveBeenCalledTimes(1);
    expect(handlers.onPrevSentence).toHaveBeenCalledTimes(1);
    expect(handlers.onNextSentence).toHaveBeenCalledTimes(1);
    expect(handlers.onSkipEnd).toHaveBeenCalledTimes(1);
    expect(handlers.onToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it("renders the speed pill with the passed speed and cycles on click", async () => {
    const user = userEvent.setup();
    const onCycleSpeed = vi.fn();
    render(<PlayerBar speed={1.25} onCycleSpeed={onCycleSpeed} />);
    const pill = screen.getByRole("button", { name: "Playback speed, 1.25×" });
    expect(within(pill).getByText("1.25×")).toBeInTheDocument();
    await user.click(pill);
    expect(onCycleSpeed).toHaveBeenCalledTimes(1);
  });

  it("renders the level chip from the level prop", () => {
    render(<PlayerBar level="A2" />);
    expect(screen.getByText("A2")).toBeInTheDocument();
    // Screen readers get context, not a bare token.
    expect(screen.getByText("Story level")).toBeInTheDocument();
  });

  it("omits the level chip when no level is given", () => {
    render(<PlayerBar />);
    expect(screen.queryByText("Story level")).toBeNull();
  });

  it("exposes the slider value from progress and the time labels", () => {
    render(
      <PlayerBar progress={0.5} elapsedLabel="0:31" totalLabel="1:03" />,
    );
    const slider = screen.getByRole("slider", { name: "Playback position" });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
    expect(slider).toHaveAttribute("aria-valuetext", "0:31 of 1:03");
  });

  it("seeks via the keyboard and fires onSeek (Arrow / Home / End)", async () => {
    const user = userEvent.setup();
    const onSeek = vi.fn();
    render(<PlayerBar progress={0.5} onSeek={onSeek} />);
    const slider = screen.getByRole("slider", { name: "Playback position" });
    slider.focus();
    expect(slider).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(onSeek).toHaveBeenLastCalledWith(0.55);

    await user.keyboard("{ArrowLeft}");
    expect(onSeek).toHaveBeenLastCalledWith(0.45);

    await user.keyboard("{Home}");
    expect(onSeek).toHaveBeenLastCalledWith(0);

    await user.keyboard("{End}");
    expect(onSeek).toHaveBeenLastCalledWith(1);
  });

  it("uses a one-sentence keyboard step when sentenceCount is given", async () => {
    const user = userEvent.setup();
    const onSeek = vi.fn();
    render(<PlayerBar progress={0} sentenceCount={4} onSeek={onSeek} />);
    const slider = screen.getByRole("slider", { name: "Playback position" });
    slider.focus();
    await user.keyboard("{ArrowRight}");
    // step = 1/4 = 0.25
    expect(onSeek).toHaveBeenLastCalledWith(0.25);
  });

  it("clamps keyboard seeks to the 0..1 range", async () => {
    const user = userEvent.setup();
    const onSeek = vi.fn();
    render(<PlayerBar progress={1} onSeek={onSeek} />);
    const slider = screen.getByRole("slider", { name: "Playback position" });
    slider.focus();
    await user.keyboard("{ArrowRight}");
    expect(onSeek).toHaveBeenLastCalledWith(1);
  });

  it("paints a uniform dotted rail, not per-sentence tick dots", () => {
    const { container } = render(
      <PlayerBar sentenceCount={4} progress={0} />,
    );
    // The unfilled track is a single dotted-rail element (a repeating
    // radial-gradient), not discrete per-sentence tick spans. sentenceCount
    // still drives the seek step + aria (covered above), but the visual is a
    // uniform dotted rail (Figma 1128:2573).
    expect(container.querySelectorAll("span.size-\\[3px\\]")).toHaveLength(0);
    const rail = Array.from(container.querySelectorAll("span")).find((el) =>
      el.getAttribute("style")?.includes("radial-gradient"),
    );
    expect(rail).toBeTruthy();
  });

  it("buffers on loading: play button is busy and does not toggle", async () => {
    const user = userEvent.setup();
    const onTogglePlay = vi.fn();
    render(<PlayerBar status="loading" onTogglePlay={onTogglePlay} />);
    const play = screen.getByRole("button", { name: "Loading audio" });
    expect(play).toHaveAttribute("aria-busy", "true");
    expect(play).toBeDisabled();
    await user.click(play);
    expect(onTogglePlay).not.toHaveBeenCalled();
  });

  it("disables every control when status is disabled (no audio)", async () => {
    const user = userEvent.setup();
    const onTogglePlay = vi.fn();
    const onCycleSpeed = vi.fn();
    render(
      <PlayerBar
        status="disabled"
        level="A2"
        onTogglePlay={onTogglePlay}
        onCycleSpeed={onCycleSpeed}
      />,
    );

    for (const name of [
      "Play",
      "Restart",
      "Previous sentence",
      "Next sentence",
      "Skip to end",
      "Enter full screen",
      "Playback speed, 1×",
    ]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }

    // The slider is taken out of the tab order and marked disabled.
    const slider = screen.getByRole("slider", { name: "Playback position" });
    expect(slider).toHaveAttribute("aria-disabled", "true");
    expect(slider).toHaveAttribute("tabindex", "-1");

    // An sr-friendly note explains why audio is unavailable.
    expect(
      screen.getByText("Audio is unavailable for this story."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(onTogglePlay).not.toHaveBeenCalled();
  });

  it("forwards the ref to the root region element", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<PlayerBar ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("role", "region");
  });

  it("spreads rest props onto the root element", () => {
    render(<PlayerBar data-testid="player" />);
    expect(screen.getByTestId("player")).toHaveAttribute("role", "region");
  });

  it("has no detectable a11y violations when ready", async () => {
    const { container } = render(
      <PlayerBar
        playing
        progress={0.4}
        elapsedLabel="0:25"
        totalLabel="1:03"
        sentenceCount={8}
        speed={1}
        level="A2"
        onTogglePlay={() => {}}
        onSeek={() => {}}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no detectable a11y violations when disabled", async () => {
    const { container } = render(
      <PlayerBar status="disabled" level="A2" elapsedLabel="0:00" totalLabel="1:03" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
