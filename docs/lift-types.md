# Lift types on the empty map

Open `empty-map.html`, choose **Build a lift**, then select the lift type before placing stations and towers.

| Type ID | Technical menu name | Capacity |
| --- | --- | --- |
| `gondola` | 4-person detachable gondola — sliding-door cabin | 4 standing |
| `classic` | 4-seat fixed-grip chairlift | 4 seated |
| `ridge` | 6-seat detachable chairlift | 6 seated |
| `princesse-panorama` | 4-person detachable gondola — panoramic cabin | 4 seated |
| `princesse-touring` | 4-person detachable gondola — tall cabin | 4 seated |
| `arbois` | 4-person detachable gondola — faceted cabin | 4 seated |
| `jaillet` | 4-person detachable gondola — clamshell cabin | 4 seated |
| `solo` | 12-person reversible aerial tramway | 12 standing per cabin |
| `funitel-rocharbois` | 75-person reversible funitel — articulated cabin | 75 standing per cabin |

All nine types are buildable. Solo offers an inclined or level upper hall; the level hall requires a cliff.
The dropdown groups **Chairlifts**, **Monocable gondola lifts**, **Aerial tramways**
and **Funitels**. **Surface lifts** stays hidden until a model is available.
Solo belongs to Aerial tramways, separately from circulating gondolas.

