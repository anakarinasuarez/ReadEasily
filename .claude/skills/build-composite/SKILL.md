---
name: build-composite
description: How to build a composite (src/components/) by composing existing primitives — without reinventing them, and without the nested-interactive a11y trap. Use when building a navbar, card, row, modal, or any multi-part component from the primitive library.
---

# Build a composite — SOP

A composite ASSEMBLES primitives; it does not re-implement them.

## 1. Read the spec + Figma
Get the design-lead spec (or read Figma — see `read-figma`). List which existing `src/ui/` primitives it composes from (Button, IconButton, Avatar, Chip, Input, Toggle, Badge…).

## 2. Reuse, never reinvent
- Compose from existing primitives. If you need one that doesn't exist, **flag it for the orchestrator** — do NOT inline a one-off copy.
- If you need a token that doesn't exist (e.g. glass surface, `radius-2xl`, scrim), **flag it for tokens-engineer** — do NOT hardcode a raw value.
- Prefer composition/slots over a prop explosion (`<Card><Card.Media/></Card>`), so consumers own their layout.

## 3. The nested-interactive trap (critical a11y rule)
Never put a focusable control inside another focusable control. Concretely:
- A **toggle row** is NOT a button: wrap the label in `<label htmlFor>` so the whole label area drives the Toggle; the Toggle owns `role=switch`. The row is not itself a button.
- A **navigational row/card** IS the `<a>`/`<button>`; its inner chevrons/icons are decorative (`aria-hidden`). If a card needs a secondary action (e.g. play), make it a real nested button with `stopPropagation` AND its own `aria-label`, or make the affordance visual-only.

## 4. Build the unhappy paths
Loading (skeletons that match layout), empty, and error are part of the composite, not optional polish.

## 5. Motion + tokens
Navigation = 300ms ease-out; overlays/same-screen change = 200ms; respect `prefers-reduced-motion`. Tokens only.

## 6. Done = the DoD
Colocate `Component.tsx · stories · test (behavior + jest-axe) · figma.tsx · index.ts`. Verify `lint && typecheck && test`. Then review (`review-component`) before merge.
