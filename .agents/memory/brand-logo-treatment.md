---
name: GuideRight brand logo treatment
description: How to present the GuideRight compass mark in UI, and the gold accent token system
---

# Brand mark cutout

The GuideRight compass "G" mark is metallic silver/gold on a **dark navy gradient** background.
Background removal (auto tool AND ImageMagick floodfill) **fails** to cleanly cut it out — the
navy gradient blends into the metal's own shadows, so any fuzz high enough to remove the bg also
eats the logo edges.

**Decision:** Don't cut it out. Present the mark inside a rounded "app-icon tile" (the brand
sheet's own ICON/APP treatment). The mark's corner color (`#081421`) is nearly identical to the
app's navy `--background` (`224 71% 4%`), so the navy reads as intentional inside a bordered tile.
Use `object-cover scale-[1.1+]` + a gold-tinted border + inset shadow to seal the edges.

**Why:** avoids a visible navy box/seam that a naive `<img>` placement would show.
**How to apply:** any place the mark appears (header tile, faint watermark). Source: `attached_assets/guideright-mark.png` (already cropped+trimmed from `Logo_1_*.png`).

# Gold accent token system

Brand palette: Deep Navy, Slate, Steel `#A3AAB3`, Intelligence Gold `#C9A45A`.
Tokens added to `index.css` (`:root` AND `.dark`): `--gold` (40 52% 58%), `--gold-bright`,
`--gold-deep`, `--steel`. Used via arbitrary values e.g. `hsl(var(--gold) / 0.3)`.

**Convention:** two-accent system — **blue (`--primary`) = interactive/selected state**,
**gold = brand/prestige chrome** (wordmark "RIGHT", section step numbers, hairline dividers,
tile rings, CTA). Don't make selection states gold; keep gold for non-interactive brand polish
+ the hero "Launch Demo" CTA. Wordmark = "GUIDE" near-white + "RIGHT" gold-bright.
