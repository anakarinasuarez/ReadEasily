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

### Named off-scale tokens (the `--space-chip-x` precedent)

Some Figma values sit deliberately off the t-shirt scale and are used widely
enough that snapping would visibly hurt. These ship as **named** tokens so they
stay 1:1-mappable, never silently rounded:

| Token | Value | Where (≥2 specs) |
| --- | --- | --- |
| `--space-md-plus` | 14px | Neutral 14px step (SearchField gap + CategoryCard gap/inset) |
| `--space-3xl-plus` | 60px | Generous card inset between 3xl (48) and 4xl (64) — Saved empty-state card padding (node 144:213). Tailwind `p-3xl-plus`. |
| `--space-chip-x` / `-y` | 14px / 7px | Chip padding |
| `--radius-card` | 20px | Search field + Search/Saved word cards |
| `--radius-icon` | 13px | Search 44px icon tile — **canonical icon-tile radius** |

**Icon-tile radius reconcile.** Figma icon tiles read 12–13px, but `SettingsRow`
`IconTile` currently renders `rounded-md` (16px) — three values in play (12–13 Figma,
16 SettingsRow, new 13 token). Resolved by standardizing **`--radius-icon` = 13px**
as the one canonical icon-tile radius. Follow-up for the component owner: SettingsRow
`IconTile` should adopt `rounded-icon` (replace `rounded-md`). Documented, not silent.

### Category accents (Search CategoryCard)

