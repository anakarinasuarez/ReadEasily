import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Covers are raster WebP served from /public/covers via next/image, which the
  // optimizer handles natively — no SVG opt-in needed. (The previous
  // `images.dangerouslyAllowSVG` block existed only for the old placeholder SVG
  // covers; removed once covers became WebP. Re-add a locked-down SVG policy
  // only if SVGs are ever routed through next/image again.)
};

export default nextConfig;
