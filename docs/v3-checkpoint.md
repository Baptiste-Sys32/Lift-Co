# Upper Snowfields V3 — 18 October 2026

V3 is a stability, terrain and interface checkpoint. The thirteen approved lift choices, guest network, operations, terrain layers, construction transactions and camera controls are retained. The original `index.html` resort stays separate.

## Playing V3

Open [the game](../empty-map.html). The sidebar has **Lifts**, **Terrain & routes** and **Resort** workspaces. Lifts contains the line list, camera/edit actions and selected lift operations. Terrain contains sculpting, pistes and paths. Resort contains the entrance, time of day, slots and backup export. Construction keeps its own inspector and profile. Undo/Redo remain session-wide outside a pending edit, and local inside one.

**Graphics** in the sidebar header opens device settings. Changes preview immediately; **Apply settings** remembers them in this browser, while **Cancel**, the close button and Escape restore the previous values. These preferences use `lift-co-graphics-v3`, independent of world slots. A failed preference write retains the current session's settings and displays a notice.

| Preset | Resolution scale | Sun shadows | Vegetation | Snowfall | Station detail |
|---|---:|---:|---:|---:|---|
| Performance — default | 75% | Off | 40% | 25% | Visible |
| Balanced | 100% | 1024 | 70% | 60% | Visible |
| Quality | 125% | 2048 | 100% | 100% | Full |

Individual controls allow 50–150% render resolution, off/512/1024/2048 shadows, 20–100% vegetation and 0–100% snowfall. Resolution is a scale of CSS canvas size, capped by the slider rather than multiplied by a Retina display's device pixel ratio. Interface text retains native browser resolution. The panel reports frame rate, drawing-buffer size, draw calls and triangles. These are current-session diagnostics, not a promised laptop frame rate.

Vegetation density deterministically submits fewer instances, rather than merely shrinking hidden trees. Changing it does not clear vegetation from the save or affect lift clearance/guest routing. Terrain edits update the original instance records, then compact the visible subset again, so returning to 100% restores the correct edited positions. Snowfall density reduces both point submission and particle updates.

Visible-detail mode skips off-screen conveyor matrix work in the ordinary circulating terminals and four expansion models. Their rotation phases continue to advance. Visible wheels and all pylon wheels keep turning. Solo and Rocharbois retain their coupled rope/machinery animation; their mechanical simulation is not disabled by a graphics preset. Full detail updates conveyors everywhere. The change intentionally does not freeze carriers, sway, cables or guests.

## Terrain and foundations

Station earthworks use rounded footprints and a quintic transition into the hillside, with a broader bank for larger height differences. The level boarding footprint and existing recessed channels remain. Raised stations still preserve the ground. Solo retains its cliff/open-approach requirements and excavation limits.

Terrain stays coarse away from infrastructure, with 2 m refinement around stations and tower feet. Fine/coarse borders have matching edge vertices, including across chunk boundaries. Normals and rock/snow colours are computed from the shared world height service, so adjacent chunks agree at their edges. Continuous world UVs retain snow microtexture. A short-lived height-sample cache is shared by chunks during each rebuild. Station moves update both old and proposed areas; terrain tools still update affected chunks and nearby scenery. Station scenery clearing uses the complete oriented terminal footprints, including the rear of the new terminals and the intermediate structures, plus canopy clearance. Preview clearing includes the proposed station location. This fixes trees growing through the back of a station.

Pylon concrete extends below sampled terrain around the entire perimeter, rather than ending at the centre's ground height. Caps stay level and retain the existing steel anchor positions. Normal columns widen their spread footings above 28 m (up to 6 m); grouped supports gain the same visual width rule. Solo's four leg pads adapt to the hillside, with a broad buried raft from 40 m upward. Rocharbois retains its height-scaled foundation footprint and gains terrain-following embedment. Raised station piers also reach the hillside around their corners.

These are visual civil-works rules for the game. They are not structural calculations or a manufacturer foundation specification. Real tower foundations depend on geology, loading and site access.

## Saves and rollback

World documents now write `version: 3` and `releaseVersion: 3`. V1 and V2 still load through the existing migration. IDs, types, heights, tilt, grouping, station datums/foundations, operations, middle stations, independent routes, junctions and ordered terrain layers retain their meanings. V1 automatic pistes convert once; V2/V3 independent pistes are retained without duplication.

The existing `lift-co-upper-snowfields-v1:<slot>` keys and `upper-snowfields-v1` map identifier deliberately stay unchanged: they identify the existing map and slots, not the release. Before any world save write, existing slots are copied once to `lift-co-pre-v3-20261018:<original key>`. The shared backup gate blocks saving if a required backup fails. Export includes V3, Solo and expansion integration backups as well as earlier backup families. Device settings are independent of that world-save gate.

The completed V3 source checkpoint is `archive/releases/v3-20261018/`, with the game, original resort, assets, studies, docs and SHA-256 manifest. Source rollback is in `archive/releases/pre-v3-20261018/` (main HTML, README, docs and complete `src`). The new UI stylesheet is linked only by `empty-map.html`; the original resort and standalone design studies retain their existing styling and foundation fallbacks.

## Research behind the implementation

