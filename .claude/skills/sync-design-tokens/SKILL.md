---
name: sync-design-tokens
description: Recipe (SOP) for generating or updating the design-token layer from Figma Foundations into CSS variables + Tailwind theme. Use at project start and whenever Figma variables/styles change.
---

# Sync design tokens — SOP

1. **Pull from Figma.** Load `mcp__plugin_figma_figma__get_variable_defs` (via ToolSearch) and read the variable collections from file `sc9DIhX0wvFgrvmL8NVBf5` (page 🎨 Foundations). Capture colors, spacing, radius, and the 22 text styles, for BOTH light and dark modes.
2. **Generate CSS variables** in `src/tokens/`:
   - `:root { … }` for light, `[data-theme="dark"] { … }` for dark.
   - Keep names identical to Figma (`--color-terracotta-500`, `--text-heading-h1`…).
3. **Expose to Tailwind v4** via `@theme` in `globals.css` so utility classes resolve to tokens.
4. **Encode the design rules** (from 📋 Handoff & Specs): motion durations (300/200ms), AA color decisions (muted→ink/500, etc.).
5. **Document** the pipeline in `src/tokens/README.md` so it's reproducible (and could later be automated with Style Dictionary / Tokens Studio).
6. **Verify** `npm run build`; report any Figma token that couldn't be mapped.

> Golden rule: tokens are generated and are the ONLY source of design values. No hardcoded colors/sizes anywhere else.
