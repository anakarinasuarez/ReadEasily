/**
 * Shared client-side validation for the auth screens (Log-in / Sign-up /
 * Forgot). One source of truth so the three forms agree on what "valid" means
 * and the messages stay consistent. Each `validate*` returns `undefined` when
 * the value is acceptable, or the user-facing error string to feed straight
 * into the Input `errorMessage` prop. Unit-tested in `validation.test.ts`.
 */

/**
 * Standard, pragmatic email shape: one or more non-space/non-`@` chars, an
 * `@`, a domain, a dot, and a TLD. Deliberately NOT RFC-5322-exhaustive —
 * client-side email validation only needs to catch obvious typos; the backend
 * (and the real reset/confirm email) is the true authority.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Minimum password length for sign-up (Figma + handoff: 8 characters). */
export const MIN_PASSWORD_LENGTH = 8;

/** True when `value` looks like a well-formed email address. */
export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/** Required-email + format check. Returns the error message, or `undefined`. */
export function validateEmail(value: string): string | undefined {
  if (value.trim().length === 0) return "Enter your email address.";
  if (!isValidEmail(value)) return "Enter a valid email address.";
  return undefined;
}

/** Non-empty required field with a caller-supplied message. */
export function validateRequired(
  value: string,
  message: string,
): string | undefined {
  return value.trim().length === 0 ? message : undefined;
}

/** Sign-up password: present and at least `MIN_PASSWORD_LENGTH` characters. */
export function validateNewPassword(value: string): string | undefined {
  if (value.length === 0) return "Choose a password.";
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return undefined;
}
