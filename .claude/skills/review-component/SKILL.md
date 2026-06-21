---
name: review-component
description: How to adversarially review a component before merge (the merge gate). Encodes what the code-reviewers caught this project — token fidelity, AA, weak tests, and the jsdom blind spots that make green tests lie. Use after ANY builder finishes, before merge.
---

# Review a component — adversarial SOP

You are the merge gate. Find problems, don't be nice. Default to **REQUEST CHANGES** if uncertain.

## 1. Verify the gates YOURSELF (don't trust the builder's claim)
Run in the worktree: `npm --prefix <wt> run lint && ... typecheck && ... test`. Report the actual results.

## 2. Token fidelity
`grep -nE '#[0-9a-fA-F]{3,6}|rgb\(|rgba\(|\b[0-9]+px' <Component>.tsx`. Every color/space/radius/font must come from a token (`var(--…)` or a `@theme` utility). The ONLY acceptable literals are geometry the system genuinely doesn't tokenize (control heights, icon boxes, decorative dot sizes) and matches Figma — judge each; flag the rest.

## 3. The jsdom blind spots — THE lesson (green tests lie here)
jsdom applies **no CSS**, so the automated gates miss whole classes of bugs. Check these by READING the code, not by trusting axe:
- **Contrast:** axe's color-contrast rule is a no-op in jsdom. Never check "AA contrast" off a passing axe test — use the static contrast gate (see `a11y-contrast-gate`).
- **Visibility vs opacity:** `visibility:hidden`/`display:none` remove the accessible name; a loading control must keep its name (use `opacity-0`). jsdom sees the class as inert text, so axe passes either way — read it.
- **Geometry/layout:** transforms, `translate-x` (NOT additive in Tailwind), reflow from border thickness — jsdom computes none of it. Verify by reading the values.
- **Forced-colors/High-Contrast:** box-shadow-only focus rings vanish; require a real `outline` on `:focus-visible`.

## 4. Accessibility (AA)
Semantic element/role; labels; `:focus-visible` 2px `--focus-ring` + offset (never plain `:focus`); keyboard; aria-invalid/describedby/busy as needed; decorative bits `aria-hidden`; no nested interactive controls.

## 5. Test quality
Could the code be broken and the tests still pass? Flag any assertion that proves nothing, mocks the thing under test, or couples to implementation.

## 6. Output
`APPROVE` or `REQUEST CHANGES` + numbered issues: `file:line · blocking/non-blocking · what · why it matters · suggested fix`. Route the punch-list back to the builder, then re-review.
