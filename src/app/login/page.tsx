import type { Metadata } from "next";
import { LoginScreen } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Log in",
  // Auth utility route — no SEO value.
  robots: { index: false, follow: false },
};

/**
 * Login route `/login` — the "Welcome back" auth screen. Stays a Server
 * Component; the interactive, store-bound form (`LoginScreen`) is the client
 * boundary. The session store + AuthClient it consumes need no provider beyond
 * the app-root one, so nothing is wired here.
 */
export default function LoginPage() {
  return <LoginScreen />;
}