Per-category icon-tile accents + their 16% tints. Decorative (the label carries
meaning), so not gated by text contrast. `travel` introduced a new **teal** hue
(`--color-teal-50` #d2efe9 / `--color-teal-500` #2f9f93) — not on any prior ramp.

Fables is **forest/green** everywhere (Search CategoryCard + Library rail) — the
old "fables → terracotta" entry was a wrong assumption (no terracotta Fables
exists in the design; that token had no live consumer) and has been reconciled.

| Token | Solid | `-subtle` (16% tile fill) |
| --- | --- | --- |
| `--cat-fables` | forest-500 #74a64a | rgba(116,166,74,.16) |
| `--cat-fables-rail` | = `--cat-fables` (forest) | — |
| `--cat-daily` | terracotta-600 #d66c44 | rgba(214,108,68,.16) |
| `--cat-tech` | #5b86b0 (sky blue) | rgba(91,134,176,.16) |
| `--cat-travel` | teal-500 #2f9f93 | rgba(47,159,147,.16) |

**Selected-state pairs** (CategoryCard SELECTED variant — dedicated bg + fg,
distinct from the unselected `-subtle` tile tint):

| Token | bg | fg | Selected border |
| --- | --- | --- | --- |
| `--category-fables-*` | forest-100 #e4efd2 | forest-500 #74a64a | `--category-fables-fg` (green) |
| `--category-daily-*` | #fbdfd0 (literal) | #e07a4f (literal) | `--border-accent` #d66c44 |
| `--category-tech-*` | sky-50 #dde9f2 | #5b86b0 | `--feedback-info` #3d6082 |
| `--category-travel-*` | teal-50 #d2efe9 | teal-500 #2f9f93 | `--feedback-info` #3d6082 |

(Tech/Travel selected borders use navy `--feedback-info` as-measured, not their
own hue — build 1:1.)

Tailwind: `bg-cat-travel-subtle`, `text-cat-travel`, `bg-category-fables-bg`,
`text-category-travel-fg`, etc.

### Warm soft-elevation shadows

Figma card/field/stat shadows use a warmer ink (`rgba(79,51,23,…)`) and are
single-layer — they do **not** match the `rgba(60,44,29,…)` sm/md/lg ramp, so they
are **additions** (the ramp stays). `--shadow-card` (0 5px 16px /.07),
`--shadow-field` (0 2px 8px /.06), `--shadow-stat` (0 5px 14px /.10),
`--shadow-empty` (0 5px 18px /.06). Tailwind: `shadow-card`, `shadow-field`,
`shadow-stat`, `shadow-empty`.

**Reuse vs. add — the rule (Saved screen gaps).** Shadow opacity is the
perceptual weight of an elevation; ≤2px geometry deltas are sub-perceptual.
- **SavedWordCard** (node 1135:2637, measured `0 4px 14px /.07`) **reuses
  `shadow-card`** (`0 5px 16px /.07`): identical opacity, only a 1px offset / 2px
  blur delta — accepted approximation, no new token.
- **Empty-state card** (node 144:213, `0 5px 18px /.06`) gets its **own
  `--shadow-empty`**: it differs in opacity (.06 vs .07 = lighter) *and* spread
  (18 vs 16px blur), a genuinely softer/diffuse lift, so it is a distinct
  elevation rather than an approximation. EmptyState should consume `shadow-empty`.

### AA decisions baked in (from 📋 Handoff & Specs)

| Intent | Token | Resolves to |
| --- | --- | --- |
| muted text | `--text-muted` | `--color-ink-500` (#876b4f) |
| interactive terracotta | `--bg-accent-strong` | `--color-terracotta-700` (#b35029) |
| info | `--feedback-info` | `--color-sky-700` (#3d6082) |
| success | `--feedback-success` | `--color-forest-700` (#5e7b3a) |
| warning text + numerals | `--feedback-warning` | #8a5a14 (~5.0:1 on `warning-subtle`, ~5.9:1 on `bg-elevated`) |
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

### Screen-spec reconciliation (Search / Saved / Profile)

A consolidated set of gaps surfaced from the three new screen specs. Each value
below was confirmed across ≥2 specs unless noted.

**Forest value drift (visible bug, fixed).** Figma resolves `forest-500 = #74a64a`
and `forest-100 = #e4efd2`; the tokens previously held `#7a9a4e` / `#e0ead0`
(promoted [D]→[C]). Affects the Search green "selected" CategoryCard and the
Library green carousel dot. **Contrast impact: none** — `--feedback-success`
(#566f34, a [D-AA] override) and `--feedback-success-subtle` (#e4efd2, [C]) do not
derive from these primitives, so the forest/700 success pair still passes AA.
`contrast.test.ts` re-runs green (12/12). Note: `forest-100` now equals
`--feedback-success-subtle` exactly, confirming success-subtle = forest/100.

**Amber numeral AA (Saved).** The "practice sets" numeral must use
`--feedback-warning` (#8a5a14), **never** raw `#e0a838` (`--feedback-warning-solid`,
decorative only). #8a5a14 clears ~5.9:1 on `bg-elevated` — guarded by a new
`contrast.test.ts` pair ("warning numeral on elevated"). The existing token was
already the AA-safe text value, so no new `-text` variant was needed.

**Off-scale spacing — snap vs add.** Recommendation was to snap where it won't
visibly hurt; all reported gaps are layout gutters where a few px is imperceptible,
so all snap to the existing ramp — no new spacing tokens:

| Figma gap | Decision | Maps to |
| --- | --- | --- |
| 54px (column gap) | snap | `--space-3xl` (48) |
| 50px (column gap) | snap | `--space-3xl` (48) |
| 33px (gap) | snap | `--space-2xl` (32) |
| 20px (stat-pill gap) | snap | `--space-xl` (24) |
| 14px (empty-stack gap) | ~~reuse `--space-chip-x`~~ → **own token** | `--space-md-plus` (14) |

**14px gets its own neutral token (supersedes the chip-x reuse above).** The
14px gap recurs in the new Search components (SearchField gap, CategoryCard gap +
top/right inset) where Chip-padding semantics are wrong. It now ships as
`--space-md-plus` (Tailwind `gap-md-plus` / `p-md-plus` / inset utilities) — a
neutral off-scale step between `md` (12) and `lg` (16). Borrowing `--space-chip-x`
for non-Chip layout is deprecated.

**Profile container radii (22px / 26px) — snap.** Both are within 2px of an
existing step, sub-perceptual on large containers; adding two more off-scale radii
for a 2px delta would bloat the contract with no visible gain. `22 → --radius-lg`
(24), `26 → --radius-2xl` (28). (Named off-scale is reserved for `--radius-card`/
`-icon`, which are widely used and clearly distinct from the scale.)

> **TODO(pending-design):** the Profile "Reduce motion" tile uses a plum/violet
> tone that is NOT in any current ramp. Awaiting a design decision — remap to an
> existing tone vs. add `--feedback-violet-subtle`. **Do not add the token yet.**

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
- [ ] **Forest ramp** steps `50,300` — anchored on confirmed `100 #e4efd2` /
      `500 #74a64a` / `700 #5e7b3a` (100+500 promoted to [C] via Search/Saved specs).
- [ ] **Sky ramp** steps `100,300,500` — anchored on confirmed `700 #3d6082` / `50 #dde9f2`.
- [ ] **Teal ramp** — only `500 #2f9f93` surfaced (Search travel tile). Add the rest if needed.
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
