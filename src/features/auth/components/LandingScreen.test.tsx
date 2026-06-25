import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  usePreferences,
  DEFAULT_PREFERENCES,
} from "@/stores/preferences";
import { LandingScreen } from "./LandingScreen";

/**
 * LandingScreen behavior tests. The screen composes the marketing hero
 * (BrandLogo + Log-in link + intro + 3 FeatureRows + the Book Showcase + the
 * language SegmentedControl + the primary CTA + trust bar). It binds the
 * translation language to the persisted preferences store and pushes to the
 * reading home on the CTA. We reset the store between tests and mock the App
 * Router so the CTA push is observable.
 */

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: vi.fn() }),
}));

beforeEach(() => {
  pushMock.mockClear();
  localStorage.clear();
  usePreferences.setState({ ...DEFAULT_PREFERENCES, _hasHydrated: false });
});

describe("LandingScreen — structure & content", () => {
  it("renders exactly one h1 — the hero title", () => {
    render(<LandingScreen />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Learn English, one fable at a time.");
  });

  it("renders the three feature rows as h3 headings under an h2", () => {
    render(<LandingScreen />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    for (const title of [
      "Listen to classics",
      "Read along",
      "Tap any word",
    ]) {
      expect(
        screen.getByRole("heading", { level: 3, name: title }),
      ).toBeInTheDocument();
    }
  });

  it("renders the eyebrow, body copy and trust bar facts", () => {
    render(<LandingScreen />);
    expect(screen.getByText("English through stories")).toBeInTheDocument();
    expect(
      screen.getByText(/Beloved tales, read aloud\./),
    ).toBeInTheDocument();
    expect(screen.getByText(/10 fables/)).toHaveTextContent(
      "10 fables · 4 levels (A1–B1) · 3 languages · 100% free",
    );
  });

  it("exposes Log in as a link to /login", () => {
    render(<LandingScreen />);
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});

describe("LandingScreen — language selector (preferences binding)", () => {
  it("is a radiogroup whose checked option reflects the store default (ES)", () => {
    render(<LandingScreen />);
    const group = screen.getByRole("radiogroup", { name: "Translate to" });
    expect(within(group).getByRole("radio", { name: "Spanish" })).toBeChecked();
  });

  it("writes the chosen language to the preferences store", async () => {
    const user = userEvent.setup();
    render(<LandingScreen />);
    await user.click(screen.getByRole("radio", { name: "Français" }));
    expect(usePreferences.getState().translationLang).toBe("FR");
    expect(screen.getByRole("radio", { name: "Français" })).toBeChecked();
  });

  it("reflects a pre-selected store value (FR) on render", () => {
    usePreferences.setState({ translationLang: "FR" });
    render(<LandingScreen />);
    expect(screen.getByRole("radio", { name: "Français" })).toBeChecked();
  });
});

describe("LandingScreen — CTA", () => {
  it("pushes to the reading home when Start reading is clicked", async () => {
    const user = userEvent.setup();
    render(<LandingScreen />);
    await user.click(screen.getByRole("button", { name: "Start reading" }));
    expect(pushMock).toHaveBeenCalledWith("/library");
  });
});

describe("LandingScreen — keyboard", () => {
  it("tabs Log in → language option → Start reading and activates the CTA with Enter", async () => {
    const user = userEvent.setup();
    render(<LandingScreen />);

    await user.tab();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveFocus();

    // The SegmentedControl is one tab stop (roving): the checked Spanish option.
    await user.tab();
    expect(screen.getByRole("radio", { name: "Spanish" })).toHaveFocus();

    await user.tab();
    const cta = screen.getByRole("button", { name: "Start reading" });
    expect(cta).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(pushMock).toHaveBeenCalledWith("/library");
  });
});

describe("LandingScreen — a11y (jest-axe)", () => {
  it("has no violations", async () => {
    const { container } = render(<LandingScreen />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
