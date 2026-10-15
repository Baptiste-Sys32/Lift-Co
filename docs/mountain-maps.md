# Four larger mountain maps

Open [the map study](../experiments/mountain-maps.html). Choose a design or use keys **1–4**.

| Design | Layout |
| --- | --- |
| Crown Basin | Broken horseshoe massif, an open bowl, rolling lower shoulders and side gullies. |
| Serpentine Ridge | A long S-shaped spine with hanging bowls, branching shoulders and successive station possibilities. |
| Winding Escarpment | Two uneven uplands, a twisting deep gorge, cliff rims and balconies. |
| Twin Summit Pass | Two summit groups, a high saddle, smaller foreground hills and branching valleys. |

Each footprint is **3.6 × 3.6 km** (12.96 km²), compared with the current resort's 2.16 × 2.16 km (4.67 km²). Elevation is in metres without a display-only vertical scale. The maps have approximately 1,000–1,100 m of relief. They remain separate from the saved resort until a layout is selected.

`src/terrain/mountain-designs.js` exposes `LiftCoMountainMaps.create(id)` with a height sampler, design metadata and five station-shelf candidates. Ridge networks, bowls and cliffs establish the landforms. Secondary gullies/ribs use locally detrended real Alpine elevation already bundled in the project; these fictional designs are not real-geography replicas. Shelf placement searches for gentler existing ground before easing its surface by at most 9 m, avoiding isolated flat-topped stamps.

## Viewing

- Whole mountain, valley, ridge and overhead camera presets.
- Click a named shelf to inspect it closely. Amber outlines can be hidden.
- WASD flight, Space-held mouse look and Shift for faster travel.
- Sidebar arrow hides the interface; orbit, pan and zoom remain available.
- Optional 50 m contours, woodland toggle and three rendering presets.

## Laptop budget

The default **Laptop / light** setting uses a 160 × 160 terrain grid (51,200 triangles), 520 low-poly instanced trees, a pixel ratio of 1 and no shadow maps. Balanced uses a 224 × 224 grid and 800 trees; More terrain detail uses a 288 × 288 grid and 1,100 trees. Only one landscape is resident in the scene, replaced meshes are disposed, and the scene is redrawn only while the camera or controls change. Terrain colour follows slope, with pale snow on gentler ground and rock on steeper faces. Performance depends on the laptop; no frame-rate guarantee is implied.

The current `empty-map.html` forest has also been reduced from 3,400 to 1,200 primary placements. Additional trees close to lifts are capped at 75, and the main forest no longer casts individual tree shadows. Existing saved lift geometry and terrain remain in place.

## Selected base: Twin Summit Pass

Twin Summit Pass is the approved map direction. The original gallery now opens on that design; its underlying heightfield remains available unchanged.

[The separate Twin Summit study](../experiments/twin-summit-options.html) contains four upper-terrain alternatives built from that exact base:

1. **Summit Terraces:** compact gentler caps on both summit groups and lower station shoulders.
2. **High Bowl Rims:** upper snow bowls below preserved peaks, with gentler rim terraces.
3. **Ridge Balconies:** several elongated shelves following the upper shoulders and steeper intervening fans.
4. **Upper Snowfields:** broader upper ski faces below small summit station areas.

`src/terrain/twin-summit-variants.js` starts with `LiftCoMountainMaps.create('saddle')`. All alternatives preserve the 3.6 km footprint, original lower layout and saddle. Changes are localized to the high areas and five or six distributed ski faces. Summit tips are cut toward gently sloping planes, with limited fill on their lower aprons. Bowl alternatives add broad depressions; ski faces ease local roughness into wide fall lines with gentle rolls. These are landforms, not prebuilt pistes, lifts or buildings.

The new viewer includes West/East summit presets, named high-altitude sites, ski-face inspection buttons, optional amber shelf and blue face outlines, flight controls and the same laptop presets. Outlines conform to the displayed terrain triangles. Variants retain a common whole-map camera so differences are easier to compare; keys 1–4 switch alternatives.
