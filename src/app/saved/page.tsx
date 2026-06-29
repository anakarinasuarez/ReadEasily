import type { Metadata } from "next";
import { SavedScreen } from "@/features/saved/components";

export const metadata: Metadata = {
  title: "Saved words",
  // Private account surface — keep out of the index.
  robots: { index: false, follow: false },
};

/**
 * Saved route `/saved` — the reader's saved-word collection. This stays a Server
 * Component; the interactive, data-bound screen is the client boundary
 * (SavedScreen reads the words via TanStack Query against the MSW-mocked
 * `/api/saved` and owns the remove interaction). The app-wide QueryClient
 * provider lives in `src/app/providers.tsx` (wrapped in the root layout), so no
 * provider is duplicated here.
 */
export default function SavedPage() {
  return <SavedScreen />;
}
