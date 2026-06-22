import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The Library mock serves cozy token-colored placeholder covers as local
    // SVGs from /public/covers (offline-deterministic, no external image host).
    // next/image's optimizer refuses SVG by default, so opt in — but lock it
    // down: serve as an attachment under a sandboxed CSP so an SVG can never
    // execute script or be treated as an inline document. Real Supabase Storage
    // art (raster) will not need this; revisit when covers move off /public.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
