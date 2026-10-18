# Rocharbois funitel design study

Open [the Rocharbois atelier](../designs/funitel-rocharbois.html). It is a separate page; the current resort build and saves are unchanged.

## Reference research

The supplied [Remontées-Mécaniques.net report](https://www.remontees-mecaniques.net/bdd/reportage-fun-v-rocharbois-poma-4761.html), by J’ib, documents the 1985 Poma installation with Sotelem cabins and Yumbo pylons. Two reversible cabins each have three 25-person compartments. Each cabin uses a 3 m rope spacing and three double fixed grips on each side. Reported operating speed is 5 m/s. The real line is nearly horizontal, with 16 m of height difference over 1,081 m.

The report includes a cabin drawing, a two-loop rope diagram, tower-head close-ups, a timber return terminal and the Caboche boarding frame. Its return end has three pulleys; the drive end uses a double-groove wheel. These references guide the study. Photos date from 2012–13; this is a proposal based on that historical appearance.

Twenty-four unmodified reference images are preserved in `assets/references/funitel/rocharbois/`, with original image URLs and credits in `sources.json`. Eighteen are available in the study's enlarged gallery, including the drawings.

## Cabin proposals

**Cabin A / Sotelem is selected.** B / Traverse and C / Belvédère are retained in the archived earlier studies and are no longer shown in the active cabin selector. Dimensions below are visual estimates chosen for the model, not factory specifications. The selected cabin consists of three distinct rigid bodies, joined by two short accordion bellows. Each body has its own floor, tub, glazing and roof; no rigid shell or full-length rail bridges the joints. Six compact double-clamp assemblies hook directly around the two ropes. There are no cabin-mounted wheels.

| Proposal | Body dimensions W × L × H | Interpretation |
| --- | --- | --- |
| A — Sotelem | 3.0 × 8.5 × 3.28 m | Closest reading of the original drawing: clipped corners, tall glass, deeper brow and restrained skirt. |

The selected shape is retained. Blue, Lift Co. red, ivory and custom paint are independent controls. Each section has fixed side windows and a narrower central pair of sliding door leaves on each flank. The doors occupy 52% of the straight side opening; the remaining glass stays fixed. The leaves slide over those fixed windows on offset tracks. That door travel is an inspection approximation, not an established reconstruction of the original linkage. Each section has its own grab rails and a central gangway into the bellows. The flexible joints have six visible folds, separate end hoops and short floor thresholds. Roof lettering is split between the sections.

## Tower proposals

All use a single tubular shaft, a central crosshead, four longitudinal twelve-sheave support banks, rocker plates, maintenance walks, ladder and a concrete footing. The rope sits on top of the support sheaves. Each bank has eight level middle wheels and only two progressively lower wheels at each end; wheel centres are offset below the cable along its local normal, so the groove follows the actual contact curve. Rocker plates and backing girders follow that crown. Separate comparison towers use a 12 m rope height.

- **A — Yumbo:** slim shaft and restrained transverse girders; closest overall reading of the tower photos.
- **B — Saddle:** heavier collar, longer knees and deeper rocker plates.
- **C — Crossbeam:** deeper compact crosshead and shorter braces.

Bracket offsets and the central braces leave the two cabin envelopes open. No ordinary gondola hanger or Solo trolley is substituted.

## Station proposals

- **A — Timber return:** low gable over two recessed docking channels, timber rear wall, three-pulley machinery group.
- **B — Caboche frame:** brown steel boarding porch and diagonal knees in front of a machinery room, with a double-groove wheel.
- **C — Open gallery:** lighter roof strips and more exposed receptor banks around the same two-bay plan.

Hide the roof to inspect machinery, platforms and both lanes. Cabin floors meet the platform height. The pulley groups now include routed ropes and distance-driven rotation. The inner return wraps the central pulley; the outer return uses both side pulleys and their common tangent. The drive swaps outer-left to inner-right on its lower groove, and inner-left to outer-right on its upper groove, matching the report diagram’s single two-loop circuit. Horizontal steering sheaves and vertical guide pairs carry the corresponding deflections. Diameters, clearances and groove separation are estimated for this model; hydraulic tension travel is not simulated.

## Together view and controls

Pick any cabin, tower and terminal proposal independently. The compact demonstration has two level terminals, three supports and two oppositely moving cabins. Its stopping positions are 166 m apart horizontally. Drive progress uses the reference route distance, with 5 m/s cruise, three-second acceleration, sixteen-second braking and seven-second terminal dwells. These timing/layout choices are for the study. The four ropes are now updated from moving cabin loads. Each cabin deforms only its own rope pair; the unoccupied spans retain a small self-weight sag. A constant-tension vertical cable model uses smoothly distributed weight and upward-only tower/terminal contact. It no longer forces the rope into three flat attachment intervals. Station extensions are straight and level: a small contact arc around the first sheave leads onto the flat row. The tower ends drop about 0.13 m beyond the flat middle; a mid-span cabin produces substantially more sag than an empty span. These are visual load/tension ratios, not real cabin masses or an engineering catenary calculation. Terminal docking rails remain level. All station pulleys and receptor wheels rotate with the signed drive displacement, stop during dwell and reverse with the shuttle.

- Cabin A is selected. Compare tower and station proposals A/B/C, or select one card to inspect it.
- End-on, side, roof/plan and grip/wheel/machinery camera presets.
- Follow cabin, pause, Tower passage, dock and position slider in Together view. Tower passage pauses both cabins at the central pylon and frames one close up.
- Left-drag orbits; right-drag looks around the camera's own position; scroll zooms.
- A/B/C selects a proposal; Escape returns to comparison.
- Reference thumbnails enlarge, with previous/next navigation.

The selected cabin uses a fixed 3.60 m rope datum above its floor, with a 0.06 m centre support between the roof beam and the rocking clamp rail. The clamp jaws have a shaped opening around the rope and fastening bolts, mounted directly on short roof blocks. The Together view derives its platform height from the same datum. This is a shape study; complete moving clearance at tower and terminal machinery remains for the engineering pass.

Each of the three sections stays level in ordinary travel and follows its own height on the loaded curve. Its two near-end clamps share a short rocking rail with a visible pivot connecting it to the roof. This separates the level body from the cable tangent without leaving disconnected hooks. The two actual clamp contact points determine that rail's pitch and position. The support stays fixed in length; the clamp rail rotates only about its centre pin. There is no adaptive lowering or telescoping to alter the body-to-hook distance. Bellows flex between sections, and fixed horizontal body spacing prevents overlap. Arrival sway rocks the bodies at their connected roof pivots. The follow camera tracks height as well as horizontal movement.

The page shares cached primitive geometry and materials; static mesh regions are merged. Doors remain independent. Four lightweight rope buffers update only when drive position or sway changes; the cable contact solve also stops while paused. Towers and stations load when their sections are first opened. Pixel ratio is capped at 1.4, with a 1,024 px shadow map.

## Files

- `designs/funitel-rocharbois.html`: file-openable entry page; no build step.
- `src/lifts/funitel-rocharbois.js`: reusable proposal geometry.
- `src/lifts/funitel-terminals.js`: grooved pulley models, analytic terminal rope paths, guide sheaves and signed rotation.
- `src/lifts/funitel-loaded-rope.js`: moving-load cable equilibrium, rigid grip constraints and unilateral sheave contacts.
- `src/lifts/funitel-study-viewer.js`: comparison, cameras, references and paired shuttle demonstration.
- `src/styles/funitel-study.css`: atelier-specific styles over the existing cabin study stylesheet.

The first version is preserved in `archive/backups/rocharbois-round-one/`; the three-section revision before cable sag is preserved in `archive/backups/rocharbois-before-sag/`. Source reviewed. No browser or automated tests were run. This study awaits design selection before integration into the resort builder.

## Clamp spacing correction

Each section now places its pair of cable clamps 0.30 m in from the front and rear body edges (roughly 2.05 m apart), repeated on both ropes for all three sections. The short mounting blocks sit under the clamps; their connecting rail spans the wider spacing. The loaded cable contacts those actual clamp positions; its render mesh includes an exact ring at each jaw. The body-to-hook geometry is rigid.

## Earlier braking and arrival sway

From 5 m/s, braking begins 40 m before the stopping position (previously 7.5 m). Both cabins share the longer reversible-drive schedule. During the last three seconds a small braking lean builds, then continues into a damped forward/back oscillation at the stop, starting at 0.65°. It settles through the dwell; door opening starts after 1.1 seconds. The entire cabin, roof and fixed jaws move together about the roof attachment; the loaded rope follows the moving jaws. The opposite cabin sways in the opposite travel direction. Ordinary cable travel remains level. Pausing freezes the arrival motion; manual position inspection is still.

## Moving weight correction

The old implementation moved separate bodies and grips along a fixed drawn rope; it is backed up in `archive/backups/rocharbois-before-loaded-rope/`. The current implementation solves a small-angle tensioned string for each carrier pair. A rigid block enforces a straight rope contact line across all the carrier’s attachments. A tridiagonal active-set solve applies the moving weight and self-weight, with wheel-bank heights as lower bounds. Those contacts can push the rope upward and release when the carrier lifts the rope away. Each section’s pose is taken from its own solved rigid block, so no grip can float above its own roof. The earlier whole-car rigid block is superseded by the section model below. This is quasi-static visual equilibrium, without elastic wave propagation, rope stretch or dynamic tension simulation. No tests were run.

## Independent sections retained

The moving-load model now has three independent rigid attachment blocks rather than one whole-car block. Each carries one third of the cabin load. Each section stays level in normal travel, rises onto the tower supports at its own position, and keeps its body, roof and clamps attached throughout the motion. The two accordion joints interpolate between those body transforms. Horizontal spacing stays fixed, preserving body clearance. The previous whole-car version is retained in `archive/backups/rocharbois-rigid-whole-car/`. Source reviewed; no tests run.

## Smooth weight distribution — current motion

The former flat-block constraints created plateaus under the sections and corners between them. That version is preserved in `archive/backups/rocharbois-before-smooth-load/`. The current solver spreads each section's third of the cabin weight over a smooth 1.05 m Gaussian footprint. An active-set tensioned-string solve supports the rope on the sheave banks, and continuous-tangent interpolation renders the resulting curve. There are no moving hard flat intervals. Each short two-jaw rocker fits two actual points on that curve, while its central roof pivot keeps the cabin level and visibly connected. This supersedes the rigid clamp-block descriptions in the historical notes above. No browser or automated tests were run.

## Station mechanics and fixed clamp pivots — current revision

Both terminals now connect to the loaded line at a common plane 2.35 m behind their centres; the field ropes stop at that junction rather than continuing through the machinery. The source diagram’s routing is preserved: inner/outer U returns at one end and an inner/outer swap through the two drive grooves at the other. A tangent construction joins the horizontal steering sheaves to the drive wheel. Short vertical S transfers meet the two groove heights. Estimated groove separation is 0.30 m.

Large wheels have shaped grooves, flanges, perforated webs, bolted hubs and fixed bearing structures. Entry wheel rows remain flat. Wheel angle comes from signed rope displacement divided by contact radius; the two sides counter-rotate, and reversal follows the shuttle drive. The drive’s twin grooves share one rotor. Optional rope markers show the route direction.

In Stations, hide the roof and choose Machinery or Roof/plan. Pause mechanism freezes the inspection animation; Together uses the actual shuttle schedule. Rope motion markers can be toggled in either section.

The cabin clamp support is now fixed: no scaled or sliding support geometry. The two hooks retain their fixed separation on a rail that rocks only around the centre pin. The level body stays connected through a 0.06 m support. Arrival sway occurs at the roof joint. This replaces the adaptive-height rocker in the preceding revision.

The pre-mechanics source snapshot is `archive/backups/rocharbois-before-terminal-mechanics/`. Source reviewed; no browser or automated tests were run. The station geometry and hydraulic equipment remain a reference-based visual model, not surveyed engineering drawings.

## Tower contact spin and lower clamps — current revision

Tower wheels now idle at 5.5% of rope speed while their lane is unloaded. As the nearby cabin loads the rope onto a sheave, actual rope clearance and cabin proximity blend that individual wheel toward rope-matched rotation. Wheels accelerate progressively and coast back to idle after passage; opposite lanes counter-rotate, reversals follow the drive, and pausing freezes the motion. Standalone tower inspection shows the slow unloaded rotation. Three shared instanced wheel meshes per tower keep the additional draw calls bounded.

The fixed rope datum is lowered by 0.16 m, to 3.60 m above the cabin floor. The roof-to-pivot support is now 0.06 m and remains fixed. The rocking rail still pivots only about its centre. The roof crown has slightly narrower shoulders to leave clearance for the lowered rail; the three bodies, window openings and near-end hook spacing are retained. The previous source is backed up in `archive/backups/rocharbois-before-tower-contact-spin/`. Source reviewed; no browser or automated tests were run.

## Classic resort sheave appearance

At the user's request, the funitel tower wheels, station entry rollers and small terminal deflection sheaves now use the main resort's sheave construction: a deep dark running groove, broad metal side cheeks, a raised central hub, a through axle and a radial rib. A few hub fasteners add relief. The shape is scaled to the existing contact radius and wheel spacing, retaining the established cable paths, rotation axes, contact-dependent speed and instanced tower rendering. The large double-groove drive wheel and three return bullwheels retain their separate reference-based geometry. The earlier wheel geometry is preserved in `archive/backups/rocharbois-before-classic-sheaves/`. Source reviewed; no browser or automated tests were run.

## Main game integration — October 16, 2026

Rocharbois is buildable in `empty-map.html` under the new **Funitel** category. Uses cabin A, Yumbo A towers, Type A timber stations at both ends, each with the three-pulley layout. The runtime adapter places the approved structures along a player-defined line and uses the same moving-load solver for each rope pair. Equal-height endpoints are supported. The separate design study remains available. See [lift types](lift-types.md#rocharbois-integration) for behavior, save backups and current scope.
