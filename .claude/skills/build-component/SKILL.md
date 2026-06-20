---
name: build-component
description: Step-by-step recipe (SOP) for building one UI component to the project's Definition of Done. Use when creating or updating any primitive in src/ui or composite in src/components.
---

# Build a component — SOP

1. **Read the design.** Open the Figma component (`get_design_context` + `get_screenshot`). List its variants, props, states, and which tokens it uses.
2. **Pick the base.** If an accessible behavior exists, build on Radix (Switch, Dialog, DropdownMenu, Tabs…). Else semantic HTML. Never reinvent focus/keyboard handling.
3. **Scaffold colocation** in `src/ui/<name>/` (or `src/components/<name>/`):
   - `Component.tsx` — strict-typed, exported props interface, tokens-only styling.
   - `Component.stories.tsx` — one story per variant/state.
   - `Component.test.tsx` — behavior (RTL) + a11y (`jest-axe`) + keyboard.
   - `Component.figma.tsx` — Code Connect mapping.
   - `index.ts` — re-export.
4. **Wire tokens.** Use Tailwind classes that resolve to tokens; if a needed token is missing, ask tokens-engineer — don't hardcode.
5. **Verify.** `npm run lint && npm run typecheck && npm run test`. Take a Storybook/screenshot check against Figma.
6. **Done = the CLAUDE.md checklist.** If any box is unchecked, it's not done.
