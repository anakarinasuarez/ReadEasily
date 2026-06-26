import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { axe } from "jest-axe";
import { server } from "../../../../tests/mocks/server";
import { renderWithQuery } from "../../../../tests/utils/query";
import {
  usePreferences,
  DEFAULT_PREFERENCES,
} from "@/stores/preferences";
import { useProfileOverrides } from "@/stores/profileOverrides";
import { ProfileScreen } from "../components/ProfileScreen";

/**
 * ProfileScreen behavior tests. The screen reads the user + stats from the
 * MSW-mocked `/api/profile` (Query) and the five preferences from the global
 * persisted store; we assert the header/stats render from the payload, the
 * stats reflect the derived saved-words counts, each setting writes the store,
 * the destructive rows open a confirm modal, and the navbar avatar routes to
 * `/profile`. Store PERSISTENCE itself is covered in `stores/preferences.test`.
 */

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: vi.fn() }),
}));

beforeEach(() => {
  pushMock.mockClear();
  // Each test starts from factory preferences + empty storage.
  localStorage.clear();
  usePreferences.setState({ ...DEFAULT_PREFERENCES, _hasHydrated: false });
  useProfileOverrides.setState({
    avatarDataUrl: null,
    displayName: null,
    _hasHydrated: false,
  });
});

describe("ProfileScreen — header + stats from getProfile", () => {
  it("renders the user identity from the payload", async () => {
    renderWithQuery(<ProfileScreen />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Ana" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ana@readeasily\.app/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Joined June 2026/)).toBeInTheDocument();
  });

  it("renders the four stat tiles, derived from the saved-words list", async () => {
    renderWithQuery(<ProfileScreen />);

    // Seed = 8 saved words, 2 with ready practice sentences (deriveSavedStats).
    expect(await screen.findByText("Words saved")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument(); // wordsSaved
    expect(screen.getByText("Practice sets")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // practiceSets
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Finished")).toBeInTheDocument();
  });

  it("shows an error block with retry when the profile fetch fails", async () => {
    server.use(
      http.get("/api/profile", () =>
        HttpResponse.json({ message: "boom" }, { status: 500 }),
      ),
    );
    renderWithQuery(<ProfileScreen />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /couldn.t load your profile/i,
    );
    // Settings still render below the error — they don't depend on the server.
    expect(screen.getByText("Translation language")).toBeInTheDocument();
  });
});

describe("ProfileScreen — settings write the global store", () => {
  it("changes the translation language via the segmented control", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileScreen />);
    await screen.findByText("Translation language");

    expect(usePreferences.getState().translationLang).toBe("ES");
    await user.click(screen.getByRole("radio", { name: "FR" }));
    expect(usePreferences.getState().translationLang).toBe("FR");
  });

  it("changes the reading accent via the segmented control", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileScreen />);
    await screen.findByText("Reading accent");

    expect(usePreferences.getState().readingAccent).toBe("US");
    await user.click(screen.getByRole("radio", { name: "UK" }));
    expect(usePreferences.getState().readingAccent).toBe("UK");
  });

  it("flips a toggle preference (Autoplay narration)", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileScreen />);
    await screen.findByText("Autoplay narration");

    expect(usePreferences.getState().autoplay).toBe(false);
    await user.click(screen.getByRole("switch", { name: "Autoplay narration" }));
    expect(usePreferences.getState().autoplay).toBe(true);
  });

  it("flips the Reduce motion toggle (plum row)", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileScreen />);
    await screen.findByText("Reduce motion");

    expect(usePreferences.getState().reduceMotion).toBe(false);
    await user.click(screen.getByRole("switch", { name: "Reduce motion" }));
    expect(usePreferences.getState().reduceMotion).toBe(true);
  });
});

