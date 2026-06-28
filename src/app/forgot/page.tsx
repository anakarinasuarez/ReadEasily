import type { Metadata } from "next";
import { ForgotPasswordScreen } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Reset your password",
  // Auth utility route — no SEO value.
  robots: { index: false, follow: false },
};

/**
 * Forgot-password route `/forgot` — the reset-link request screen, a sub-flow
 * of Log-in. Server Component shell rendering the client `ForgotPasswordScreen`.
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
