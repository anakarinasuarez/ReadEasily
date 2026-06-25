/**
 * Auth navigation targets — the destinations the three auth screens push to.
 * Kept as named constants (not inline strings) so the post-auth landing and the
 * Back target are defined once and easy to repoint when the route swap phase
 * moves the Library off `/`.
 */

/**
 * Where a user lands after a successful sign-up / log-in. The Library screen
 * will live here after the next phase; the constant exists now so the auth flow
 * is wired to the right place even though the route is not mounted yet.
 */
export const READING_HOME = "/library";

/** Back target from the auth shell — the marketing landing page. */
export const LANDING = "/";

/** Sign-up route — the Landing's "Start reading" CTA opens this (the auth entry
 *  point). From here the Log in tab/link reaches `/login`. */
export const SIGNUP = "/signup";