describe("ProfileScreen — destructive account rows confirm before acting", () => {
  it("opens a confirm modal for Reset learning data", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileScreen />);
    await screen.findByText("Account");

    await user.click(
      screen.getByRole("button", { name: "Reset learning data" }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Reset learning data?")).toBeInTheDocument();
  });

  it("opens a confirm modal for Delete account", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileScreen />);
    await screen.findByText("Account");

    await user.click(screen.getByRole("button", { name: "Delete account" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Delete account?")).toBeInTheDocument();

    // Cancel closes it without acting.
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});

describe("ProfileScreen — changing the avatar persists and renders", () => {
  const MOCK_DATA_URL = "data:image/png;base64,cGlja2VkYXZhdGFy";

  // Deterministic FileReader so the picked file yields a known data URL.
  class MockFileReader {
    result: string | ArrayBuffer | null = null;
    error: DOMException | null = null;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    readAsDataURL() {
      this.result = MOCK_DATA_URL;
      this.onload?.();
    }
  }

  beforeEach(() => {
    vi.stubGlobal("FileReader", MockFileReader);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders an <img> avatar with the picked data URL after a photo is chosen", async () => {
    const user = userEvent.setup();
    const { container } = renderWithQuery(<ProfileScreen />);

    // The mock user has no avatarSrc, so before the pick the avatars show the
    // initials fallback (role="img" via aria-label, but no real <img> element).
    await screen.findByRole("heading", { level: 1, name: "Ana" });
    expect(container.querySelector("img")).toBeNull();

    const input = container.querySelector<HTMLInputElement>(
      'input[type="file"]',
    );
    expect(input).not.toBeNull();
    const file = new File(["x"], "selfie.png", { type: "image/png" });
    await user.upload(input as HTMLInputElement, file);

    // The store override flows through to the Avatar(s) as real <img> elements
    // (the header, and the navbar account avatar) whose src is the data URL.
    await waitFor(() => {
      const imgs = screen.getAllByAltText("Ana");
      expect(imgs.length).toBeGreaterThan(0);
      imgs.forEach((img) => expect(img).toHaveAttribute("src", MOCK_DATA_URL));
    });
    // And it persisted to the store immediately.
    expect(useProfileOverrides.getState().avatarDataUrl).toBe(MOCK_DATA_URL);
  });
});

describe("ProfileScreen — editing the display name persists and propagates", () => {
  it("reflects the new name in the header h1 AND the navbar avatar, and persists it", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileScreen />);

    // Starts from the server name in both the heading and the navbar avatar.
    await screen.findByRole("heading", { level: 1, name: "Ana" });

    // Open the inline editor, replace the name, commit with Enter.
    await user.click(screen.getByRole("button", { name: "Edit name" }));
    const input = screen.getByRole("textbox", { name: "Your name" });
    await user.clear(input);
    await user.type(input, "Ana Lopez{Enter}");

    // Header h1 now shows the override...
    expect(
      await screen.findByRole("heading", { level: 1, name: "Ana Lopez" }),
    ).toBeInTheDocument();
    // ...and so does the navbar account avatar (initials fallback, role=img).
    const avatars = screen.getAllByRole("img", { name: "Ana Lopez" });
    expect(avatars.length).toBeGreaterThan(0);
    // ...and it persisted to the overrides store.
    expect(useProfileOverrides.getState().displayName).toBe("Ana Lopez");
  });

  it("clears the override when the name is emptied (falls back to server name)", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileScreen />);
    await screen.findByRole("heading", { level: 1, name: "Ana" });

    await user.click(screen.getByRole("button", { name: "Edit name" }));
    const input = screen.getByRole("textbox", { name: "Your name" });
    await user.clear(input);
    await user.type(input, "{Enter}");

    // Empty commit clears the override; the heading shows the server name again.
    expect(
      await screen.findByRole("heading", { level: 1, name: "Ana" }),
    ).toBeInTheDocument();
    expect(useProfileOverrides.getState().displayName).toBeNull();
  });
});

describe("ProfileScreen — navigation contract", () => {
  it("routes the navbar account avatar to /profile", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileScreen />);
    await screen.findByText("Words saved");

    // The avatar opens the account popover; its "View profile" header row routes
    // to /profile.
    await user.click(screen.getByRole("button", { name: "Account" }));
    await user.click(
      await screen.findByRole("button", { name: /^View profile,/ }),
    );
    expect(pushMock).toHaveBeenCalledWith("/profile");
  });
});

describe("ProfileScreen — a11y", () => {
  it("has no axe violations once loaded", async () => {
    const { container } = renderWithQuery(<ProfileScreen />);
    await screen.findByText("Words saved");
    expect(await axe(container)).toHaveNoViolations();
  });
});
