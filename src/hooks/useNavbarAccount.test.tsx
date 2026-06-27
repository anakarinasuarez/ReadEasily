import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNavbarAccount } from "./useNavbarAccount";
import { useSession } from "@/stores/session";
import { useProfileOverrides } from "@/stores/profileOverrides";

/**
 * The navbar account WIRING. This replaces the old `useNavbarUser` merge test
 * and additionally locks in the two boundary fixes it now owns: the saved-count
 * fetch is GATED on the popover being open (Finding 2), and sign-out clears the
 * session + routes home.
 */

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, prefetch: vi.fn() }),
}));

const BASE = { name: "Ana", avatarSrc: undefined };
const DATA_URL = "data:image/png;base64,b3ZlcnJpZGU=";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0, gcTime: 0 } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** Count fetches to the saved endpoint so we can prove the gating. */
let fetchSpy: ReturnType<typeof vi.spyOn>;
function savedFetchCount(): number {
  return fetchSpy.mock.calls.filter((call: unknown[]) =>
    String(call[0]).includes("/api/saved"),
  ).length;
}

beforeEach(() => {
  pushMock.mockClear();
  useSession.setState({ user: null, _hasHydrated: true });
  useProfileOverrides.setState({
    avatarDataUrl: null,
    displayName: null,
    _hasHydrated: false,
  });
  fetchSpy = vi.spyOn(globalThis, "fetch");
});

afterEach(() => {
  fetchSpy.mockRestore();
});

describe("useNavbarAccount", () => {
  it("passes the base user through when no overrides are set", () => {
    const { result } = renderHook(() => useNavbarAccount(BASE), { wrapper });
    expect(result.current.user).toEqual({ name: "Ana", avatarSrc: undefined });
  });

  it("overlays the device profile overrides (name + avatar) onto the base user", () => {
    useProfileOverrides.getState().setDisplayName("Ana Lopez");
    useProfileOverrides.getState().setAvatar(DATA_URL);
    const { result } = renderHook(() => useNavbarAccount(BASE), { wrapper });
    expect(result.current.user).toEqual({
      name: "Ana Lopez",
      avatarSrc: DATA_URL,
    });
  });

  it("does NOT fetch the saved count until the popover opens (Finding 2)", async () => {
    const { result } = renderHook(() => useNavbarAccount(BASE), { wrapper });

    // Closed: the count is zero and no /api/saved request has gone out.
    expect(result.current.account.wordsSaved).toBe(0);
    expect(savedFetchCount()).toBe(0);

    // Opening the popover enables the query → the count is fetched (8 seeds).
    act(() => result.current.onAccountOpenChange(true));
    await waitFor(() => expect(result.current.account.wordsSaved).toBe(8));
    expect(savedFetchCount()).toBeGreaterThan(0);
  });

  it("omits onSignOut for a guest and provides it once signed in", () => {
    const { result, rerender } = renderHook(() => useNavbarAccount(BASE), {
      wrapper,
    });
    // Guest → nothing to sign out of.
    expect(result.current.account.onSignOut).toBeUndefined();
    expect(result.current.account.email).toBeUndefined();

    act(() => {
      useSession.getState().signIn({ name: "Ana", email: "ana@example.com" });
    });
    rerender();
    expect(result.current.account.email).toBe("ana@example.com");
    expect(typeof result.current.account.onSignOut).toBe("function");
  });

  it("sign-out clears the session and routes to /", () => {
    act(() => {
      useSession.getState().signIn({ name: "Ana", email: "ana@example.com" });
    });
    const { result } = renderHook(() => useNavbarAccount(BASE), { wrapper });

    act(() => result.current.account.onSignOut?.());

    expect(useSession.getState().user).toBeNull();
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("routes the View-profile action to /profile", () => {
    const { result } = renderHook(() => useNavbarAccount(BASE), { wrapper });
    act(() => result.current.onAccountClick());
    expect(pushMock).toHaveBeenCalledWith("/profile");
  });
});
