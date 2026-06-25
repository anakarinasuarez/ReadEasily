import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ProfileHeader } from "../ProfileHeader";
import type { ProfileUser } from "../../types";

/**
 * ProfileHeader behavior tests. We exercise the now-real Change-photo flow: the
 * camera affordance is reachable by its accessible name, picking an image file
 * through the hidden input emits a `data:`-prefixed URL via `onAvatarChange`,
 * and the header has no axe violations. The canvas downscale falls back to the
 * raw FileReader data URL under jsdom (no 2d context), which is the path tested.
 */

const USER: ProfileUser = {
  name: "Ana Lopez",
  email: "ana@readeasily.app",
  joinedAt: "2026-06-01T00:00:00.000Z",
};

const MOCK_DATA_URL = "data:image/png;base64,bW9ja2F2YXRhcg==";

// Deterministic FileReader so jsdom always yields a known data URL.
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

/** The hidden file picker — sr-only + aria-hidden, so query it directly. */
function getFileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("file input not found");
  return input;
}

describe("ProfileHeader — Change photo affordance", () => {
  it("exposes the camera control by its accessible name", () => {
    render(
      <ProfileHeader
        user={USER}
        onSignOut={vi.fn()}
        onAvatarChange={vi.fn()}
        onNameChange={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Change photo" }),
    ).toBeInTheDocument();
  });

  it("emits a data-URL via onAvatarChange when an image file is picked", async () => {
    const user = userEvent.setup();
    const onAvatarChange = vi.fn();
    const { container } = render(
      <ProfileHeader
        user={USER}
        onSignOut={vi.fn()}
        onAvatarChange={onAvatarChange}
        onNameChange={vi.fn()}
      />,
    );

    const file = new File(["x"], "selfie.png", { type: "image/png" });
    await user.upload(getFileInput(container), file);

    expect(onAvatarChange).toHaveBeenCalledTimes(1);
    const arg = onAvatarChange.mock.calls[0][0] as string;
    expect(arg).toMatch(/^data:/);
  });

  it("ignores a non-image file", async () => {
    const user = userEvent.setup();
    const onAvatarChange = vi.fn();
    const { container } = render(
      <ProfileHeader
        user={USER}
        onSignOut={vi.fn()}
        onAvatarChange={onAvatarChange}
        onNameChange={vi.fn()}
      />,
    );

    const file = new File(["x"], "notes.txt", { type: "text/plain" });
    await user.upload(getFileInput(container), file);

    expect(onAvatarChange).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ProfileHeader
        user={USER}
        onSignOut={vi.fn()}
        onAvatarChange={vi.fn()}
        onNameChange={vi.fn()}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ProfileHeader — inline name editor", () => {
  function renderHeader(onNameChange = vi.fn()) {
    return {
      onNameChange,
      ...render(
        <ProfileHeader
          user={USER}
          onSignOut={vi.fn()}
          onAvatarChange={vi.fn()}
          onNameChange={onNameChange}
        />,
      ),
    };
  }

  it("swaps the h1 for a focused input when the pencil is clicked", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole("button", { name: "Edit name" }));

    const input = screen.getByRole("textbox", { name: "Your name" });
    expect(input).toHaveFocus();
    expect(input).toHaveValue("Ana Lopez");
    // The static heading is gone while editing.
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("commits a new, trimmed name on Enter and returns to the h1", async () => {
    const user = userEvent.setup();
    const { onNameChange } = renderHeader();

    await user.click(screen.getByRole("button", { name: "Edit name" }));
    const input = screen.getByRole("textbox", { name: "Your name" });
    await user.clear(input);
    await user.type(input, "  Bea Ruiz  {Enter}");

    expect(onNameChange).toHaveBeenCalledTimes(1);
    expect(onNameChange).toHaveBeenCalledWith("Bea Ruiz");
    // Back to view mode; focus returns to the pencil.
    expect(
      screen.getByRole("heading", { level: 1, name: "Ana Lopez" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit name" })).toHaveFocus();
  });

  it("commits via the Save button", async () => {
    const user = userEvent.setup();
    const { onNameChange } = renderHeader();

    await user.click(screen.getByRole("button", { name: "Edit name" }));
    const input = screen.getByRole("textbox", { name: "Your name" });
    await user.clear(input);
    await user.type(input, "Bea Ruiz");
    await user.click(screen.getByRole("button", { name: "Save name" }));

    expect(onNameChange).toHaveBeenCalledTimes(1);
    expect(onNameChange).toHaveBeenCalledWith("Bea Ruiz");
  });

  it("cancels on Escape without calling onNameChange", async () => {
    const user = userEvent.setup();
    const { onNameChange } = renderHeader();

    await user.click(screen.getByRole("button", { name: "Edit name" }));
    const input = screen.getByRole("textbox", { name: "Your name" });
    await user.clear(input);
    await user.type(input, "Discarded{Escape}");

    expect(onNameChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { level: 1, name: "Ana Lopez" }),
    ).toBeInTheDocument();
  });

  it("cancels via the Cancel button without calling onNameChange", async () => {
    const user = userEvent.setup();
    const { onNameChange } = renderHeader();

    await user.click(screen.getByRole("button", { name: "Edit name" }));
    const input = screen.getByRole("textbox", { name: "Your name" });
    await user.clear(input);
    await user.type(input, "Discarded");
    await user.click(screen.getByRole("button", { name: "Cancel editing name" }));

    expect(onNameChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { level: 1, name: "Ana Lopez" }),
    ).toBeInTheDocument();
  });

  it("emits an empty string when the name is cleared and saved", async () => {
    const user = userEvent.setup();
    const { onNameChange } = renderHeader();

    await user.click(screen.getByRole("button", { name: "Edit name" }));
    const input = screen.getByRole("textbox", { name: "Your name" });
    await user.clear(input);
    await user.click(screen.getByRole("button", { name: "Save name" }));

    expect(onNameChange).toHaveBeenCalledTimes(1);
    expect(onNameChange).toHaveBeenCalledWith("");
  });

  it("has no axe violations while editing", async () => {
    const user = userEvent.setup();
    const { container } = renderHeader();

    await user.click(screen.getByRole("button", { name: "Edit name" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
