---
name: Theme depth hierarchy
description: Card surface must be visually distinct from background; when they match, the UI looks completely flat.
---

**Rule**: `--card` must always be lighter than `--background` by at least 2-3% lightness in HSL.

**Current values** (as of beauty pass):
- `--background: 224 71% 4%` (deepest, true base)
- `--card: 222 55% 6.5%` (elevated ~2.5% — panels, cards float above background)
- `--muted: 218 32% 10%` (distinct from both)
- `--border: 217 34% 13%` (slightly lighter than muted)

**Why**: When card = background (as it was before), every surface appears the same depth. Users cannot distinguish cards from the background, making panels visually merge. Elevating card creates a layered depth hierarchy.

**How to apply**: Any future color theme changes must preserve this hierarchy: background < card < muted < border.
