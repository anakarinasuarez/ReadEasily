# ReadEasily — Design Tokens

Single source of design values for the whole app. **Generated from Figma — never
hand-pick a hex, size, or radius anywhere else in the codebase.**

- **Figma file:** `sc9DIhX0wvFgrvmL8NVBf5`
- **Figma page:** 🎨 Foundations (125 variables, 22 text styles, light + dark modes)

## Files

| File | Holds | Themed |
| --- | --- | --- |
| `colors.css` | primitive scales + semantic color tokens | light + dark |
| `spacing.css` | `--space-*` scale | no |
| `radius.css` | `--radius-*` scale | no |
| `typography.css` | font families, weights, 22 text styles | no |
| `shadows.css` | `--shadow-*` effect tokens | light + dark |

Each text style is exposed as five sub-properties so a component maps 1:1 with
Figma: `--text-<style>-family / -size / -weight / -line-height / -tracking`.

## Two-layer model

1. **Primitives** — `--color-<hue>-<step>` (e.g. `--color-terracotta-500`). The raw
   palette. Components must **not** consume these directly.
2. **Semantic** — `--text-*`, `--bg-*`, `--border-*`, `--feedback-*`. These reference
   primitives and are what UI consumes. Theme switching only re-points the semantic
   layer; primitive scales are theme-independent.

### Semantic aliases published

```
text/      primary  secondary  muted  accent  on-accent
bg/        canvas  subtle  elevated  accent  accent-hover  accent-strong  accent-subtle
border/    default  strong  accent
feedback/  success  success-subtle  info  info-subtle
           warning  warning-solid  warning-subtle  danger  danger-subtle
focus/     focus-ring
```

