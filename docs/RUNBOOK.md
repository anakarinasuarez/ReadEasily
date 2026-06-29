# Deployment & Operations Runbook

Operational guide for shipping ReadEasily to production on **Vercel**. Keep this
honest and current — it's what a teammate follows at 2am.

## Hosting model

- **Platform:** Vercel, framework auto-detected as Next.js.
- **Production branch:** `main`. Every push to `main` that passes CI deploys to production.
- **Preview deploys:** every pull request gets its own immutable preview URL.
- **Build command:** `next build` (default). **Install:** `npm ci` from the committed lockfile.
- **Node:** pinned by [`.nvmrc`](../.nvmrc) / `engines` in `package.json`. Set the
  matching major in Vercel → Settings → Build & Development → Node.js Version.

## One-time setup (needs account access — for the repo owner)

1. **Connect the repo** to a Vercel project (import from GitHub).
2. **Environment variables** — add these in Vercel → Settings → Environment
   Variables (see [`.env.example`](../.env.example) for descriptions):
   | Variable | Scope | Notes |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | Production, Preview | Canonical origin, no trailing slash |
   | `GEMINI_API_KEY` | Production (+ Preview if wanted) | Server-only; app falls back to templates if unset |
   | `NEXT_PUBLIC_SENTRY_DSN` | Production, Preview | Enables error/Web-Vitals reporting |
   | `SENTRY_AUTH_TOKEN` | Production (build) | Secret — source-map upload only |
   | `SENTRY_ORG`, `SENTRY_PROJECT` | Production (build) | Source-map upload target |
3. **GitHub branch protection** on `main` — require the CI checks
   (`quality`, `e2e`) to pass and require a PR review before merge.
4. **Sentry project** — create it, copy the DSN + an auth token, set the vars above.

## Normal release flow

1. Branch from `main`, open a PR. CI runs typecheck · lint · test · build · e2e.
2. Review the **preview deploy** attached to the PR.
3. Merge once CI is green and the review/QA gate approves.
4. Vercel builds and promotes the new production deploy automatically.
5. Post-release smoke check (below).

## Post-release smoke check

- Home, a story detail page, and the reader load without console errors.
- Audio playback (read + listen) works; the player-bar fullscreen toggle works.
- Practicing a word returns sentences (Gemini if keyed, otherwise templates).
- `robots.txt`, `sitemap.xml`, and a story's OpenGraph image resolve.

## Rollback

Vercel keeps every previous deploy immutable, so rollback is instant and does not
require a rebuild:

1. Vercel → Project → **Deployments**.
2. Find the last known-good production deploy.
3. **⋯ → Promote to Production** (a.k.a. "Instant Rollback").

If the bad change is already merged, also revert it in git so the next deploy
doesn't reintroduce it:

```bash
git revert <bad-merge-sha> && git push
```

## Incident triage

- **Errors spiking:** check Sentry for the release; roll back first, fix second.
- **Build failing on Vercel but green locally:** confirm the Vercel Node version
  matches `.nvmrc`, and that all required env vars exist in the right scope.
- **Practice returns only template sentences:** `GEMINI_API_KEY` missing/invalid,
  or Gemini is rate-limiting — non-fatal by design, the app stays functional.

## Secrets policy

Real secrets live **only** in `.env.local` (gitignored) and Vercel's encrypted
store. Never commit a secret. If one is ever committed, rotate it immediately and
purge it from git history — do not just delete it in a new commit.
