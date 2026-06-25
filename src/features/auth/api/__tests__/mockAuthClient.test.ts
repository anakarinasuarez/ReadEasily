import { describe, it, expect } from "vitest";
import {
  mockAuthClient,
  authClient,
  deriveNameFromEmail,
} from "../authClient";
import { isAuthError } from "@/features/auth/types";

/**
 * Mock AuthClient behavior tests. The mock is a portfolio stand-in (no
 * datastore): it returns a SessionUser for any well-formed credentials, derives
 * display names from emails, and rejects blank input with a typed AuthError so
 * screens can exercise the error path. We also assert the exported `authClient`
 * is wired to the mock today (the Supabase swap point).
 */

describe("authClient — wiring", () => {
  it("exports the mock as the active authClient today", () => {
    expect(authClient).toBe(mockAuthClient);
  });
});

describe("deriveNameFromEmail", () => {
  it("title-cases a single local part", () => {
    expect(deriveNameFromEmail("bob@x.com")).toBe("Bob");
  });

  it("splits on a dot and title-cases each piece", () => {
    expect(deriveNameFromEmail("ana.lopez@x.com")).toBe("Ana Lopez");
  });

  it("splits on dot, underscore and hyphen together", () => {
    expect(deriveNameFromEmail("maria_jose-r@x.io")).toBe("Maria Jose R");
  });

  it("lowercases the tail of each piece", () => {
    expect(deriveNameFromEmail("ANA.LOPEZ@x.com")).toBe("Ana Lopez");
  });

  it("drops empty pieces from repeated separators", () => {
    expect(deriveNameFromEmail("ana..lopez@x.com")).toBe("Ana Lopez");
  });

  it("falls back to Reader when the local part is empty", () => {
    expect(deriveNameFromEmail("@x.com")).toBe("Reader");
  });
});

describe("mockAuthClient — signUp", () => {
  it("returns a SessionUser using the provided name", async () => {
    const { user } = await mockAuthClient.signUp({
      name: "Ana Lopez",
      email: "ana@x.com",
      password: "hunter2",
    });
    expect(user).toEqual({ name: "Ana Lopez", email: "ana@x.com" });
  });

  it("derives the name from the email when name is blank", async () => {
    const { user } = await mockAuthClient.signUp({
      name: "   ",
      email: "ana.lopez@x.com",
      password: "hunter2",
    });
    expect(user).toEqual({ name: "Ana Lopez", email: "ana.lopez@x.com" });
  });

  it("rejects a blank email with an invalid_email AuthError", async () => {
    await expect(
      mockAuthClient.signUp({ name: "Ana", email: "  ", password: "hunter2" }),
    ).rejects.toMatchObject({ code: "invalid_email" });
  });

  it("rejects a blank password with a weak_password AuthError", async () => {
    await expect(
      mockAuthClient.signUp({ name: "Ana", email: "ana@x.com", password: "" }),
    ).rejects.toMatchObject({ code: "weak_password" });
  });
});

describe("mockAuthClient — signInWithPassword", () => {
  it("returns a SessionUser with the derived name", async () => {
    const { user } = await mockAuthClient.signInWithPassword({
      email: "ana.lopez@x.com",
      password: "hunter2",
    });
    expect(user).toEqual({ name: "Ana Lopez", email: "ana.lopez@x.com" });
  });

  it("rejects blank credentials with an invalid_credentials AuthError", async () => {
    await expect(
      mockAuthClient.signInWithPassword({ email: "", password: "" }),
    ).rejects.toMatchObject({ code: "invalid_credentials" });
  });

  it("rejects a blank password with an invalid_credentials AuthError", async () => {
    await expect(
      mockAuthClient.signInWithPassword({ email: "ana@x.com", password: "" }),
    ).rejects.toMatchObject({ code: "invalid_credentials" });
  });

  it("rejects with a value that passes the isAuthError guard", async () => {
    try {
      await mockAuthClient.signInWithPassword({ email: "", password: "" });
      throw new Error("expected rejection");
    } catch (err) {
      expect(isAuthError(err)).toBe(true);
    }
  });
});

describe("mockAuthClient — resetPasswordForEmail & signOut", () => {
  it("resolves resetPasswordForEmail for any address", async () => {
    await expect(
      mockAuthClient.resetPasswordForEmail("ana@x.com"),
    ).resolves.toBeUndefined();
  });

  it("resolves signOut", async () => {
    await expect(mockAuthClient.signOut()).resolves.toBeUndefined();
  });
});