Naming follows the mechanism and capacity, with descriptive cabin styles where
several gondolas share the same mechanism. POMA uses
[detachable gondola lift](https://www.poma.net/en/product-range/detachable-gondola-lift-mountain/)
and [detachable chairlift](https://www.poma.net/en/product-range/detachable-chairlift/);
Doppelmayr uses [reversible aerial tramway](https://www.doppelmayr.com/en/systems/reversible-aerial-tramways/).
Cabin-style suffixes describe the game models; they are not verified factory model
numbers. Earlier names (Classic, Panorama, Touring, Sigma Arbois, Sigma SP77, Solo
and 3-Section Train) remain design-study aliases in the notes below. In particular,
Sigma Arbois was a descriptive game name and Sigma SP77 was user-selected, not a
confirmed identification; see [cabin integration notes](gondola-integration.md).

Only display names, menu grouping and default names for new lines change. Internal
type IDs, user-named existing lines, geometry, capacities, operations and version-2
save data retain their meaning. Heritage and Glacier remain separate design studies.

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

Circulating-lift and train pylons have a downward floodlight on each side; Solo retains its approved unlit Heavy Portal structure. Fixtures glow after dusk and before sunrise; eight shadow-free spotlights are assigned to the nearest fixtures within 320 m of the camera to limit laptop rendering cost. The fade begins at 220 m. No new station or cabin lights are added.

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

`designs/single-arm.html` retains the approved 4.5 m cabin and single curved hanger. The longer carriage has eight running wheels, with one additional axle at each end of the original six-wheel arrangement and the original wheel spacing retained. The wheels now sit within slim continuous side webs around their axles, with rims projecting above and below the beam. The full-length top cap and end caps are removed; short bridges keep the haul attachment connected. The central arm, wheel centres and fixed support-rope datum stay in place. Traction now uses paired clamps on the cross-brace, slightly higher to clear the hanger attachment. One fixed support cable runs beneath the wheel grooves; two thinner haul ropes flank it and pass through paired cross-brace clamps. The curved hanger stays outboard of the support rope and attaches to a lug on one side of the carriage beam. Wheel rotation follows the cabin’s actual distance traveled. The reusable factory and original cabin inspection page share this revised carriage treatment.

Use **Trolley** or **Cable layout / end-on** to inspect the arrangement. Heavy Portal pylons and the inclined docking machinery remain in the Solo studies and paused runtime; the line and playground now wrap the stations in timber halls. Heritage and Glacier integration is deferred.

## Solo structure studies

`experiments/solo-structures.html` proposes three four-legged towers: Alpine lattice (29 m), Heavy portal (27 m) and Summit lattice (34 m). Heavy Portal is the default and retains its approved shaft and flared feet. Revised low crossheads replace the raised crowns and full solid decks: two transverse girders, slim inner beams with hanging fork brackets inspired by the supplied Long Roz crop, narrow service walks, and six/eight/ten larger 0.48 m radius haul sheaves per lane with visible fork bearings and axles. The fixed support rope follows the tops of the large wheel row, directly below the separate upper haul-rope guide plate. Solo passes along the fixed track rope with its haul rope directly above it in the same vertical plane. The tower and arrival routes have no sideways diversion; the large tower wheels support the lower fixed rope from underneath, while a separate slim plate guides the haul rope above it. The remaining small vertical adjustment follows the carriage clamp. This is a visual interpretation of the supplied photographs, not a surveyed mechanism. The fixed-track/saddle distinction follows the [Doppelmayr aerial tramway brochure](https://www.doppelmayr.com/uploads/tx_vcs/Pendelbahnen2013_ENG-Doppelmayr.pdf).

The arrival view contains an open steel cage with two inclined guide lanes, no building, an adjustable 12–38° guide angle (30° initially), and a docking position that places Solo’s cabin floor at the 0.52 m platform height. The carriage pitches with the guide; the cabin stays upright. **Centre the cabin** freezes a tower crossing or a docked arrival for inspection. The approved cabin is extracted into `src/lifts/solo.js` for reuse; the original cabin design HTML remains available.

References are preserved under `assets/references/telepheriques/solo-structures/`. These structures remain separate from the current resort builder pending user selection and refinement.

The tower wheel banks have continuous inboard backing plates parallel to each row. The upper blue-rope carrier is recessed 0.168 m below its earlier position, with small saddle pads reaching the cable rather than a high continuous support bar.

## Solo complete line test

Open `experiments/solo-line.html` for the combined rig: two Solo cabins shuttling on separate fixed track ropes, two enclosed timber station halls and three Heavy Portal supports on flat ground, an uphill slope and the crest of a hill. The stations retain their inclined docking machinery inside the buildings. `src/lifts/solo-structures.js` supplies this revised geometry for the line and playground; both remain separate from the resort builder. The earlier `solo-structures.html` page retains its bare-cage design study.

The 670 m horizontal layout has a lower valley and an upper terminal on a cliff terrace at approximately 233 m. The bottom cage uses a 12° approach; the upper cage faces downhill with a 20° climb into its docking position. The upper platform projects beyond the cliff, with open channels allowing the cabin to rise from below platform level. Both cabins share one arc-length displacement and always move in opposite directions. One drive schedule limits open-span speed to **10.25 m/s**, and holds **7 m/s** while either carriage crosses a pylon. Smooth acceleration/braking is bounded at 0.65 m/s², with an eight-second terminal dwell and doors opening only at the stops. Because both vehicles share a drive, either cabin's pylon passage slows the whole line. Carrier pitch follows the cable tangent while cabin bodies remain upright.

Use the pylon view buttons followed by **Pause at selected crossing** to inspect all three ground/slope cases; whole-line, side-profile, terminal and follow views are also available. The journey slider pauses at any position. Playback defaults to real time with quarter/half/double speed options. The support path remains central, flanked by the two haul ropes in each lane. The fixed track ropes terminate at separate station anchors/tension connections. The complete haul paths, lower drive and upper return/tension are now supplied by `src/lifts/solo-machinery.js`; see [the machinery notes](solo-machinery.md).

Cable geometry in the full Solo rig is defined span by span. Unsupported spans use gravity catenaries with a common tension parameter, reduced as needed to keep the ropes seated on their saddles. Grade changes are confined to the 8.96 m pylon wheel banks and short terminal receptor sections; there are no long free-space easing curves or horizontal approach plateaus. Rendering samples that profile directly rather than applying a global Catmull–Rom spline. Station cages, rope paths, roller contact normals, vehicle pitch and journey distance all use the same profile.

### Compact Solo docking guides

The complete-line terminal cage is shortened from 36 m to 19 m, with 16 m of lower guide wheels instead of the previous full-length bank. Cable entry transitions are contained in the outer six metres of these compact guides. The cliff location, fixed cage angles and floor-level stop positions are unchanged.

Station traction now runs through circular lead-in deflections, the lower double-groove drive and the upper staggered return/tension assembly. The former sliding upper receptor banks are removed. Pylons retain low guides for both haul ropes and have no raised upper wheel banks. Fixed support-rope geometry and native carrier motion remain unchanged. The machinery is a visual adaptation documented in [Solo machinery](solo-machinery.md).

### Enclosed Solo station architecture

The line and playground now enclose the cage in a timber-clad hall inspired by
[Stalden–Gspon / Arnold Zurniwen Architekten](https://www.azarch.ch/projekte/luftseilbahn-stalden-gspon).
The original geometry uses vertical timber screens, a pale concrete podium,
recessed window bands, a shallow standing-seam roof, two open-bottom cabin
portals and a rear pedestrian entrance. The hall covers the machinery while
retaining the 12° / 20° docking arrangement. Its width is 20.4 m, with the shell
extending from 12 m behind the stop to 15.5 m toward the span. Roof height follows
the local machinery envelope. These larger architectural bounds will need to
be included in placement validation when Solo returns to the main builder.

The playground's **Station buildings** checkbox hides both shells for machinery
inspection and keeps that choice when rebuilding. The reference photograph is
not bundled or used as a texture; the architecture is modeled in Three.js.

## Solo integration (on hold since October 16, 2026)

The [Solo playground](../experiments/solo-playground.html) now exercises the retained
runtime independently of resort saves. Adjust each Heavy Portal pylon's position
and height, station floor offsets, terrain case and span sag, then rebuild.
Playback, full-cycle scrubbing, dock shortcuts and pylon-crossing inspection use
the runtime's own schedule. Red terrain-envelope markers are a preliminary visual
check; they do not replace the resort's full construction validation. Alpine and
Summit lattice alternatives and the arrival cage remain in the structure workshop.

Solo is available again in the main resort builder. Browser saves are backed up under `lift-co-pre-solo-integration-20261018:` before the updated game saves. Existing hold-era backups remain untouched; they are not automatically merged into the current resort. Document version remains 2.

`src/lifts/solo-runtime.js` supplies the live line and the builder's elevation profile. Construction creates infrastructure only; opening the saved line creates exactly two Solo carriers. Both cabins use one common rope displacement, alternate between the two terminals, slow to 7 m/s when either crosses a pylon, and cruise at 10.25 m/s where the span permits. Stops last eight seconds, with doors closing before departure. The original eight-wheel single-arm carriage and compact station guides are reused.

Solo starts with 45 m pylons; tower height remains player-controlled from 3 to 150 m. Existing saved heights are preserved. Tall masts gain additional lattice bays. Its stations require 24 m between a pylon and terminal, increased to 30 m before a flat upper hall. The base remains inclined at 12°; Station B can use either the original 20° inclined guide or a level hall with a compact entrance transition and a 2.75 m guide nose carried by an embedded lattice portal. A flat arrival on a plateau or gentle hillside is blocked by the cliff check; any incoming cabin/terrain collision also blocks construction. Place it at a suitable edge or revise the line. Station foundations have local boarding channels, with refined terrain geometry under their footprints.

Guests queue on the central deck at either end, board the docked cabin before departure and unload at the opposite station. Actual skier meshes stand in the cabin; display passengers remain hidden. One carrier remains empty for ride-camera use, consistent with other lift types. Solo supports construction previews, saving/reloading, tower editing, cabin camera, deletion and undo through the shared resort editor.

## Rocharbois integration

Choose **Funitel → 3-Section Train** in the current game. The approved Sotelem A cabin has three independently supported, level compartments and flexible bellows. Two cabins shuttle on separate pairs of ropes at up to 5 m/s. Both game terminals use the approved Type A timber hall and three-pulley layout. Timber side walls, rear walls and front/rear gables enclose the building up to the roof, leaving cabin portals and pedestrian entrances open. The separate study retains its other terminal alternatives. Pylons use the approved Yumbo geometry and common grooved sheave style.

Equal-height terminals are allowed. Towers retain player-controlled position and height, with 24 m terminal spacing. Funitel towers can reach 100 m; other buildable types retain their 40 m limit. Above 30 m, the Funitel mast and collars become thicker and the concrete foundation becomes wider and deeper, increasing with tower height. Rope-lane spacing and the head geometry stay unchanged. The slider, number field, profile drag and saved-line validation use the same per-type limit. Stations have local terrain pads and recessed docking channels. The builder profile uses a conservative moving-load clearance envelope; in operation each cabin loads its own rope pair. Longer spans use a higher visual rope tension to bound deflection. This is the existing visual study solver, not an engineering load calculation.

The preview creates only infrastructure. Opening a line creates exactly two three-section cabins; one remains reserved for the interior camera. Guests use the existing base queue / destination unload system, with 75 standing anchors distributed among the three compartments. They carry skis inside. No piste is generated. Editing, saving, removal and undo use the shared lift definitions.

Runtime adapter: `src/lifts/funitel-runtime.js`. The original study is unchanged. Main-game sources were backed up to `archive/releases/pre-funitel-integration-20261016/`; existing browser saves are copied once to `lift-co-pre-funitel-20261016:` before the updated game saves progress. Integration has not been browser-tested in this change.

### Enclosed station housings

The shared red gondola and detachable chairlift housing has a solid underside. A 1.4 m continuous U-shaped slot, allowing for the curved hanger sweep, follows the two station rails and the rear turnaround for the moving hangers; the rest of the machinery bay is covered from below. These panels belong to the removable station housing, so the existing machinery inspection toggle still exposes the equipment.

### Funitel elevation guide

During Funitel endpoint placement, placing station A highlights terrain across the buildable map within ±1 m of A's snow elevation in teal. A brighter contour marks the closest match. The endpoint cursor and legend show the signed terrain-height difference; when both endpoints exist, the legend also reports the actual prepared platform-height difference. The overlay returns when selecting either endpoint tool and disappears during tower editing, when changing to another lift family, hiding the UI or leaving construction. It reuses the terrain geometry and changes no elevations. The highlight helps choose terrain with little excavation or fill. Both platforms are automatically aligned to A's foundation datum; B's local footprint no longer raises its platform independently.

### Funitel: Level lift

After placing endpoints and towers, **Level lift** aligns all tower contact centres with station A's actual cable elevation. Each height is calculated from the same raw terrain and station layout used by the operating Funitel, without quarter-metre rounding. The entire adjustment is one undoable edit. Towers added afterward also receive calculated heights.

If the required height is below 3 m or above 100 m, the tower is clamped to the nearest limit and highlighted red in the 3D preview, map ring, elevation profile and tower list. Its inspector reports the required height and whether it is too high or too low. Opening the lift is blocked until those towers are moved/removed or the alignment is revised. Diagnostics update when the draft changes. Both station platforms share station A's foundation datum. The far terminal's terrain pad is cut or filled to this elevation, so its cable contact height exactly matches A; Level lift then matches tower heads to the same cable datum. Manual changes can be followed by pressing Level lift again. Existing rope sag and cabin-weight behavior are retained.

## Leaning tower columns

In the current game, chairlift and gondola towers expose a **Side-view tilt · toward A / B** slider, limited to ±20°. Viewed from the side, perpendicular to rope travel, the column tips left/right from its fixed foundation. Its top moves along the lift alignment. Wheel centres and contact normals are rebuilt from the resulting cable profile, so the sheave assembly follows the rope rather than inheriting the column's tilt. The footing and foundation remain on the original placed spot. **Reset column upright** restores zero tilt.

The cable profile, preview, running cabins, height handles and elevation profile all use the moved head positions. Height stays the vertical cable height above the original footing. Construction is blocked if tilted heads would cross, crowd one another or crowd a terminal. Column tilt persists in `leanAlong` through saves, reloads, deletion/restore and undo. Older towers default to upright; the previous sideways control is removed. Funitel columns are unaffected. Shared mast geometry lives in `src/lifts/tower-mast.js`.

## Grouped foundation experiment

Open [Grouped towers](../experiments/grouped-towers.html). Five supports start on a crest, including three adjacent supports on one foundation. Adjust **Maximum neighbouring gap** to merge or split groups, select a tower, then move it along the alignment or adjust its height and lean. **Foundation close-up** focuses the selected group. Flat and side-slope terrains are also available.

Grouping follows successive along-line gaps (default 7 m); 0 m disables it. The test permits 1.7 m head spacing. Each group receives one continuous level concrete plinth covering its fixed column feet, with enough depth to intersect the slope. Columns pivot at the shared top face and their heads move along the line; the foundation does not slide when a column tilts. Footings that cannot support a low head at the chosen geometry are marked red with a message. Wheel locations and support/hold-down orientation follow the same shared cable-profile engine as the main builder, using the moved head positions. The workshop has no carriers and is not a structural engineering calculation.

This experiment uses the same mast implementation as the main game, and has its own temporary undo history. Grouped foundations are now also integrated into the main chairlift/gondola builder; the original workshop remains available for experimentation. Source: `src/lifts/tower-group-study.js`. These changes have not been browser-tested.

## Main-game grouped foundations and selection

Chairlifts and gondolas now allow **1.7 m minimum foundation spacing**. The **Group nearby foundations** slider controls merging by consecutive foot-to-foot gaps: default **7 m**, adjustable **0–15 m**, with 0 disabling grouping. Separate groups split automatically as towers are moved apart. Terminal spacing stays unchanged. Funitel supports retain their existing spacing and foundations.

Each close group has one continuous concrete base with a level top face and a contrasting cap. Its footprint covers the fixed feet and its bottom intersects the hillside. Columns pivot from this common top face. Cable heights remain measured above each original terrain site; raising a shared footing shortens the column rather than moving the cable vertically. Head offsets are recalculated from that actual column rise, and wheels follow the updated cable. Too-low heads above a common footing produce a red foundation and block opening the lift.

Close heads use shorter service decks and shorter, even-numbered sheave trains so neighbouring machinery fits the reduced spacing. The builder prevents tilted heads crossing or moving within 1.7 m of one another. Each line stores `groupDistance` along with its per-tower tilt and height; edit/reload, delete/restore and undo preserve it. Legacy lines default to 7 m grouping but their formerly wider spacing keeps them separate.

Selecting a tower in the preview, tower list or profile highlights that tower's column, head and wheels in gold. Shared foundations keep their own appearance. Selection is temporary and does not change the saved lift paint. Clicking a common footing selects its nearest column. Original materials are restored when selection changes or the UI is hidden. The pre-change sources are in `archive/backups/before-main-grouped-foundations-20261016/`. Integration has not been browser-tested.
