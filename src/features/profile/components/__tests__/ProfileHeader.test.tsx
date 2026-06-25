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
      <ProfileHeader user={USER} onSignOut={vi.fn()} onAvatarChange={vi.fn()} />,
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
      />,
    );

    const file = new File(["x"], "notes.txt", { type: "text/plain" });
    await user.upload(getFileInput(container), file);

    expect(onAvatarChange).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ProfileHeader user={USER} onSignOut={vi.fn()} onAvatarChange={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
