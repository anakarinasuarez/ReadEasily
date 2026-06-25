import { LandingScreen } from "@/features/auth/components";

/**
 * Landing route `/welcome` — the guest-friendly marketing front door. Stays a
 * Server Component; the interactive, store-bound `LandingScreen` (language
 * selector + CTA) is the client boundary.
 *
 * Mounted at `/welcome` for now so it does not collide with the Library at `/`;
 * the route-swap phase later moves the Landing to `/`.
 */
export default function WelcomePage() {
  return <LandingScreen />;
}
