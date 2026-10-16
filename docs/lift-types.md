# Lift types on the empty map

Open `empty-map.html`, choose **Build a lift**, then select the lift type before placing stations and towers.

| Type ID | Model | Capacity | Status |
| --- | --- | --- | --- |
| `gondola` | Gondola / Classic (original Alpine) | 4 standing passengers | Buildable |
| `ridge` | Chair Lift / 6-Seater | 6 seated passengers | Buildable |
| `classic` | Chair Lift / Classic (fixed grip) | 4 seated passengers | Buildable |
| `princesse-panorama` | Gondola / Panorama | 4 seated passengers | Buildable |
| `princesse-touring` | Gondola / Touring | 4 seated passengers | Buildable |
| `arbois` | Gondola / Sigma Arbois | 4 seated passengers | Buildable |
| `jaillet` | Gondola / Sigma SP77 | 4 seated passengers | Buildable |
| `solo` | Solo reversible téléphérique | 12 standing passengers | On hold; study retained |

Classic is integrated into the game with its approved compact white/glass canopy, green supports and permanent rope clamps. The original `experiments/classic-chairlift.html` study remains available. Heritage and Glacier remain design studies. Solo is on hold in the current game; its implementation and studies are retained.

The dropdown groups Chair Lift before Gondola. Ski Lift is reserved for future types and is hidden while empty. Internal IDs stay unchanged when display names change. Sigma Arbois is a descriptive game label, not a confirmed factory model designation. Sigma SP77 is the user-selected name for the rounded Jaillet model. See [cabin integration notes](gondola-integration.md).

## Shared operation

Ridge uses the existing gondola tower geometry, cable profile, support/hold-down wheel logic, terminal architecture, detaching grip, tyre conveyors, station turnaround, reattachment and cabin sway system. The six-seat carrier replaces the enclosed gondola. Both detachable lift types use the approved Lift Co. red tapered housing, with slimmer lower cheeks, a narrower ribbed grey roof, raised curved side glazing and solid lower bodywork. The existing concrete platforms, channels and ramps remain in place. Two substantial centre-line pillars support each housing: a front pillar and a rear pillar beneath the bullwheel bearing; no thin perimeter support posts.

Ridge runs at 6 m/s on the cable, with a 0.55 m/s passenger crawl and 1.8 m dispatch pitch on the station straights. The conveyor increases to 1.65 m/s through the turn to separate the wide chairs. The Alpine gondola retains its existing settings. Both use dispatch times derived from their full loop travel time.

Ridge safety bars raise on arrival, stay raised for unloading/boarding and lower before reaching the cable. Six seats can be reserved in FIFO order and boarded from staging positions on the existing exterior platform. Riders remain on their skis, use a seated leg pose and unload before continuing to the return run. The ride camera sits on an empty chair; one carrier on each lift is reserved for camera use.

Classic runs at a constant **1.8 m/s**, on the slope and through both stations. It uses four seats, 10 m carrier spacing and 12 m terminal straights, with exposed bullwheels and no detachment rails or tyre conveyors. Safety bars open for boarding/unloading. Chair boarding, seated guest poses, skis and the reserved ride camera are shared with Ridge using each model’s actual seat count.

Every terminal has a compact three-sheave receptor on each cable lane, projecting about 3.2 m from the housing with short swept metal cheeks. There is no automatic extra column or long station-mounted sheave train. The roof lip stops at the entry plane to expose these small receptors. The cable joins the level station smoothly; its sheaves follow the actual rope normals and use support/hold-down orientation as needed.

For a steep approach, place ordinary towers outside the terminal and adjust their heights to ease the grade in stages. Their larger trains remain separate structures, as in the supplied approach-pole references. Existing tower spacing and ground-clearance rules still apply. Close/grouped approach poles remain a future experiment.

Construction previews show stations, towers and cable only. Carrier geometry and dispatch allocation are deferred until the lift is built and opened, including when editing an existing line.

## Current aesthetic work

Station hold-down receptors lift individually by up to 0.14 m as a grip passes beneath. Their axles and sliding bearing links follow the movement; support sheaves below the rope stay fixed. The same behavior is present on normal pylons. Rope grips pitch with the cable tangent while the hanger and body retain their upright suspension and existing sway.

