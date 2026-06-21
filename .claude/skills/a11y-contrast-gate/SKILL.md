---
name: a11y-contrast-gate
description: The static WCAG contrast test pattern that covers axe's blind spot (jsdom applies no CSS, so axe can't check color contrast). Use when adding any token pair that renders text on a colored background, or to verify the design system meets AA.
---

# Static contrast gate — SOP

## Why it exists
jest-axe runs in jsdom, which applies **no CSS**, so axe's color-contrast rule is a no-op — a tone that fails AA still passes the component a11y test (false green). This caught three Badge tones shipping below AA. The fix is a pure-math gate over the real token values.

## The pattern (see `src/tokens/contrast.test.ts`)
1. Read `src/tokens/colors.css`, parse the first `:root { … }` block into a `--name → value` map.
2. Resolve `var(--x)` references (up to ~5 levels) down to a `#hex`.
3. Compute WCAG relative luminance + contrast ratio:
   ```
   channel: v/255 → (v≤0.03928 ? v/12.92 : ((v+0.055)/1.055)^2.4)
   L = 0.2126*R + 0.7152*G + 0.0722*B
   ratio = (max(L1,L2)+0.05) / (min(L1,L2)+0.05)
   ```
4. Assert each shipped text/background pair: **≥ 4.5** for normal text, **≥ 3.0** for large/bold-≥18.66px or UI components/focus rings.

## When to use it
- Adding a new Badge tone, button variant, or any "text on colored bg" → add the pair to the gate.
- Computing an "AA-safe" color → check it against the **actual background it ships on**, not against canvas/white. (The original danger/warning values were computed vs white and failed on their subtle backgrounds.)
- Decorative-only color (status dots, dividers) → label and skip; meaning must live in text, not color.

## Rule of thumb
If a value can fail contrast, axe-in-jsdom will not tell you. The static gate is the source of truth for AA.
