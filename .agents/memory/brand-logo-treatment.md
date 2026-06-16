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
**How to apply:** header tile uses the opaque navy mark `attached_assets/guideright-mark.png` (centered square crop, `object-cover`, no scale). The mark is a STACKED lockup (compass on top, "GUIDERIGHT" wordmark below) — crop only the compass.

# Watermark (transparent compass)

For a faint compass watermark you need a TRUE transparent PNG (`attached_assets/guideright-watermark.png`), because the opaque navy mark at low opacity reads as a faint *rectangle*, not a compass.
Luminance→alpha recipe that actually works (two gotchas):
`magick mark.png -alpha set \( +clone -alpha off -colorspace Gray -level 42%,88% \) -compose CopyOpacity -composite -trim out.png`
**Why each part:** `-alpha set` on the base gives it an alpha channel to copy into; `-alpha off` on the clone is REQUIRED so CopyOpacity uses the clone's grayscale *intensity* (not its all-opaque alpha) — without it the result stays fully opaque. `-level 42%,88%` clips the dark navy to alpha 0 and keeps bright metal opaque. Verify with `identify -format '%[channels]'` (want `srgba`) and sample a corner pixel (want `srgba(0,0,0,0)`).

# Gold accent token system

Brand palette: Deep Navy, Slate, Steel `#A3AAB3`, Intelligence Gold `#C9A45A`.
Tokens added to `index.css` (`:root` AND `.dark`): `--gold` (40 52% 58%), `--gold-bright`,
`--gold-deep`, `--steel`. Used via arbitrary values e.g. `hsl(var(--gold) / 0.3)`.

**Convention:** two-accent system — **blue (`--primary`) = interactive/selected state**,
**gold = brand/prestige chrome** (wordmark "RIGHT", section step numbers, hairline dividers,
tile rings, CTA). Don't make selection states gold; keep gold for non-interactive brand polish
+ the hero "Launch Demo" CTA. Wordmark = "GUIDE" near-white + "RIGHT" gold-bright.