Every pylon has a downward floodlight on each side. Fixtures glow after dusk and before sunrise; eight shadow-free spotlights are assigned to the nearest fixtures within 320 m of the camera to limit laptop rendering cost. The fade begins at 220 m. No new station or cabin lights are added.

New lines store `autoPiste:false` and generate no return piste, markers, grooming or preset ski tracks. Existing lines retain their previous routes. The flag survives editing, saving, removal and undo. Guests on a line without a route unload and pause at the summit before using the existing walking transfer behavior; no ski run is credited.

## Implementation

- `src/lifts/catalog.js`: buildable model names, capacities, speeds, station pitch and clearance footprints.
- `src/lifts/classic-chair.js` / `classic-station.js`: approved fixed-grip carrier and compact terminal.
- `src/lifts/detachable-station.js`: approved upper housing shared with the separate station-shell study; game terminals use Lift Co. red (`0xb7352c`).
- `src/lifts/station-guides.js`: supported terminal sheave heads generated from the shared cable profile.
- `src/lifts/ridge-chair.js`: approved graphite frame / blue upholstery geometry, detachable grip, safety-bar assembly and six-seat layout. Static pieces are merged and shared per line.
- `src/builder/resort-editor.js`: optional type selector, type-aware clearance/profile and serialization. Pages without a catalog retain their gondola defaults.
- `empty-map.html`: shared station/tower factory, choice of carrier factory, bar animation, six-seat boarding, seated skier equipment and ride camera.

V1 retains the save schema version and uses a separate `lift-co-upper-snowfields-v1:` slot namespace, leaving legacy `lift-co-empty-map-v1:` saves intact. Each line now stores `type`; older lines without it load as `gondola`. Saving or editing one line preserves the types of the other lines. The original `index.html` resort remains gondola-only.

## Solo cabin reference

`designs/single-arm.html` retains the approved 4.5 m cabin and single curved hanger. The longer carriage has eight running wheels, with one additional axle at each end of the original six-wheel arrangement and the original wheel spacing retained. Its side beams extend to support the new end wheels; the central arm and haul-clamp anchors stay in place. It has one fixed support cable beneath a single central row of grooved running wheels mounted below the frame. A separate thinner central haul cable passes through a clamp bolted to the carriage cross-brace. The curved hanger stays outboard of the support rope and attaches to a lug on one side of the carriage beam; it does not connect centrally from underneath. Wheel rotation in the shuttle preview follows the cabin’s actual distance traveled.

Use **Trolley** or **Cable layout / end-on** to inspect the arrangement. The approved Heavy Portal pylons and compact inclined cage stations remain in the Solo studies and paused runtime; Heritage and Glacier integration is deferred.

## Solo structure studies

