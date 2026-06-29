import type { Metadata } from "next";
import { ProfileScreen } from "@/features/profile/components";

export const metadata: Metadata = {
  title: "Profile",
  // Private account surface — keep out of the index.
  robots: { index: false, follow: false },
};

/**
 * Profile route `/profile` — the reader's account + reading-preferences screen.
 * This stays a Server Component; the interactive, data-bound screen is the
 * client boundary (ProfileScreen reads the user + stats via TanStack Query
 * against the MSW-mocked `/api/profile` and the five preferences from the global
 * persisted `usePreferences` store). The app-wide QueryClient provider lives in
 * `src/app/providers.tsx` (wrapped in the root layout), so no provider is
 * duplicated here.
 */
export default function ProfilePage() {
  return <ProfileScreen />;
}
