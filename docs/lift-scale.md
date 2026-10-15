# Lift scale test

Open `experiments/lift-scale.html` directly in a browser. It uses the same CDN version of Three.js as the existing project and locally bundled scripts; no build or local server is required.

## Scope and size

The 1,000 × 1,200 m test area is an exact 10 m-grid crop of the accepted Courchevel elevation data. It loads only `assets/data/lift-scale-heightmap.js` (about 33 KB), not the full terrain asset (about 495 KB). The terrain mesh contains 12,221 vertices. Surrounding regional meshes are not created.

The crop corresponds to source coordinates x = −400…600 m, z = −300…900 m. Its local origin corresponds to x = 100 m, z = 300 m in the full terrain study. Four station pads receive local grading; the rest retains the source heights. The full `experiments/terrain.html` study and its data remain separate.

## Scale

- One Three.js unit = one metre on every axis.
- Terrain is not vertically exaggerated.
- The approved Alpine cabin geometry retains its shape, uniformly calibrated to approximately 2.33 m wide with 1.91 m internal standing clearance.
- Reference people are 1.8 m tall; the survey ruler marks 10 horizontal metres beside each valley station.
- Station boarding decks meet the cabin floor at approximately 1.24 m above their graded pads. Channels allow the lower cabin shell to pass and ramps connect the raised platforms to the snow.
- Tower spacing starts around 85 m; rope supports are adjusted to clear the cabin footprint over the sampled terrain.
- Rope speed is 6 m/s. Motion converts horizontal path increments to actual cable distance, so steeper sections do not accidentally increase physical speed.

## Installed lines

- Meadows: approximately 692 m uphill rope span, 153 m rise, 10 cabins.
- Belle Combe: approximately 481 m uphill rope span, 63 m rise, 8 cabins.

The starting view is the Meadows base station. Use Whole line for overall placement, Base station and Top station for scale, and Ride cabin to follow the lift. Clicking Ride cabin again cycles to the next cabin. The two line buttons select which line the camera controls inspect. Pause/1×/2× affect lift motion.

## Files

- `experiments/lift-scale.html`: crop viewer, layout, local station grading, cameras and scale references.
- `assets/data/lift-scale-heightmap.js`: small crop data, sufficient without loading the full map.
- `src/lifts/gondola.js`: reusable approved gondola/station builder; receives Three.js and the terrain height query explicitly.
- `tools/build-lift-test-data.py`: regenerate the crop from the full local terrain asset using Python and NumPy.

The lift builder accepts station positions and optional tower distances along the line. This separates the model from terrain generation for later placement tools. Interactive station/tower editing and autonomous skiers are subsequent work.
