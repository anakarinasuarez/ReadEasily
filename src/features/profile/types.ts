/**
 * Profile data contract — the typed shape the Profile screen consumes.
 *
 * Mirrors the Library/Saved contract style (see `src/features/saved/types.ts`):
 * the single source of truth for the seam between frontend and backend. Today
 * the bytes come from an MSW mock of `/api/profile`; later a Supabase-backed
 * `getProfile()` returns the SAME shape.
 *
 * IMPORTANT — the five reading PREFERENCES are NOT part of this payload. They
 * live in the global, persisted `usePreferences` store (`src/stores/`), because
 * they are device-local and shared with the Reader. This contract carries only
 * the user identity and the derived learning stats.
 */

/** The signed-in user shown in the Profile header. */
export interface ProfileUser {
  /** Display name (Display/Mobile 32/40) + Avatar initials source. */
  name: string;
  /** Account email — first half of the header meta line. */
  email: string;
  /** Avatar image; falls back to initials when absent/failed (Avatar primitive). */
  avatarSrc?: string;
  /** ISO timestamp the account was created — rendered as "Joined June 2026". */
  joinedAt: string;
}

/**
 * The four header stat tiles. `wordsSaved` / `practiceSets` are DERIVED from the
 * saved-words list on the server (via `deriveSavedStats`, the same function the
 * Saved screen uses, so the tiles can never drift). `inProgress` / `finished`
 * are placeholders (0) until a reading-progress model exists.
 */
export interface ProfileStats {
  /** Words the reader has saved = `deriveSavedStats(words).wordsToReview`. */
  wordsSaved: number;
  /** Words with ready practice sentences = `deriveSavedStats(words).practiceSets`. */
  practiceSets: number;
  /** Stories started but not finished. Placeholder 0 — no progress model yet. */
  inProgress: number;
  /** Stories completed. Placeholder 0 — no progress model yet. */
  finished: number;
}

/** The full payload `getProfile()` returns. */
export interface ProfileData {
  user: ProfileUser;
  stats: ProfileStats;
}
