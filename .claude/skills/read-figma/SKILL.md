---
name: read-figma
description: Hard-won knowledge of how the ReadEasily Figma file behaves through the read MCP — its limits, the workarounds, and the node IDs already discovered. Use BEFORE reading any design from Figma so you don't rediscover the same limits.
---

# Reading ReadEasily's Figma — what actually works

File key: `sc9DIhX0wvFgrvmL8NVBf5`. Load tools first:
`ToolSearch select:mcp__plugin_figma_figma__get_design_context,mcp__plugin_figma_figma__get_screenshot,mcp__plugin_figma_figma__get_metadata,mcp__plugin_figma_figma__get_variable_defs`

## Limits (don't fight these — route around them)
- **The page list is NOT enumerable.** `get_metadata` with no node returns only "📚 Cover" (0:1). You cannot open Foundations/Components/Screens by browsing pages.
- **`get_variable_defs` is node-scoped.** It returns only the variables a node's subtree *references*, not the full 125-variable collection. Screens reference SEMANTIC tokens, so a screen pull never surfaces full primitive ramps, dark-mode values, or unused text styles.
- **Component *pages* (13:5/6/7/9) error without an active Figma selection.** Component *sets* (the node IDs below) work fine.
- **Code Connect publish needs a paid Dev/Full seat** — `add_code_connect_map` is rejected. Commit the local `*.figma.tsx` mapping; do not attempt server publish.

## How to actually read something
1. If you have a node ID → `get_design_context` (code + screenshot + tokens) or `get_screenshot` (image) directly.
2. To find a node you don't have → `get_metadata` on a known PARENT (e.g. Screens `13:17`), then grep the saved output for the layer name (`grep -oE 'id=\\"[0-9]+:[0-9]+\\" name=\\"[^\\"]*Foo[^\\"]*'`). Metadata for big boards is large — it saves to a file; grep it, don't read it whole.
3. Cross-check token values across TWO independent nodes before trusting them.

## Known node IDs (verified this project)
- **Component sets:** Button `14:56`, Input `16:64`, Badge `17:42`, Chip `808:14`, Toggle `19:18`. Navbar component `81:102` (instance `1272:4573`).
- **Pages/sections:** Screens page `13:17`; Overlays section `1327:4655`.
- **Screens:** Library `1272:4570`; Profile `149:212`; Settings `149:286`; UserCard overlay `357:629`.
- **SettingsRow:** component `159:235` (+ structured `1434:4287` with Setting title/description children; mobile `872:1417`–`1419`).
- Featured-fable "Editor's pick" Badge instance: `1272:4578` (a custom override, not a base tone).

## Token reconciliation reality
The semantic token layer is confirmed-real; primitive ramps, dark mode, `radius-md`, and ~9 of 22 text styles remain `[D]` derived — only a Foundations-page export or Dev Mode can confirm them. Honor the `[C]`/`[D]` tags in `src/tokens/`.