- [Three.js shadow manual](https://threejs.org/manual/pages/shadows.html): a shadow light adds rendering passes; map resolution and coverage trade off detail. V3 keeps one shadow-casting sun and offers an off preset.
- [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html): `.count` controls how many instances are drawn. V3 compacts a deterministic vegetation subset and recomputes bounds after changes.
- [NVIDIA GPU Gems — improved Perlin noise](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-5-implementing-improved-perlin-noise): the quintic fade has continuous derivatives at both endpoints. V3 applies that transition to earthwork banks; it does not substitute noise for the authoritative terrain.
- [PND Engineers — Icy Strait Point gondolas](https://www.pndengineers.com/project/icy-strait-point-gondolas/), [Highlander — concrete foundations](https://www.highlanderskilift.com/concrete-foundations), [Wieser — ropeway civil works](https://www.wieser.it/alpine-construction-services/ropeway-related-civil-works), and [Geostabilization — tramway tower underpinning](https://www.geostabilization.com/project-gallery/underpinning-foundation-tramway-tower-with-micropiles/): actual mountain works use excavated/embedded foundations and site-specific reinforced concrete or micropiles. These informed the grounded footing treatment, not invented engineering dimensions.
- [Transport Fever 2 settings](https://www.transportfever2.com/wiki/doku.php?id=gamemanual%3Asettings) and [official interface guide](https://www.wiki.transportfever2.com/doku.php?id=gamemanual%3Auserinterface): references for focused construction/management workspaces and presets with individual settings. V3 uses its own compact alpine operations styling, graphite controls, orange construction accent and locally bundled Barlow typography; no game assets were copied.
- [Chrome DevTools performance panel](https://developer.chrome.com/docs/devtools/performance): browser profiling and rendering counters are useful evidence; an isolated headless browser is not a substitute for the user's laptop experience.

## Verification

No automated repository test suite was added or run. Syntax validation and temporary isolated-browser/geometry probes covered:

- All 43 JavaScript sources and the main inline module: clean syntax; all 39 referenced local scripts/styles return HTTP 200. The original `index.html` SHA-256 remains `5323a8d68078ad30f053b11945eb9adc035e784299c1e392c3ccdbd5aeb8f50e`.
- Normal game page with native animation: thirteen dropdown choices, populated line controls, working graphics modal and empty error overlay. All thirteen models constructed/updated with finite geometry and expected seats/fleets.
- Preset preview/Cancel, rapid reopening, Apply persistence, Escape and keyboard focus. Settings fit 1366 × 768 and 390 × 844 views with no horizontal overflow and reachable action buttons.
- Visible station conveyor phase and drawn matrices advance. Off-screen detail skips matrix work while preserving phase; pylon wheels keep spinning. Full detail restores those matrix updates.
- No surviving trees inside terminal clearance zones in the four-line resort (minimum measured root distance 8.60 m). Moving a station preview over a tree hid it, and cancelling restored all counts and matrices exactly.
- Terrain boundary stress probe: 55 matching vertices on each adjacent edge, zero height/normal disagreement and valid snow UVs. A 60 m column's 4.37 m footing on sloping ground had no exposed bottom vertices and at least 0.8 m embedment.
- Actual terrain brush gesture raised sampled ground by 1.92 m. Switching vegetation density during the edit, then Cancel and returning to full density restored ground exactly, with identical instance counts and zero matrix difference.
- Actual Palace8 middle-ring drag, local undo/redo, Apply and session undo/redo. Fleet changes retained the correct boarding terminal/destination, and undo/redo restored counts. Speed ramps retained riders; Stop froze machinery/carriers; Resume moved them again. All twelve directional journeys across the four additions completed, including through riders keeping their seats.
- V1 and V2 browser saves migrated and reloaded as V3 while retaining lift types, towers, grouping and operations. The V2 probe retained ordered terrain layers and an existing independent piste. A V1 automatic piste converted once and retained its ID on reload. Backups matched original slot bytes. Forced V3-backup failure blocked writes/construction and retained the original slot bytes, with a visible notice.

In a fixed overview of the four-line QA resort, Quality submitted an approximately 1387 × 1141 drawing buffer, 800 vegetation instances and 1100 snow particles; Performance used 832 × 684, 306 instances and 275 particles. That is about **64% fewer pixels** and **62% fewer vegetation instances**. Main-pass draw calls remained 985 because the trees are instanced; fewer instances reduce submitted geometry rather than the number of calls. Main-pass triangle counters were 4,649,312 versus 4,540,772. Shadows add separate rendering work.

The headless browser uses a slow software-rendering environment: the close station inspection reported about 1 FPS, so these measurements do **not** establish a smooth frame rate on the user's laptop. The actual laptop remains the hardware performance check; Performance is the conservative default. No simulation simplifications were introduced to claim a higher frame rate.


## Placement hotfix (18 October 2026)

Fixed a reproducible `Cannot read properties of null (reading 'project')` in the V3 scenery-clearing preview. After station A was placed, the preview passed an incomplete draft to alignment projection. Terrain/scenery preview now waits for both endpoints. Returning from a complete preview to an incomplete draft restores the previous terrain and scenery.

Also fixed the first station's height control before station B exists: it uses the authored elevation or local ground until the calculated station datum is available. The inspector and height editor share that rule; the funitel still displays its common platform height when both stations exist. Apply remains blocked for incomplete lines. Save version stays 3.

Temporary regression probes covered 39 incomplete states across all thirteen lift types; real canvas placement followed by height/foundation edits, Reset, Undo/Redo and Cancel for all thirteen types; and complete-to-incomplete preview restoration with identical vegetation counts/matrices and an unchanged resort document. The normal `empty-map.html` loaded both patched scripts and completed first-station editing with an empty error overlay. All 44 source/module syntax checks passed; no repository test suite was added or run.

Patched scripts have a `v=3.0.1` cache revision, so reloading the game fetches the fix. Pre-fix sources are in `archive/backups/v3-partial-placement-20261018/`; the updated checkpoint is `archive/releases/v3-20261018-hotfix-1/`. The original V3 snapshot is retained.
