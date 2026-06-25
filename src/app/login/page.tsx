import { LoginScreen } from "@/features/auth/components";

/**
 * Login route `/login` — the "Welcome back" auth screen. Stays a Server
 * Component; the interactive, store-bound form (`LoginScreen`) is the client
 * boundary. The session store + AuthClient it consumes need no provider beyond
 * the app-root one, so nothing is wired here.
 */
export default function LoginPage() {
  return <LoginScreen />;
}
