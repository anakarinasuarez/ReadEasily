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
 * (centered BrandLogo + intro + 3 FeatureRows + the decorative LandingShowcase +
 * the language SegmentedControl + the primary CTA + trust bar). There is NO
 * "Log in" entry on the Landing (product decision). It binds the translation
 * language to the persisted preferences store and pushes to the reading home on
 * the CTA. We reset the store between tests and mock the App Router so the CTA
 * push is observable.
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
  it("renders exactly one h1 whose three line-break spans read as one name", () => {
    render(<LandingScreen />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    // The forced line breaks are `block` spans INSIDE the single h1 — the
    // accessible name is still the full sentence.
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
    // The facts are separate flex children (· dots between them), so assert each.
    for (const fact of [
      "10 fables",
      "4 levels (A1–B1)",
      "3 languages",
      "100% free",
    ]) {
      expect(screen.getByText(fact)).toBeInTheDocument();
    }
  });

  it("does NOT render a Log in entry (product decision)", () => {
    render(<LandingScreen />);
    expect(screen.queryByRole("link", { name: /log in/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /log in/i }),
    ).not.toBeInTheDocument();
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
  it("tabs language option → Start reading (no Log in) and activates the CTA with Enter", async () => {
    const user = userEvent.setup();
    render(<LandingScreen />);

    // The SegmentedControl is the first tab stop (roving): the checked Spanish
    // option. The centered brand and decorative showcase add no tab stops, and
    // there is no Log in entry.
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
