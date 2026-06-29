<div align="center">

# 📖 ReadEasily

**Learn English through short, illustrated stories — read · listen · translate · save words · practice.**

A warm, cozy reading app built 1:1 from a Figma design system into a fully tested Next.js app.

[![CI](https://github.com/anakarinasuarez/ReadEasily/actions/workflows/ci.yml/badge.svg)](https://github.com/anakarinasuarez/ReadEasily/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)
![Tests](https://img.shields.io/badge/tests-619%20passing-3fb950)

</div>

---

## ✨ What it does

- **Read** short stories graded by CEFR level (A1–C1), with cozy illustrations.
- **Listen** to each story read aloud, with a synchronized, accessible player.
- **Translate** and **save** unfamiliar words as you go.
- **Practice** saved words with example sentences generated on the fly.

## 🧱 Stack

- **Next.js 16** (App Router · React Server Components) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** with design tokens generated from Figma
- **Radix UI** primitives · **Storybook** for the component library
- **Vitest + React Testing Library** (unit/behavior) · **Playwright** (e2e) · **jest-axe** (a11y)
- **MSW** for deterministic, mock-backed data in dev, tests and e2e
- Practice sentences via **Google Gemini Flash** (with a zero-cost template fallback)
- Deployed on **Vercel** · errors & Web Vitals via **Sentry**

## 🚀 Getting started

Requires the Node version in [`.nvmrc`](.nvmrc) and npm 10.

```bash
nvm use                       # Node 20.20.2
npm ci                        # install exact, locked dependencies
cp .env.example .env.local    # then fill in values (all optional for dev)
npm run dev                   # → http://localhost:3000
```

> The app runs fully **without any secrets**: Gemini falls back to template
> sentences and Sentry is a no-op until a DSN is set. See
> [`.env.example`](.env.example) for every variable and what it does.

## 📜 Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build (SSG/RSC) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run test` | Vitest unit/component suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run e2e` | Playwright end-to-end journeys |
| `npm run storybook` | Storybook on :6006 |

## 🗂️ Architecture

Feature-sliced with colocation — a component lives with everything it owns
(`Component.tsx · .stories.tsx · .test.tsx · .figma.tsx · index.ts`).

```
src/
  tokens/        # generated from Figma — do not hand-edit
  ui/            # primitives (button, input, toggle, chip …) — 1:1 with Figma
  components/    # composites (navbar, player-bar, book-cover …)
  features/      # vertical slices: auth, library, reader, search, saved, profile, practice
  lib/           # supabase, audio, i18n, site, utils
  content/       # server-readable story catalog (SEO/SSG)
src/app/         # App Router routes = the prototype made real
e2e/             # Playwright journeys
tests/           # setup + MSW mocks
```

Build order is never skipped: `tokens → ui → composites → features → flows → e2e`.

## ✅ Quality gates (Definition of Done)

Every change must pass, locally and in CI:

- TypeScript strict (no `any`) · matches Figma · uses tokens, never hardcoded values
- Storybook story for all variants/states · behavior test (RTL) · a11y test (jest-axe) + keyboard + visible focus (AA)
- `lint`, `typecheck`, `test`, `build` green

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs all of these
plus the Playwright journeys on every pull request and on `main`.

## 🚢 Deployment

Hosted on **Vercel** — every PR gets a preview deploy, `main` is production. See
the **[deployment & rollback runbook](docs/RUNBOOK.md)** for the full procedure,
required environment variables, and how to roll back.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch/PR workflow and the
specialist-agent roster that builds this app.
