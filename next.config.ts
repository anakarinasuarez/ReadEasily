import type { NextConfig } from "next";

// Covers are raster WebP served from /public/covers via next/image, which the
// optimizer handles natively — no SVG opt-in needed. (The previous
// `images.dangerouslyAllowSVG` block existed only for the old placeholder SVG
// covers; removed once covers became WebP. Re-add a locked-down SVG policy only
// if SVGs are ever routed through next/image again.)
//
// Forward-looking: when covers move from /public to Supabase Storage, set
// NEXT_PUBLIC_SUPABASE_URL and next/image will optimize those off-origin URLs
// automatically — no code change. Until then `images` stays default.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  ...(supabaseHost
    ? {
        images: {
          remotePatterns: [
            {
              protocol: "https",
              hostname: supabaseHost,
              pathname: "/storage/**",
            },
          ],
        },
      }
    : {}),
};

export default nextConfig;
