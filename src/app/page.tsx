import { LandingScreen } from "@/features/auth/components";

/**
 * Home route `/` — the marketing Landing (welcome / value-prop), the app's
 * front door in the guest-friendly model. Stays a Server Component; the
 * interactive screen (language picker, BookShowcase, "Start reading" → /library)
 * is the client boundary. The reading home (catalog) lives at `/library`.
 */
export default function Home() {
  return <LandingScreen />;
}
