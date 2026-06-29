import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Baseline security headers applied to every response. These are the
// non-breaking, always-safe set. A strict, nonce-based Content-Security-Policy
// is intentionally NOT here — it requires middleware + per-request nonces and
// careful testing, and is owned by the security-engineer pass. Add it there.
const securityHeaders = [
  // Force HTTPS for two years, including subdomains; eligible for the preload list.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Don't let browsers MIME-sniff a response into a different content type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send only the origin on cross-origin navigations — no path/query leakage.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disallow framing entirely (clickjacking protection); a CSP frame-ancestors
  // directive will reinforce this once the CSP lands.
  { key: "X-Frame-Options", value: "DENY" },
  // Drop powerful features the app never uses.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Covers are raster WebP served from /public/covers via next/image, which the
  // optimizer handles natively — no SVG opt-in needed. (The previous
  // `images.dangerouslyAllowSVG` block existed only for the old placeholder SVG
  // covers; removed once covers became WebP. Re-add a locked-down SVG policy
  // only if SVGs are ever routed through next/image again.)
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Wrap with Sentry. Without SENTRY_AUTH_TOKEN/org/project this only enables the
// runtime SDK (no source-map upload), and `silent` keeps the build quiet
// outside CI. The runtime SDK itself is a no-op without a DSN.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Route Sentry requests through our own origin so ad-blockers don't drop them.
  tunnelRoute: "/monitoring",
});
