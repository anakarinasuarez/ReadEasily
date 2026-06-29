# Contributing to ReadEasily

## Principles

- **Figma is the source of truth.** Build 1:1 with the design system; use design
  **tokens**, never hardcoded colors/sizes/spacing.
- **Never skip a layer:** `tokens → ui → composites → features → flows → e2e`.
- **Spec before build, QA after.** Resolve ambiguity with the design-lead or the
  user — never guess silently.

## Workflow

1. Branch from `main` using a conventional prefix:
   `feat/…`, `fix/…`, `chore/…`, `refactor/…`, `test/…`, `docs/…`.
2. Make the change with its tests and (for components) its Storybook story.
3. Run the gates locally before pushing:
   ```bash
   npm run typecheck && npm run lint && npm run test && npm run build
   ```
4. Open a PR. CI must be green and the Definition of Done met before merge.
5. Use [Conventional Commits](https://www.conventionalcommits.org/) for messages
   (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`).

## Definition of Done

See [README → Quality gates](README.md#quality-gates-definition-of-done). In
short: strict types, Figma fidelity via tokens, story + behavior test + a11y test,
keyboard + visible focus (AA), and all gates green.

## Secrets

Never commit secrets. Copy `.env.example` to `.env.local` (gitignored) for local
values. Production secrets go in Vercel's environment-variable store. See the
[runbook](docs/RUNBOOK.md#secrets-policy).

## The specialist agent roster

This app is built by a team of specialist AI agents (defined in `.claude/agents/`),
orchestrated through a fixed pipeline:

**design-lead** (spec) → **tokens-engineer** → **ui-primitive-builder** ‖
**backend-engineer** → **feature-builder** → **test-engineer** →
**design-lead** (QA) + **code-reviewer** (adversarial merge gate).

Cross-cutting hardening is owned by **devops-engineer** (CI/CD, deploy,
infrastructure), **security-engineer** (security posture), and **story-writer**
(reading content). Nothing merges until `code-reviewer` confirms the Definition
of Done and `design-lead` confirms Figma fidelity.
