/**
 * Auth feature types — the shared shapes the auth screens, the AuthClient, and
 * the session store agree on. `SessionUser` itself lives in the session store
 * (the device-local identity); we re-export it here so auth consumers have one
 * import surface.
 */

export type { SessionUser } from "@/stores/session";

/** Machine-readable cause for an auth failure, so screens can map to UI. */
export type AuthErrorCode =
  | "invalid_credentials"
  | "email_taken"
  | "weak_password"
  | "invalid_email"
  | "unknown";

/**
 * The error shape the AuthClient rejects with. A plain object (not an Error
 * subclass) so it serializes cleanly across the TanStack Query / network seam
 * and a screen can switch on `code` to render a field-level or form-level
 * message. `isAuthError` narrows an unknown rejection to this shape.
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

/** Type guard — narrows an unknown thrown/rejected value to an `AuthError`. */
export function isAuthError(value: unknown): value is AuthError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  );
}

/** Input for a sign-up attempt. */
export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

/** Input for a password sign-in attempt. */
export interface SignInInput {
  email: string;
  password: string;
}
