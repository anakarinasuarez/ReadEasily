import type { SessionUser } from "@/stores/session";
import type {
  AuthError,
  SignInInput,
  SignUpInput,
} from "@/features/auth/types";

/**
 * Auth client contract — the single seam between the auth screens and "the
 * backend". Today it's a local, in-memory mock (no datastore, no real
 * credentials); later this same interface gets a Supabase-backed implementation
 * and EVERY caller stays identical (see the swap point at the bottom).
 *
 * The client owns the network/mock call and validation-of-shape; on success a
 * screen takes the returned `SessionUser` and calls `useSession.signIn(user)`.
 * Failures reject with an `AuthError` so screens can render field/form errors.
 */
export interface AuthClient {
  /** Create an account and return the new session user. */
  signUp(input: SignUpInput): Promise<{ user: SessionUser }>;
  /** Sign in with email + password and return the session user. */
  signInWithPassword(input: SignInInput): Promise<{ user: SessionUser }>;
  /** End the backend session (local store clear is the caller's job). */
  signOut(): Promise<void>;
  /** Kick off a password-reset email. Resolves whether or not it "sent". */
  resetPasswordForEmail(email: string): Promise<void>;
}

/** Build a typed `AuthError` for rejection. */
function authError(code: AuthError["code"], message: string): AuthError {
  return { code, message };
}

/**
 * Derive a friendly display name from an email local part: take everything
 * before "@", split on `.`, `_` or `-`, drop empties, and title-case each piece.
 *   "ana.lopez@x.com"   → "Ana Lopez"
 *   "maria_jose-r@x.io" → "Maria Jose R"
 *   "bob@x.com"         → "Bob"
 * Falls back to "Reader" if the local part has no usable characters.
 */
export function deriveNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] ?? "";
  const words = localPart
    .split(/[._-]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
  return words.length > 0 ? words.join(" ") : "Reader";
}

/** Tiny artificial latency so screens can exercise pending/loading states. */
const MOCK_LATENCY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Portfolio mock AuthClient. It is NOT a datastore: it accepts ANY well-formed
 * credentials and never persists a password. Real validation (email format,
 * password strength, "email already taken") belongs in the screens / the future
 * Supabase client — the mock only guards SHAPE so the error path is still
 * exercisable: blank email or password rejects with an `AuthError`.
 */
export const mockAuthClient: AuthClient = {
  async signUp({ name, email, password }) {
    await delay(MOCK_LATENCY_MS);
    if (email.trim().length === 0) {
      throw authError("invalid_email", "Enter your email address.");
    }
    if (password.length === 0) {
      throw authError("weak_password", "Choose a password.");
    }
    // Prefer the typed-in name; fall back to deriving from the email so a user
    // always has a sensible display name.
    const resolvedName =
      name.trim().length > 0 ? name.trim() : deriveNameFromEmail(email);
    return { user: { name: resolvedName, email } };
  },

  async signInWithPassword({ email, password }) {
    await delay(MOCK_LATENCY_MS);
    if (email.trim().length === 0 || password.length === 0) {
      throw authError(
        "invalid_credentials",
        "Enter your email and password.",
      );
    }
    return { user: { name: deriveNameFromEmail(email), email } };
  },

  async signOut() {
    await delay(MOCK_LATENCY_MS);
  },

  async resetPasswordForEmail(email) {
    // Touch the input so a caller can't pass nothing by mistake, but always
    // resolve: we never reveal whether an address actually has an account.
    void email;
    await delay(MOCK_LATENCY_MS);
  },
};

/**
 * The single auth client the app uses. Today it's the mock.
 *
 * SUPABASE SWAP POINT — later this becomes the Supabase-backed implementation:
 *   export const authClient: AuthClient = supabaseAuthClient;
 * `supabaseAuthClient` wraps `supabase.auth.signUp` / `signInWithPassword` /
 * `signOut` / `resetPasswordForEmail`, maps Supabase errors onto our
 * `AuthError` codes, and maps the Supabase user onto `SessionUser`. The
 * `AuthClient` interface and every caller stay identical — only this binding
 * changes.
 */
export const authClient: AuthClient = mockAuthClient;
