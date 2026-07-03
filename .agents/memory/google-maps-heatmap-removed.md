---
name: Google Maps HeatmapLayer removed (v3.65)
description: The Google Maps JS visualization HeatmapLayer was removed and now throws; use Circle overlays instead.
---
Google removed the `HeatmapLayer` (google.maps.visualization.HeatmapLayer) from the Maps JavaScript API as of **version 3.65**. Calling `new visualizationLib.HeatmapLayer(...)` now **throws at construction**, which crashes the React map component tree (surfaces confusingly as an "Invalid hook call" error in the boundary, but the real cause is the thrown constructor).

**Fix pattern used:** render weighted translucent `google.maps.Circle` overlays (fillOpacity ~0.28, strokeWeight 0, radius scaled by event weight). Overlapping translucent circles approximate the old heatmap density look. Keep a ref array of circles and `setMap(null)` all of them on cleanup / visibility-off.

**Why:** any component still relying on HeatmapLayer will hard-crash after a Maps API version bump — there is no runtime feature flag, the constructor just throws.

**How to apply:** if a map panel crashes after loading Google Maps, grep for `HeatmapLayer` first. The population grid uses a component *named* `PopulationHeatmapLayer` but it renders custom cells (safe) — only the real `google.maps.visualization.HeatmapLayer` is the hazard.
