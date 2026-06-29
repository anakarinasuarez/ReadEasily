import type { Metadata } from "next";
import { LibraryScreen } from "@/features/library/components";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Browse short illustrated English stories graded A1–C1 — fables, travel, daily life, and technology. Read, listen, and learn at your level.",
  alternates: { canonical: "/library" },
  openGraph: { url: "/library", title: "Library · ReadEasily" },
};

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
