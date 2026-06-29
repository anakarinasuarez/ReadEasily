import type { Metadata } from "next";
import { SignupScreen } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Create your account",
  // Auth utility route — no SEO value.
  robots: { index: false, follow: false },
};

/**
 * Signup route `/signup` — the "Create your account" auth screen. Server
 * Component shell rendering the client `SignupScreen` (the store-bound form).
 */
export default function SignupPage() {
  return <SignupScreen />;
}