`experiments/solo-structures.html` proposes three four-legged towers: Alpine lattice (29 m), Heavy portal (27 m) and Summit lattice (34 m). Heavy Portal is the default and retains its approved shaft and flared feet. Revised low crossheads replace the raised crowns and full solid decks: two transverse girders, slim inner beams with hanging fork brackets inspired by the supplied Long Roz crop, narrow service walks, and six/eight/ten larger 0.48 m radius haul sheaves per lane with visible fork bearings and axles. The fixed support rope follows the tops of the large wheel row, directly below the separate upper haul-rope guide plate. Solo passes along the fixed track rope with its haul rope directly above it in the same vertical plane. The tower and arrival routes have no sideways diversion; the large tower wheels support the lower fixed rope from underneath, while a separate slim plate guides the haul rope above it. The remaining small vertical adjustment follows the carriage clamp. This is a visual interpretation of the supplied photographs, not a surveyed mechanism. The fixed-track/saddle distinction follows the [Doppelmayr aerial tramway brochure](https://www.doppelmayr.com/uploads/tx_vcs/Pendelbahnen2013_ENG-Doppelmayr.pdf).

The arrival view contains an open steel cage with two inclined guide lanes, no building, an adjustable 12–38° guide angle (30° initially), and a docking position that places Solo’s cabin floor at the 0.52 m platform height. The carriage pitches with the guide; the cabin stays upright. **Centre the cabin** freezes a tower crossing or a docked arrival for inspection. The approved cabin is extracted into `src/lifts/solo.js` for reuse; the original cabin design HTML remains available.

References are preserved under `assets/references/telepheriques/solo-structures/`. These structures remain separate from the current resort builder pending user selection and refinement.

The tower wheel banks have continuous inboard backing plates parallel to each row. The upper blue-rope carrier is recessed 0.168 m below its earlier position, with small saddle pads reaching the cable rather than a high continuous support bar.

## Solo complete line test

Open `experiments/solo-line.html` for the combined rig: two Solo cabins shuttling on separate fixed track ropes, two open docking cages and three approved Heavy Portal supports on flat ground, an uphill slope and the crest of a hill. `src/lifts/solo-structures.js` reuses the workshop geometry for the complete line; this remains separate from the resort builder.

The 670 m horizontal layout has a lower valley and an upper terminal on a cliff terrace at approximately 233 m. The bottom cage uses a 12° approach; the upper cage faces downhill with a 20° climb into its docking position. The upper platform projects beyond the cliff, with open channels allowing the cabin to rise from below platform level. Both cabins share one arc-length displacement and always move in opposite directions. One drive schedule limits open-span speed to **10.25 m/s**, and holds **7 m/s** while either carriage crosses a pylon. Smooth acceleration/braking is bounded at 0.65 m/s², with an eight-second terminal dwell and doors opening only at the stops. Because both vehicles share a drive, either cabin's pylon passage slows the whole line. Carrier pitch follows the cable tangent while cabin bodies remain upright.

Use the pylon view buttons followed by **Pause at selected crossing** to inspect all three ground/slope cases; whole-line, side-profile, terminal and follow views are also available. The journey slider pauses at any position. Playback defaults to real time with quarter/half/double speed options. Upper and lower cable paths remain in one vertical plane per lane. The fixed track-rope anchors are represented by the terminal frames; the haul drive and closed return circuit are not modeled in this visual rig.

Cable geometry in the full Solo rig is defined span by span. Unsupported spans use a straight chord with small downward parabolic sag. Grade changes are confined to the 8.96 m pylon wheel banks and short terminal receptor sections; there are no long free-space easing curves or horizontal approach plateaus. Rendering samples that profile directly rather than applying a global Catmull–Rom spline. Station cages, rope paths, roller contact normals, vehicle pitch and journey distance all use the same profile.

### Compact Solo terminals and upper hold-down guides

The complete-line terminal cage is shortened from 36 m to 19 m, with 16 m of lower guide wheels instead of the previous full-length bank. Cable entry transitions are contained in the outer six metres of these compact guides. The cliff location, fixed cage angles and floor-level stop positions are unchanged.

Upper haul-rope hold-down banks use seven 0.26 m radius wheels at each terminal receptor. Tower heads choose an upper hold-down bank when the outgoing grade exceeds the incoming grade; otherwise the existing lower guide plate remains. Each upper wheel is offset above the rope along its actual local normal, so the blue cable passes under the groove. Sliding bearing blocks lift 0.15 m near a passing haul clamp to provide clearance without sideways rope motion. This is a proposed clearance mechanism for the visual prototype, not a manufacturer-validated assembly. The lower fixed support rope and Solo running wheels keep their existing path.

## Solo integration (on hold since October 16, 2026)

The main game no longer loads the Solo runtime or offers it in the builder. Existing browser saves are snapshotted before saved Solo lines are filtered out; see [the update notes](2026-10-16-lift-details.md). The following describes the retained implementation.

`src/lifts/solo-runtime.js` supplies the live line and the builder's elevation profile. Construction creates infrastructure only; opening the saved line creates exactly two Solo carriers. Both cabins use one common rope displacement, alternate between the two terminals, slow to 7 m/s when either crosses a pylon, and cruise at 10.25 m/s where the span permits. Stops last eight seconds, with doors closing before departure. The original eight-wheel single-arm carriage and compact station guides are reused.

Solo starts with 25 m pylons; tower height remains player-controlled from 3 to 40 m. Its larger stations require 24 m between a pylon and terminal. Endpoint cages use the approved inclined arrangement (12° base / 20° top); a top terminal on a broad shelf interior can fail clearance if its incoming cabin would hit the mountain. Place it at a suitable edge or revise the line. Station foundations have local boarding channels, with refined terrain geometry under their footprints.

Guests queue on the central deck, reserve places in the docked valley cabin, board before departure and unload at the summit. Actual skier meshes stand in the cabin; display passengers remain hidden. One carrier remains empty for ride-camera use, consistent with other lift types. Solo supports construction previews, saving/reloading, tower editing, cabin camera, deletion and undo through the shared resort editor.
