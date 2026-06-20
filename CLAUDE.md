# ReadEasily — Project Guide

ReadEasily is a warm, cozy app for learning English through short illustrated stories
(read + listen + translate + save words + practice). We are porting a **complete Figma
design system** into a **tested Next.js app**. The Figma file is the source of truth.

## Source of truth (Figma)
- **File key:** `sc9DIhX0wvFgrvmL8NVBf5`
- **Foundations** → design tokens (125 variables, 22 text styles).
- **Components** → component library (build 1:1).
- **Screens** → 48 screens/overlays in 4 sections: Onboarding · Browse & Read · Saved & Profile · Overlays.
- **🔗 Prototype** → interaction & flow spec (what navigates where, transitions).
- **📋 Handoff & Specs** → motion system, state matrix, responsive rules, accessibility.
- Read design via the Figma MCP (`get_variable_defs`, `get_design_context`, `get_screenshot`). Load schemas with ToolSearch first.

## Stack
- **Installed:** Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · ESLint.
- **Add per phase:** Radix UI (accessible primitives) · Storybook · Vitest + React Testing Library · Playwright (e2e) · @axe-core / jest-axe · next-intl · TanStack Query · Zustand · MSW.

## Architecture (feature-sliced + colocation)
```
src/
  tokens/        # generated from Figma — DO NOT edit by hand
  ui/            # primitives (button/, input/, toggle/ …) — 1:1 with Figma Components
  components/    # composites (navbar/, book-cover/, settings-row/, modal/ …)
  features/      # auth/ library/ reader/ search/ saved/ profile/ practice/
                 #   each: components/ hooks/ api/ types.ts __tests__/
  lib/           # supabase, audio, i18n, utils
  hooks/         # shared hooks
src/app/         # routes (App Router) = the prototype made real
e2e/             # Playwright
tests/           # setup + MSW mocks
```
**Colocation rule:** a component lives with everything it owns:
`Button.tsx · Button.stories.tsx · Button.test.tsx · Button.figma.tsx · index.ts`.

## Build order (prompt chaining — never skip a layer)
`tokens → ui primitives → composites → features → flows → e2e`
(mirrors Figma: Foundations → Components → Screens → Prototype)

## Definition of Done (gate for every component/feature)
- [ ] TypeScript strict, no `any`
- [ ] Matches Figma; uses **tokens**, never hardcoded values
- [ ] Storybook story covering all variants/states
- [ ] Behavior test (Vitest + RTL) — tests behavior, not implementation
- [ ] a11y test passes (jest-axe) + keyboard + visible focus (AA)
- [ ] `npm run lint` and `npm run typecheck` green
- [ ] (component) Figma Code Connect mapping (`*.figma.tsx`)

## Design rules (from 📋 Handoff & Specs)
- **Motion:** navigation = 300ms ease-out · overlays = 200ms · same-screen state change = morph + preserve scroll.
- **A11y (AA):** muted text → `ink/500`; interactive terracotta → `accent-strong`; info → `sky/700`; success → `forest/700`.
- **Responsive:** mobile = responsive variants, not separate rebuilds.
- **Back nav:** breadcrumb-back pattern (`‹ destination`).

## Commands
- `npm run dev` · `npm run build` · `npm run lint`
- (added later) `npm run typecheck` · `npm run test` · `npm run storybook` · `npm run e2e`

## Orchestration

### The team (senior roster)
- **design-lead** — senior UX/UI: writes the build spec from Figma before a build, design-QAs after.
- **tokens-engineer** — senior design-systems: owns `src/tokens/`, the value contract.
- **ui-primitive-builder** — senior frontend: one accessible primitive per run.
- **feature-builder** — senior product-frontend: one feature vertical slice per run.
- **backend-engineer** — senior backend: Supabase schema, RLS, auth, storage, the typed contract.
- **test-engineer** — senior QA: behavior/e2e/a11y, the safety net.
- **code-reviewer** — adversarial merge gate.

### Pipeline
**design-lead (spec) → tokens-engineer → ui-primitive-builder (parallel) ‖ backend-engineer → feature-builder (parallel, via git worktrees) → test-engineer → design-lead (QA) + code-reviewer (adversarial gate)**.
Parallel agents each work on their own branch in a separate `git worktree`. Nothing merges until `code-reviewer` confirms the Definition of Done and `design-lead` confirms Figma fidelity.

### Leadership doctrine (how the orchestrator — the main loop — leads)
The main loop is the senior AI engineer who runs this team. It does not do specialist work it has an agent for; it sets direction, delegates, integrates, and guards quality.
- **Never skip a layer.** `tokens → ui → composites → features → flows → e2e`. A builder that starts without its dependency produces rework.
- **Spec before build, QA after.** A feature gets a design-lead spec going in and a design-lead QA coming out. Ambiguity is resolved with the user or the design-lead, never guessed silently.
- **Delegate to the right specialist; parallelize the independent.** Independent primitives/features run concurrently in worktrees. Dependent work waits.
- **Contracts between agents, not assumptions.** Frontend and backend agree on the typed contract before either ships. The orchestrator owns that handoff.
- **The gate is real.** `code-reviewer` defaults to REQUEST CHANGES; the orchestrator routes the punch-list back to the builder and re-reviews — it does not wave work through.
- **Integrate and report honestly.** The orchestrator merges, keeps the build green, and tells the user what's done, what's assumed, and what failed — plainly.