`--bg-accent-hover` (#c0703f) is Button-Primary / Chip-Selected hover.
`--focus-ring` aliases `--border-accent` (#d66c44) — no focus token exists in
Figma, but design law requires an AA-visible 2px ring across primitives.
Chip padding ships as named off-scale tokens `--space-chip-x` (14px) /
`--space-chip-y` (7px) rather than rounding onto the 4/8/12/16/24 ramp.

### AA decisions baked in (from 📋 Handoff & Specs)

| Intent | Token | Resolves to |
| --- | --- | --- |
| muted text | `--text-muted` | `--color-ink-500` (#876b4f) |
| interactive terracotta | `--bg-accent-strong` | `--color-terracotta-700` (#b35029) |
| info | `--feedback-info` | `--color-sky-700` (#3d6082) |
| success | `--feedback-success` | `--color-forest-700` (#5e7b3a) |
| warning text | `--feedback-warning` | #8a5a14 (~5.0:1 on `warning-subtle`) |
| danger text/border | `--feedback-danger` | #bf4636 (~5.0:1 on canvas) |

Use `--bg-accent-strong` for interactive terracotta — **never** raw `terracotta-500`.

#### AA overrides of Figma raw values ([D-AA])

Two feedback colors ship at AA-safe values that differ from the Figma raw,
because the raw values fail WCAG AA at the sizes the components use:

- **`--feedback-warning` = #8a5a14** (not Figma raw **#e0a838**). The raw amber
  is ~1.6:1 as text on `--feedback-warning-subtle` (#faebc4) — a hard fail.
  #8a5a14 clears **~5.0:1**. The raw amber is preserved as
  **`--feedback-warning-solid` (#e0a838)** for the *decorative* status dot only
  (the label carries the meaning, so the dot need not meet text contrast).
- **`--feedback-danger` = #bf4636** (not Figma raw **#cc5a4a**). The raw red is
  borderline (~4:1 on canvas, measured ~3.3:1 against subtle bg by the
  design-lead) and fails for the 12px error caption. #bf4636 clears **~5.0:1**
  on canvas and passes for the 2px input error border. Flagged for the
  design-lead to push the AA value back into the Figma variable.

## Tailwind v4 wiring

`src/app/globals.css` `@import`s the token files, then `@theme inline` maps Tailwind
namespaces onto the token custom properties **via `var()`** (not inlined values) so
utilities follow runtime theme switching. Token names stay 1:1 with Figma in the
`src/tokens/*` files; the theme layer exposes ergonomic utility names.

Examples: `bg-canvas`, `text-muted`, `bg-accent-strong`, `border-default`,
`p-md`, `gap-lg`, `rounded-pill`, `shadow-sm`, `font-display`,
`bg-terracotta-500` (primitive). See `src/app/page.tsx` for a working sample.

Fonts (Baloo 2 / Lora / Nunito) load via `next/font` in `src/app/layout.tsx` and
expose `--font-baloo2 / --font-lora / --font-nunito`, which the family tokens read.

## Dark mode

`[data-theme="dark"]` on a wrapping element re-points the semantic layer. Set it on
`<html>` or `<body>` (toggle is a later feature concern).

## Provenance

The **semantic layer is CONFIRMED-REAL**: every `--text-*`, `--bg-*`, `--border-*`,
and `--feedback-*` value was verified by the orchestrator against two independent
Figma nodes (Overlays `1327:4655` and Screen/Library `1272:4570`), which agreed
exactly. Spacing xs–xl, radius sm/lg/xl/pill, `shadow/sm`, the 12 text styles below,
and the primitives `--color-amber-300` (#efc97f) / `--color-ink-200` (#e7d6b1) are
likewise confirmed.

Inline confidence tags in the CSS: **[C]** confirmed-real · **[Cb]** confirmed brand
(memory) · **[C-eq]** value confirmed, primitive step-number derived · **[D]** derived ·
**[D-AA]** AA-safe override of a confirmed-but-failing Figma raw value.

> Why some values are still derived: Figma's read API cannot enumerate the
> Foundations page, and `get_variable_defs` only returns the variables a queried
> node *references*. The five real component sets (Button `14:56`, Chip `808:14`,
> Input `16:64`, Toggle `19:18`, Badge `17:42`) bind to **semantic** tokens, not
> raw primitives — so they re-confirm the semantic layer and surface the new
> feedback/hover/focus tokens, but the primitive ramps, dark-mode values, the
> remaining text styles, and `radius-md` still never surfaced. The component-*page*
> nodes (`13:5/6/7/9`) error without an active Figma selection. Derived values are
> anchored on confirmed hexes (never invented silently) and listed below.

### Second-pass reconciliation (live component sets)

Promoted to confirmed via the live pull:

- **New confirmed semantic tokens:** `--bg-accent-hover` #c0703f (Button+Chip),
  `--feedback-success-subtle` #e4efd2 (Toggle+Badge), `--feedback-warning-subtle`
  #faebc4 (Badge), `--feedback-danger-subtle` #f8d5d0 (Badge). Figma raws
  `--feedback-warning` #e0a838 and `--feedback-danger` #cc5a4a confirmed
  (then AA-overridden — see above).
- **New confirmed text style:** `UI/L` (Nunito Regular 16/24/0, from Input) →
  brings confirmed text styles to **13 of 22**.
- **`--color-terracotta-650` #c0703f** added as the hover primitive ([C-eq] —
  value real, step number derived).
- Re-confirmed against these independent nodes: the entire `text/`, `bg/`,
  `border/` semantic layer, `feedback/success`+`info`(+subtle), `radius-sm` (10),
  `radius-pill` (9999), and spacing `xs/sm/md/lg/xl`.

Still **not** surfaced by the component pull (remain derived): every primitive
ramp mid/edge step, all dark-mode values, `radius-md` (16), spacing `2xl/3xl/4xl`,
and 9 of the 22 text styles. Components reference semantic tokens, so primitives
will only surface from a Foundations-page export or Dev Mode — see checklist below.

## Reproducing / regenerating

1. Load the Figma MCP tools (`get_variable_defs`, `get_metadata`, `get_design_context`).
2. `get_metadata` on file `sc9DIhX0wvFgrvmL8NVBf5`; nodes `1327:4655` and `1272:4570`
   are known-good entry points that reference the Foundations variables.
3. `get_variable_defs` on those nodes for the variables + text styles in both modes.
   To fill the ramp/dark gaps, query nodes that consume those specific steps.
4. Rewrite the `src/tokens/*` files; keep token names identical to Figma.

## Derived — reconcile with live Figma Dev Mode (TODO)

Replace these [D] values with exact Figma values; nothing here is confirmed.

- [ ] **Terracotta ramp** mid/edge steps `100,200,300,400,900` — anchored on confirmed
      `500 #d97757` (brand) / `600 #d66c44` / `700 #b35029` / `800 #a0492a` / `50 #fdebe0`.
- [ ] **Ink ramp** steps `50,300,400,700,800` and **confirm step number of `100 #f0e2c6`**
      (currently assumed ink-100 = border/default) — anchored on confirmed
      `200 #e7d6b1` / `500 #876b4f` / `600 #6d5840` / `900 #3c2c1d`.
- [ ] **Amber ramp** steps `50,100,200,400,500,600,700` — anchored on confirmed `300 #efc97f`.
      (Amber is a standalone gold accent hue; borders use the **ink** ramp, not amber.)
- [ ] **Forest ramp** steps `50,100,300,500` — anchored on confirmed `700 #5e7b3a`.
- [ ] **Sky ramp** steps `100,300,500` — anchored on confirmed `700 #3d6082` / `50 #dde9f2`.
- [ ] **Dark mode** — the ENTIRE `[data-theme="dark"]` block in `colors.css` and
      `shadows.css` is best-effort inversion and UNVERIFIED. Replace with Figma dark mode.
- [ ] **Spacing** `2xl/3xl/4xl` (32/48/64) — confirm or extend the ramp.
- [ ] **Radius** `md` (16) — STILL did not surface in the component pull (only
      sm/lg/xl/pill confirmed; sm+pill re-confirmed live). Confirm.
- [ ] **Shadows** `md/lg` — derived; confirm against Figma effect styles (`shadow/sm` confirmed).
- [ ] **Typography — 9 of 22 styles still missing.** Confirmed 13: Display/L,
      Heading/H3, Heading/H4, Title/M, Meta, Body/L, Reading/M, Reading/quote,
      UI/L, UI/M, Label/M, Label/S, Caption. Add the rest from Figma (other
      Heading/Title/Body sizes, a Button style if any).
- [ ] **Typography drift (known issue):** some Figma text styles have line-height /
      letter-spacing that don't line up cleanly, which can block 1:1 binding. When
      regenerating, record any style whose metrics don't match rather than rounding
      silently, and flag for the design lead.
