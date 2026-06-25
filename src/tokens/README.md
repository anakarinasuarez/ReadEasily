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
bg/        canvas  subtle  elevated  accent  accent-hover  accent-strong  accent-subtle  accent-panel
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
| `--space-lg-plus` | 22px | Uniform 22px vertical rhythm between lg (16) and xl (24) — Landing hero-left column (node 171:361). [C]. Tailwind `gap-lg-plus` / `p-lg-plus`. |
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
- **Landing feature-icon tile** (node 171:361, `0px 1px 3px /.04`) gets its **own
  `--shadow-feature-icon`** — the *softest* shadow in the system. Closest is
  `--shadow-field` (`0 2px 8px /.06`) but that is perceptibly heavier (~2.7x blur,
  ~1.5x opacity, larger offset), so reusing it would over-shadow the tiles.
  Tailwind: `shadow-feature-icon`. Same warm shadow ink `rgba(79,51,23,…)`.

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

#### Auth marketing-panel surface ([D-AA], node 542:649)

The auth marketing panel is filled with `--bg-accent` (#d66c44) in Figma, but its
body/bullet text fails WCAG AA there:

| Text on #d66c44 | Ratio | Verdict (16px body needs 4.5:1) |
| --- | --- | --- |
| Figma `rgba(250,245,238,0.8)` off-white | **2.58:1** | fails |
| solid white `--text-on-accent` | **3.45:1** | fails (large-text 3:1 only) |
| solid white on terracotta-650 #c0703f | 3.73:1 | fails |
| solid white on terracotta-700 #b35029 | **5.13:1** | **passes** |

Fix is **not** lowering opacity — it is darkening the *surface* to the lightest
ramp step where solid white clears AA: **terracotta-700**. Published as
**`--bg-accent-panel`**, a semantic alias of `--bg-accent-strong` (no new hex), so
it carries the right value in both modes — light #b35029 + white = 5.13:1; dark
#e58a5e + dark-ink `--text-on-accent` = 6.38:1. Pair the panel with
`--text-on-accent`. Tailwind: `bg-accent-panel`. Locked by `contrast.test.ts`.
Flagged for the design-lead to darken the panel fill in the Figma source.

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

**Plum settings tile (RESOLVED — Profile build, design-lead spec §11).** The
"Reduce motion" row tile (Figma "Motion (plum)", node 159:286) is a plum tone
absent from every ramp. Measured from the node: solid glyph **#a865b3**
(rgb 168,101,179); tile fill **#f1e6f0** == that solid at **16%** over
`--bg-elevated` (verified by compositing). It mirrors the `--cat-*` tone pattern
(solid + ~16% rgba tint), so it ships as a semantic tile pair — **not** a
`--feedback-*` (it is decorative, the row label carries meaning, so it is not
contrast-gated). Kept as a semantic literal (no plum primitive ramp), like
`--cat-tech`.

| Token | Value | Tailwind |
| --- | --- | --- |
| `--settings-plum` | #a865b3 | `text-settings-plum` |
| `--settings-plum-subtle` | rgba(168,101,179,.16) | `bg-settings-plum-subtle` |

SettingsRow's `iconTone` adds `plum: "bg-settings-plum-subtle text-settings-plum"`.

### Profile screen reconciliation (Phase: Profile build, spec §11)

Token gaps measured by the design-lead for the Profile screen (desktop node
149:212). Tokens only — no component edits.

- **Header radius (26px, node 149:240) — reconciled, no token.** 26 → 28 is a
  2px delta to `--radius-2xl`, the sub-perceptual reuse threshold the codebase
  already applies. Consume `rounded-2xl`. (Same call as the earlier 22/26 snap
  note above.) No `--radius-profile-header` minted.
- **Header card shadow (node 149:240) — new token.** `0 10px 30px
  rgba(79,51,23,0.10)` is a bigger, more diffuse warm lift than `--shadow-card`
  (0 5 16 /.07), `--shadow-stat` (0 5 14 /.10, a tight pill) or `--shadow-empty`
  (0 5 18 /.06) — same warm ink, genuinely higher elevation, so it gets its own
  `--shadow-profile-header`. Tailwind: `shadow-profile-header`.
- **Header banner gradient (node 149:241) — new gradient var.** `linear-gradient(170deg,
  #f7d9c7 0%, rgba(237,166,140,0.45) 73%)` — a warm peach hero, not covered by
  the navbar glass gradient (white-translucent) or EmptyState (canvas→subtle).
  Gradients are not a Tailwind theme namespace, so it is the CSS var
  `--gradient-profile-banner` (full gradient string, Figma 1:1) and is consumed
  via an arbitrary class: `bg-[image:var(--gradient-profile-banner)]` (same
  approach as the navbar glass gradient). **Not** added to `@theme`.
- **Plum settings tile** — see the RESOLVED block above (`--settings-plum` pair).
- **Name-edit pencil chip** uses `--bg-subtle` (#fdf8ed) — confirmed present, no
  action.

Dark-mode values for the three new color/gradient/shadow tokens are `[D]`
(unverified), consistent with the rest of the dark block.

### Reader screen reconciliation (Phase 1)

Token gaps measured by the design-lead for the Reader build. Tokens only — no
component edits. Tailwind utilities follow the existing `@theme` passthrough.

**Typography (3 new styles, `[C]`).** Brings confirmed text styles to **16 of 22**.

| Token | Style | Tailwind | Figma node |
| --- | --- | --- | --- |
| `--text-reading-xl-*` | Lora Regular 28/44/0 — English passage | `text-reading-xl` | 1157:3132 |
| `--text-reading-l-*` | Lora **Italic** 20/32/0 — Spanish translation (italic via `-style`, mirrors `reading/quote`) | `text-reading-l` | 1157:3132 |
| `--text-title-l-*` | Baloo 2 SemiBold 24/29(~1.2)/0 — Word Popover title | `text-title-l` | 1158:4019 |

`--text-title-l` is a **new dedicated token**, not heading/h3 (22 ExtraBold) or
heading/h4 (16 SemiBold): both size AND weight differ, so snapping would be
visibly off. Named `title-l` (Title family, Baloo 2 display) — a size step up from
`title-m` (16). Line-height 29px ≈ 1.2× per Figma "normal".

**Shadows (2 new, 1 reuse).**

| Token | Value (light) | Tailwind | Figma node |
| --- | --- | --- | --- |
| `--shadow-reading-card` | `0px 20px 50px 0px rgba(69,46,20,.16)` | `shadow-reading-card` | 1157:3132 |
| `--shadow-popover` | `0px 18px 40px -8px rgba(153,89,51,.28)` (warmer ink #995933, negative spread) | `shadow-popover` | 1158:4019 |

Both deepened `[D]` in dark mode (UNVERIFIED — reconcile w/ Figma dark). The
**player play-button glow** (node 1128:2573, measured `0 6px 14px rgba(214,107,69,.35)`)
**reuses `--shadow-accent-glow`** (`0 4px 12px /.30`) — sub-perceptual delta, same
reuse rule as the Saved card shadow; no new token.

**Radius — reuse, no new token.** Word Popover container measures **22px** →
**reuses `--radius-card` (20px)** (2px delta, sub-perceptual, consistent with the
elevation reuse rule). No `--radius-popover` added. Reading card 28 = `--radius-2xl`
and player top corners 32 = `--radius-xl` already exist (no action).

## Audit gap-fill — decorative semantics + missing type ramp

Tokens only — no component edits (a builder consumes these next). Minted to stop
components hardcoding rgba / reaching into primitive ramps. Dup-grepped clean
before minting. All are decorative chrome / glyphs (no AA gate) except the type
styles, which carry metrics only.

### Decorative color semantics (`colors.css`)

| Token | Light value | Dark | Tag | Consumed via | Replaces (component) |
| --- | --- | --- | --- | --- | --- |
| `--overlay-on-accent` | `rgba(255,255,255,0.22)` | — (theme-indep.) | `[D-design]` | `bg-[var(--overlay-on-accent)]` | WordPopover `rgba(255,255,255,0.22)` (rest) |
| `--overlay-on-accent-strong` | `rgba(255,255,255,0.32)` | — | `[D-design]` | `bg-[var(--overlay-on-accent-strong)]` | WordPopover `…,0.32` (hover) |
| `--overlay-on-accent-weak` | `rgba(255,255,255,0.18)` | — | `[D-design]` | `bg-[var(--overlay-on-accent-weak)]` | WordPopover `…,0.18` (close hover) |
| `--veil-reading` | `rgba(255,250,235,0.45)` | `rgba(36,26,18,0.45)` `[D]` | `[D-design]` | `bg-[var(--veil-reading)]` | ReaderScreen:370 |
| `--bg-decoration-warm` | `color-mix(in srgb, var(--color-terracotta-300) 40%, transparent)` | — (theme-indep.) | `[D]` | `bg-[var(--bg-decoration-warm)]` | BgDecorations `tint(terracotta-300,40)` |
| `--bg-decoration-cool` | `color-mix(in srgb, var(--color-sky-300) 35%, transparent)` | — | `[D]` | `bg-[var(--bg-decoration-cool)]` | BgDecorations `tint(sky-300,35)` |
| `--bg-decoration-leaf` | `color-mix(in srgb, var(--color-forest-300) 35%, transparent)` | — | `[D]` | `bg-[var(--bg-decoration-leaf)]` | BgDecorations `tint(forest-300,35)` |
| `--icon-info-decorative` | `var(--color-sky-500)` (#5a82a8) | `#8aaecb` `[D]` | `[D]` | `text-icon-info-decorative` (@theme) | SavedWordCard:111 + WordPopover:414 `--color-sky-500` |

The overlay/veil/decoration tokens follow the `--scrim` / `--surface-glass-*`
precedent (literal rgba / baked color-mix, consumed via arbitrary-value classes,
**not** in `@theme`). Overlay + decoration tints are **theme-independent** (white
on the always-terracotta accent header; the `*-300` primitives don't re-point),
so they get no dark override — matching current render. The veil flips to a warm
dark wash and the decorative glyph brightens in dark (`[D]`, reconcile w/ Figma).

**Item 4 decision — mint, don't reuse.** The decorative globe glyph gets its own
`--icon-info-decorative` (aliases the lighter sky-500) rather than reusing
`--feedback-info` (sky-700). `--feedback-info` is the **AA text** info semantic;
the globe is a lighter **decorative** glyph with no AA gate. Reusing it would both
darken the glyph (sky-700 vs sky-500) and conflate intents. Builder should use
`text-icon-info-decorative`. This is the only addition to `@theme` from this pass.

### Type ramp gap-fill (`typography.css`)

Four in-use styles that were raw literals. **None collapse** (sizes 26/30/28/20 are
all distinct), so all four mint. One confirmed against Figma, three derived.

| Token | Style | Tailwind | Provenance |
| --- | --- | --- | --- |
| `--text-display-m-*` | Baloo 2 **Bold** 26 / lh 1.1 / 0 — EmptyState title | `text-display-m` | `[D]` minted from literal — node 144:213 has no named Display/M (title unbound) |
| `--text-heading-h1-*` | Baloo 2 ExtraBold 30 / 38 / 0 — word headword / Reader mobile `<h1>` | `text-heading-h1` | `[D]` minted from literal (not surfaced); name confirm pending |
| `--text-heading-h2-*` | Baloo 2 Bold 28 / 36 / **-0.14px** — SectionHeader | `text-heading-h2` | **`[C]` confirmed node 1261:3706** |
| `--text-ui-xl-*` | Nunito Bold 20 / 28 / 0 — WordPopover translation | `text-ui-xl` | `[D]` — node 1158:4019 has no named UI/XL (measured/unbound) |

**Confirmed vs assumed (Figma reads this pass):**
- **Heading/H2 — CONFIRMED** (`1261:3706`): `Baloo 2 Bold 28 / lineHeight 36 /
  letterSpacing -0.5`. The `-0.5` is a **percentage** per this file's documented
  `letterSpacing` %-storage (label/m `1`→0.13px, display/l `-1.5`→-0.66px), so it
  resolves to **-0.5% × 28 = -0.14px**, not -0.5px. SectionHeader's current
  `tracking-[-0.5px]` is the same px-vs-% misread bug — binding `text-heading-h2`
  corrects it.
- **Display/M, Heading/H1, UI/XL — ASSUMED** (minted from the in-use literals).
  The nodes available to the read API did not surface them as named styles
  (consistent with the documented "9 of 22 won't surface" read-limit). Tagged `[D]`.

**Two render deltas the builder must verify (token = design-system truth, not the
current literal):**
1. **Display/M weight** — audit called it ExtraBold; EmptyState renders `font-bold`
   (700) and no Figma Display/M confirms either way. Minted at the rendered Bold(700)
   to be non-destructive. Design-lead to confirm canonical weight.
2. **Heading/H1 on PracticeOverlay** — PracticeOverlay's 30px word currently renders
   **SemiBold/leading-none** (a fallback to Title/L because no 30px token existed).
   `--text-heading-h1` is **ExtraBold/38** (matching the Reader `<h1>` and its
   responsive pairing with Display/L). Binding it shifts PracticeOverlay 600→800 /
   leading-none→38 — intended (aligns the two consumers), but a visible change.

## Story Detail token gaps (node 122:136)

Tokens only — no component edits. All values resolved live from the Story Detail
desktop node `122:136` (Figma variable defs) and the mobile title `843:1185`.

**Radius (1 new, `[C]`).** Brings the radius ramp to 10/16/24/28/32/**36**.

| Token | Value | Tailwind | Figma |
| --- | --- | --- | --- |
| `--radius-3xl` | 36px | `rounded-3xl` | var `--radius-3xl`=36 on 122:136; Moral card 26:2 / 844:1152 |

**Typography (2 new styles, `[C]`).** Brings confirmed text styles to **18 of 22**.

| Token | Style | Tailwind | Figma node |
| --- | --- | --- | --- |
| `--text-display-xl-*` | Baloo 2 ExtraBold 56/64, tracking **-1.12px** — Story Detail title | `text-display-xl` | 122:180 |
| `--text-display-mobile-*` | Baloo 2 ExtraBold 32/40, tracking **-0.32px** — mobile Story Detail title | `text-display-mobile` | 843:1185 |

Tracking caveat (same %-storage bug as display/l, label/m, label/s): Figma stores
`letterSpacing` as a **percentage**. Display/XL `-2` = -2% × 56 = **-1.12px**;
Display/Mobile `-1` = -1% × 32 = **-0.32px**. A regen must NOT reintroduce `-2px`/`-1px`.
Mobile title binds `text-display-mobile`, stepping up to `md:text-display-xl` on desktop.

**Shadow — `--shadow-lg` corrected (`[D]` → `[C]`).** The Figma effect style
`shadow/lg` resolves to `0 12px 28px rgba(46,33,23,.12), 0 4px 8px rgba(46,33,23,.06)`
(ink #2E2117). The old `[D]` value (`0 4 8 /.07 + 0 10 20 /.12`, ink #3c2c1d) was
wrong; corrected to the measured Figma value. No component consumed `shadow-lg`,
so the fix is non-breaking. Story Detail's hero cover overrides BookCover's default
`shadow-md` with `shadow-lg` at the call site (BookCover default unchanged).

**Level dot — reuse, no new token.** The CEFR meta-row dot (ellipse 122:183, 9px)
is bound to `var(--feedback-info)` (#3d6082, sky/700) — the SAME single color the
FeaturedHero level dot already uses (`bg-info`). Figma shows only A2 and it maps to
the existing semantic, so **reuse `--feedback-info` / `bg-info`**. No `--level-*`
group: there is no per-level color evidence in the design. If the design-lead later
confirms distinct A1…C2 dot colors, add `--level-a1…c2` then (decorative — not
contrast-gated).

## Landing token gaps (node 171:361)

Tokens only — no component edits. All three values resolved live from the Landing
node `171:361` (Figma variable defs); Body/M cross-checked against the surfaced
text style. Three additions for Landing pixel-fidelity:

**Typography (1 new style, `[C]`).** Brings confirmed text styles to **19 of 22**.

| Token | Style | Tailwind | Figma node |
| --- | --- | --- | --- |
| `--text-body-m-*` | Lora Regular 16/24, tracking 0 — Landing body paragraph + SegmentedControl "Translate to" context | `text-body-m` | 171:361 ("Body/M") |

Mirrors the `--text-body-l` (20/28) shape; the 16/24 step that was missing between
body/l and the smaller UI scale. `letterSpacing: 0` confirmed (no %-storage caveat).

**Spacing (1 new named off-scale, `[C]`).** See the off-scale table above —
`--space-lg-plus` = 22px, the uniform Landing hero-left vertical rhythm between
lg (16) and xl (24). Mirrors the `--space-md-plus` (14px) precedent. Tailwind
`gap-lg-plus` / `p-lg-plus`.

**Color (1 new semantic, `[C]` light / `[D]` dark).** Faint warm-tan hairline
for the trust-bar `·` dot separators.

| Token | Light | Dark | Tailwind |
| --- | --- | --- | --- |
| `--border-faint` | `#e8dfd2` | `#34271a` [D] | `border-faint` / `bg-border-faint` |

Distinct from `--border-default` (#f0e2c6) — `--border-faint` is **lighter**, a
true hairline tint. No existing token equalled #e8dfd2 (dup-grep clean), and it
sits above ink-100 on the ramp so no primitive matches; shipped as a literal hex.
**Decorative only** — the dots are `aria-hidden`, so no AA contrast requirement
applies. Dark counterpart is `[D]` (sits between dark canvas #241a12 and
border-default #3f2f20); reconcile with Figma dark mode like the rest of the dark block.

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
