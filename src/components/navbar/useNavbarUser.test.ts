import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNavbarUser } from "./useNavbarUser";
import { useProfileOverrides } from "@/stores/profileOverrides";
import type { NavbarUser } from "./Navbar";

/**
 * useNavbarUser overlays the local profile overrides onto a screen's base user.
 * We assert it passes the base through untouched when no override is set, and
 * substitutes the display name / avatar when overrides exist.
 */

const BASE: NavbarUser = { name: "Ana", avatarSrc: undefined };
const DATA_URL = "data:image/png;base64,b3ZlcnJpZGU=";

beforeEach(() => {
  useProfileOverrides.setState({
    avatarDataUrl: null,
    displayName: null,
    _hasHydrated: false,
  });
});

describe("useNavbarUser", () => {
  it("returns the base user when no overrides are set", () => {
    const { result } = renderHook(() => useNavbarUser(BASE));
    expect(result.current).toEqual({ name: "Ana", avatarSrc: undefined });
  });

  it("substitutes the display-name override", () => {
    useProfileOverrides.getState().setDisplayName("Ana Lopez");
    const { result } = renderHook(() => useNavbarUser(BASE));
    expect(result.current.name).toBe("Ana Lopez");
  });

  it("substitutes the avatar override", () => {
    useProfileOverrides.getState().setAvatar(DATA_URL);
    const { result } = renderHook(() => useNavbarUser(BASE));
    expect(result.current.avatarSrc).toBe(DATA_URL);
  });

  it("keeps the base avatar when only the name is overridden", () => {
    useProfileOverrides.getState().setDisplayName("Ana Lopez");
    const { result } = renderHook(() =>
      useNavbarUser({ name: "Ana", avatarSrc: "https://img/base.png" }),
    );
    expect(result.current).toEqual({
      name: "Ana Lopez",
      avatarSrc: "https://img/base.png",
    });
  });
});
