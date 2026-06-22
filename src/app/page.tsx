import { LibraryScreen } from "@/features/library/components";

/**
 * Home route `/` — the Library landing. This stays a Server Component; the
 * interactive, data-bound screen is the client boundary (LibraryScreen reads
 * the catalog via TanStack Query against the MSW-mocked `/api/library`). The
 * route's only job is to mount it.
 */
export default function Home() {
  return <LibraryScreen />;
}
