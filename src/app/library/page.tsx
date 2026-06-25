import { LibraryScreen } from "@/features/library/components";

/**
 * Library route `/library` — the reading home (catalog landing). Stays a Server
 * Component; the interactive, data-bound screen is the client boundary
 * (LibraryScreen reads the catalog via TanStack Query against the MSW-mocked
 * `/api/library`). The marketing Landing lives at `/`; this is where
 * "Start reading" and the post-auth redirect land.
 */
export default function LibraryPage() {
  return <LibraryScreen />;
}
