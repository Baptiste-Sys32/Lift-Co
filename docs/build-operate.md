> **Current release: V3.** [V3 checkpoint, graphics, terrain, UI and compatibility notes](v3-checkpoint.md) supersede the earlier release-specific version statements below. World documents now write version 3; existing V1/V2 slots still migrate. Historical verification entries retain their original versions.

# Build and operate the Upper Snowfields resort

Entry point: `empty-map.html`. The original `index.html` stays separate; the approved carrier designs are retained. The new controls use the existing sidebar and camera.

## Construction

- Edit a lift and choose Station A/B (or Palace8 Station M) to set its boarding floor in 0.25 m steps.
  Select Terrace for cut/fill or Raised to retain the hillside. Raised stations
  have structural feet; the footprint is checked against hillside penetration.
  The 3-Section Train retains one common platform datum.
- Drag station rings to relocate stations. Tower positions project from their
  previous world positions; brass lines join original and proposed foundations.
  Red clearance/spacing messages block Apply while the preview remains editable.
- Drag tower footing rings along the alignment. Side handles and profile dots
  change height. Copy/Paste transfers height and tilt, retaining the target ID
  and position. Existing grouping and tilt controls remain available.
- All placement paths share finite-coordinate, boundary, length, tower-height,
  ±20° tilt and footing-spacing checks, including loading V1/V2 saves. Ordinary
  towers need 1.7 m between feet; reversible pylons need 10 m. Terminal margins remain
  model-specific (14 m normally, 24 m for the train and Solo). Non-horizontal lifts need
  their mountain platform at least 2 m above the valley platform; the train may
  have equal-height platforms. Terminal footprint checks include rotated corners,
  and exposed parallel/crossing corridors need 7 m of vertical separation.
- Cancel discards the preview. Construction pauses guests and machinery while
  camera navigation stays available. Apply rebuilds affected runtimes in place.
- The workbench provides session Undo/Redo. Each committed construction edit is
  one action; pending brushes, point drags and lift edits have local Undo/Redo.
  Ctrl/Cmd+Z and Shift+Ctrl/Cmd+Z select the appropriate history.

## Operations

Choose a lift in Your resort. Open/Closed governs new boarding; Run/Stop governs
that line's motion. Cable speed ramps at 0.65 m/s² and carriers retain their
current loop positions. Fixed-grip chairs use the selected speed throughout;
detachable terminal crawl remains controlled by the model and never exceeds
its selected cable speed. Boarding is restricted to the gate approach while the
carrier's doors or safety bar are open, at either terminal.

Detachable chairs (Ridge, Arcabulle and Panoramabahn) use a damped fore/aft
pendulum driven by their measured speed change. Braking swings the chair forward;
acceleration leaves it trailing the grip, then it settles along the line. The
hanger, seats, riders and ride camera move together while the grip follows its
existing cable/rail path. The same response covers Panoramabahn's transfer in
both directions. Fixed-grip station speed behavior and gondola motion are retained.

Carrier count and dispatch spacing are linked and clamped to catalog dispatch
pitch. Dispatch spacing is the equivalent line distance at catalog maximum
speed, rather than the packed distance inside a detachable terminal. Fleet
changes rebuild immediately and return assigned guests to the terminal where
they boarded. One carrier remains reserved for the camera. The train and Solo each have two
paired carriers that cannot be reconfigured. Readouts show queues, occupants and an
estimated capacity per direction. The estimate integrates the actual loop with
its terminal crawl and excludes the camera carrier. Closed or stopped lifts
show zero capacity; reservations and guests still boarding count as queued
until fully aboard; riding matches the global HUD. This is an upper bound: it does not simulate a full-carrier dispatch
schedule, queue service guarantees or measured throughput.

Catalog speeds and carrier capacities are game values retained for the approved
models; this checkpoint does not retune them to manufacturer specifications.
The existing train scales its complete model clock with selected speed, including
acceleration, braking and station dwell. That deliberate simplification remains;
the capacity estimate includes its 3 s acceleration, 16 s braking and 12 s dwell
at catalog speed. Boarding avatars approach sequentially, so actual fills may be
lower than the readout, especially for a 75-place train.

## Terrain, pistes and paths

Sculpt snow opens a pending edit. Raise, Lower, Smooth and Flatten have radius
and strength controls; Flatten takes its target from the start of the stroke.
Each stroke is a single action. Only terrain patches and scenery instances in
its dirty region are updated while brushing.

Draw piste / Draw footpath starts a curve. Click snow to add points and drag its
handles to reshape it. Width is editable globally or at a selected point; paths
default to 3 m and stay within 2–6 m. Set a point's elevation to create a separate
feature-owned shaping layer. Removing or rerouting the feature replays terrain
without its previous layer, preserving other owners and sculpting layers.
Station terraces remain tied to station definitions and fixed platform datums.

Routes start closed. Open the route when ready, then Apply. Pistes receive a
snow strip, poles and a sign; intersecting scenery instances are hidden and
restored reversibly. The inspector measures the steepest sustained 25 m:
green ≤8°, blue ≤16°, red ≤25°, otherwise black. Chosen signs are independent;
guests use the measured rating. Cross-slopes above 25° are flagged and block
opening. Uphill sections must stay within 2 m cumulative rise and 20 m length.

Switch terrain tools or pending routes inside the same edit. Adjust lift / Add
lift opens the original lift editor within the pending transaction; applying a
lift there adds it to that transaction. Final Apply validates the combined
terrain, route and lift result. Cancel restores the committed resort.

## Explicit connections and guests

Teal rings are snap targets. Click a ring while drawing, or select an endpoint,
choose its named target and Confirm connection. Green endpoint rings are
connected; red rings are disconnected. Proximity and crossings add no edges.
Make junction splits a route at its selected interior point and explicitly
connects both halves to the new junction. Other routes can connect endpoints to
that junction. The pending-route selector allows work on multiple curves.

The entrance selector chooses any passenger station, including Palace8 Station M; the first built
station is the default. Walking edges are bidirectional, piste edges descend in
drawn order, and lifts board/unload at both ends. Guests receive one of four
abilities equally, choose reachable descents with queue/travel/variety costs,
and require an entrance return before leaving. With no reachable outing they
wait at the entrance. Closures replan remaining travel; people already aboard
finish unless their lift is stopped. Changed occupied infrastructure returns
guests to the entrance with a notice. Completed descents alone increase runs.

The global skier HUD shows green/blue/red/black ability counts and the number
waiting at the entrance (idle there, with no remaining plan or current edge).
The existing runs-served counter remains the only served-runs tally.

## Persistence and verification

The current document is version 3: stable-ID lifts, pistes, paths, junctions, ordered
terrain layers and an entrance-station reference. V1/V2 lift types, heights, tilt
and grouping remain intact. Legacy automatic pistes become independent entities
once. Operating settings persist. Browser slots are copied to
`lift-co-before-build-operate:<original slot>` before migration; saving is
blocked if the pre-change browser backup cannot be made. Export includes it.

Source originals are in `archive/backups/before-build-operate-20261016/`.

Checkpoint verification (2026-10-17): JavaScript syntax checks; targeted
placement probes for rotated terminal corners, parallel/crossing clearance,
invalid/degenerate moves and tower limits; headless Chrome load/error-overlay
checks (with the animation loop paused between probes); all eight existing catalog types constructed with matching carrier
capacities; a fresh V2 save reloaded with types, IDs, heights, tilt, grouping and
operating settings intact. Boarding-window and stopped/closed readout checks
also ran against the browser runtime, including an actual station drag that
collapsed the line and blocked Apply without an error-overlay entry. A V1
payload migrated with its exact backup and one-time piste conversion; a forced
backup failure left the original slot untouched and blocked commits/autosave.
HUD probes checked exact ability/entrance counts and the single served counter. These are temporary checkpoint probes,
not a new repository test suite. Full interactive scenarios 1–10 and laptop
frame-rate/performance review remain outside this checkpoint verification.

Deliberately unchanged: document version 2 and V1 migration, ability-aware outing
selection and entrance-return fallback, sustained 25 m/cross-slope measurement,
ordered terrain-layer replay, pre-change backup gating and Ctrl/Cmd+Z routing.
Station terraces remain analytical shaping tied to station definitions; full
height-cache replay is still used for some completed edits. This checkpoint
stabilizes that implementation rather than completing the broader resort plan.


### Solo téléphérique integration

Solo is buildable in the resort with its approved timber halls, Heavy Portal pylons,
fixed carrying ropes, twin traction circuits and two paired 12-person cabins.
Catalog cruise is 10.25 m/s, pylon passage is limited to 7 m/s, and native dwell is
8 seconds. Speed control scales the shared schedule, including dwell (the same
simplification used for the reversible train). One cabin stays empty for the ride
camera. Capacity readouts use the native full round-trip duration. Both ends board.

The valley guide remains inclined at 12°. Station B offers an inclined 20° dock
or a flat hall. New Solo lines default to the flat hall; existing saves retain the
inclined dock until edited. Both profiles need a clear approach from the valley;
the flat hall additionally requires an underlying cliff. Terrace construction clears two cabin channels through the
station apron and up to 24 m into the approach, blending out by 34 m. Cut depth is
limited to 8 m; deeper cuts and any remaining swept-cabin terrain intersection block
Apply with an editable placement message. Raise the floor or move the station to
resolve them. Raised foundations preserve the hillside and require natural clearance.
This does not excavate a tunnel through the mountain or flatten the whole lift line.

Solo earthworks derive from its station positions, elevations and foundations on top
of ordered sculpt/piste layers, matching the existing station-terrace system. Edits,
cancel, deletion and undo recompute them without leaving old cuts behind. Station
chunks gain 2 m terrain detail. Solo does not generate close-pass woodland trees;
existing scenery in the lift corridor is cleared through the shared scenery system.
The Solo integration retained version 2 and the V1 migration; V3 now migrates those same records to version 3. A
pre-integration browser-save backup uses the existing blocking backup gate.


### Technical lift names

The builder uses capacity and mechanism names from the shared catalog: fixed-grip
and detachable chairlifts, detachable monocable gondolas, reversible aerial tramways
and reversible funitels. Solo is in its own Aerial tramways group. Gondola variants
use descriptive cabin styles; design-study nicknames are retained as documentation
aliases rather than presented as manufacturer identifications. The same catalog
supplies HUD names and default names for new lines. Existing user-named lines and
all saved type IDs remain unchanged. See [the naming table and sources](lift-types.md).


### Solo span clearance and tall pylons

Solo pylons now allow 3–150 m height, with a 45 m default for newly added pylons.
Existing pylon heights stay unchanged. Tall Heavy Portal masts add lattice bays
at roughly 5 m intervals instead of stretching the original seven bays.

The carrying/haul profile solver checks unilateral saddle contact at open pylons.
The enclosed station docking-guide transitions are constrained paths and do not
force the whole cable line to lose tension to match their prescribed docking angles.
Free spans retain gravity catenaries; carrier wheels, couplings, guides and ropes
all sample those same profiles. Low pylons can still require tension adjustment.
The builder displays the resulting maximum free-span sag, including that adjustment,
rather than the misleading generic metres-per-50-metres label. Taller pylons and
sensible approach supports permit longer clear spans; terrain and saddle checks
still block an unsuitable layout. The station guide constraint is a game model,
not a full structural/tension-load simulation. These mechanics originally shipped with save version 2; V3 retains their fields.


### Flat upper arrival for Solo

Edit Solo, select **Station B**, and choose **Flat inside · cliff approach**.
The carrying and haul ropes, trolley, rollers and station frame remain horizontal
through the boarding hall (15 m towards the valley). The rounded entrance
transition occupies 15–18 m from the dock, ending 2.5 m beyond the façade. Its
Heavy Portal-style girders end at 18.25 m: a 2.75 m external nose, supported by
a flared, X-braced mast embedded in the front podium. The former long external
cage is removed. The last pylon must be at least 30 m
from Station B; Station A keeps its 24 m margin. Flat upper halls use continuous fixed-rope saddles on brackets at about 1.6 m
pitch, plus moving haul rollers at about 1.4 m pitch.
Flat and inclined station profiles use the same catenary, machinery, carriage-contact and guest-boarding code.

A flat arrival is blocked on a plateau or gentle hillside. The underlying terrain
beneath each cabin lane must be at least 8 m lower 34 m out from the dock, and must
include a drop of at least 10 m over a 25 m section within the first 60 m. This is
the game's cliff criterion, sampled before station terraces/channel cuts. Merely
raising the building or excavating its channels cannot satisfy it. Full swept-cabin
clearance and the existing 8 m earthwork-depth limit also apply. The flat channel
floor stays level inside, then falls into the approach; it does not reshape a
plateau into a cliff. Changing profile previews the terrain and supports Apply,
Cancel and local/session Undo/Redo. The optional `arrivalProfile` field is saved
in the existing lift definition (retained from V2 into V3); older absent values mean inclined.

### Solo suspension motion

Solo's fixed carrying rope and twin haul grips keep the trolley on the solved
profile. The single hanger and cabin swing about the upper attachment pin;
passengers and the ride camera follow that suspended body frame. Changes in
carriage velocity and rope grade excite a damped pendulum, so braking into a
station, leaving it, and passing a pylon produce a short response. There is no
circulating-grip turnaround kick, free yaw, wind or arbitrary idle oscillation.
Fore-and-aft motion is limited to about 1.6°, with at most 0.18° of coupled lateral
roll. Station capture starts 8 m before the guide (20 m from the base dock, 26 m
from a flat upper dock), progressively increases damping and reduces those limits
(to about 0.225° pitch / 0.018° roll at the dock) before boarding.

Sway uses actual simulation seconds and speed-scaled carriage velocities,
including operating-speed ramps. Stop freezes the cable/machinery while residual
cabin motion settles; global Pause and construction freeze the suspension too.
The independent workshop's journey scrub resets the pendulum rather than applying
a false acceleration from a time jump. Swing is transient runtime state; no save
schema or stored operating settings change. Solo's swept-ground check includes
the hanging-body offset and small swing envelope. Inclined dock datums account
for the moving attachment point so neutral boarding floors retain their level.


Solo station carrying ropes now sit on continuous saddles, matching the pylons;
the old stationary support-wheel rows are removed. All small haul rollers at
stations and pylons use absolute haul displacement divided by wheel radius,
with opposite rotation on the two lanes and reversal with the shuttle. Small
silver face marks make their rotation visible. Instanced wheel matrices update
with that phase; dwell and Stop keep those wheels stationary.


### Approved chairlift and Palace8 integration

All four B designs are buildable in `empty-map.html`, alongside the previous nine choices. Existing type IDs and the four-person Princesse cabins retain their meanings.

| Stable type ID | Approved model | Line maximum | Station crawl | Passenger stations |
| --- | --- | --- | --- | --- |
| `chair-arcabulle` | Full shoulders / six-seat bubble chair | 5 m/s | 0.65 m/s | A, B |
| `chair-alps5` | Round crown / fixed-grip double | 1.8 m/s | selected line speed | A, B |
| `chair-panoramabahn` | Deep bubble / four-seat bubble chair | 5 m/s | 0.65 m/s | A, B; angle structure has no access |
| `gondola-princesse8` | Broad waist / eight-seat Palace8 | 6 m/s | 0.4 m/s | A, M, B |

The old double deliberately uses a fixed clamp, Classic canopy, period mast and no detachable conveyor. The real Alps n°5 reference is detachable; the game adaptation follows the user's explicit override. The other approved terminal shells, open angle structure, curved mid-station and gondola-style pylon are retained. Detailed bullwheels, haul-deflection pulleys, conveyor tyres, carrier running wheels and tower sheaves animate at their corresponding local carrier/rope speeds, with opposite travel on the two lanes. Grips pitch with the cable, release on supported station rails and reattach before leaving. Bubbles/bars open at passenger stops and stay closed through the passenger-free turn. Palace8 doors face the outside boarding platform, and its eight occupied seats show eight corresponding ski-rack positions.

Only Panoramabahn and Palace8 have two-span layouts. Choosing one and placing A/B automatically creates its middle position. Drag its ring to reshape the bend; choose **Angle structure** or **Station M** to edit its datum and foundation. The angle structure's height field controls transfer-rope elevation rather than a passenger floor. Both turn directions are supported from 5° to 55°, with at least 75 m between the middle position and each terminal. Towers and their tilted heads stay 14 m beyond the ends of the transfer structure. Invalid moves remain editable and block Apply.

Distances, tower fractions, the elevation profile, cable sampling, scenery clearing and crossing checks follow the actual supported centreline through the middle. Moving any station projects existing tower feet from their previous world positions onto that alignment. Station overlap and raised-foundation checks include the bent outgoing footprint. New-family towers default to 12 m and allow 3–60 m; existing models' limits are unchanged. Tilted columns retain fixed feet; close towers retain shared foundations and use shorter sheave banks to fit their spacing. Sheave centres use the same rope profile and contact normals as the carriers. Raised stations use a supported raft and piers down to the hillside, without station terrain shaping. Terraces are tied to each station definition and disappear/recompute on move, cancellation, deletion and undo.

Palace8 adds an explicit M snap target and entrance choice. Its graph has all six directional station-to-station rides. Through guests stay in the same cabin; guests alight only at their destination. Mid-station boarding uses separate travel directions. Panoramabahn's angle structure creates no pedestrian target, queue or graph node. Reconfiguring a fleet returns riders to their original boarding station and preserves their intended destination, including M. Speed, opening, stopping and fleet changes remain one coupled operation for the complete lift. One carrier stays reserved for the ride camera.

The cable/transfer model remains a game approximation: one synchronized circulating haul loop follows the supported deflection through each intermediate structure. The historical Princesse has coupled sections and multiple drives; independent rope circuits, tensions, load transfer and manufacturer-specific brake/dispatch timing are not simulated. Station creep and compact transfer acceleration are chosen for this game geometry. There is no money, construction timer, physical carrier garage or independent section control.

The expansion integration originally used version 2; V3 writes version 3 with the same fields. The two dedicated layouts add optional `mid`, `stationElevations.mid` and `stationFoundations.mid` values inside their existing lift records; ordinary lift records need no middle position. All previous IDs, V1 migration, terrain layers and operating fields retain their meaning. Before any save write, browser slots are copied once to `lift-co-pre-next-lifts-20261018:<original key>` through the existing blocking backup gate. Source originals are in `archive/backups/next-lift-game-integration-20261018/`.


Integration verification (2026-10-18): syntax checks passed for the twelve touched/new JavaScript sources and the main inline module. Isolated Chrome loaded all thirteen catalog choices with an empty error overlay. A fresh V2 save reloaded all four new types with tower tilt and operating settings intact; a V1 data probe retained its original type, tower settings and grouping. Browser probes exercised all twelve directional passenger journeys across the four additions, including Palace8 through travel without changing seats. Speed ramps retained riders, Stop froze carriers and machinery, and Resume moved them again. A fleet change returned a Palace8 rider to M's correct queue with the original destination; session Undo/Redo restored fleet sizes. An actual M-ring drag passed local undo/redo, Apply and session undo/redo. Additional probes checked a shared foundation, carrier-free construction previews, raised stations, both turn signs, and blocking messages for missing/straight/too-close intermediate positions. Static geometry is merged and repeated moving parts are instanced; dense rope sampling is limited to station machinery. No automated repository test suite was added or run, and laptop FPS remains a user review item. The original `index.html` checksum is unchanged.

## V3 checkpoint

Graphics presets and individual device settings, focused workspaces, rounded station banks, conforming terrain refinement and embedded/scaled concrete footings are implemented. See the [V3 release record](v3-checkpoint.md) for exact behavior, save backups, research and verification. Endpoint status rings remain green/red; selectable connection targets remain teal. Operational rules, ability routing, entrance returns, 25 m piste measurement and ordered terrain-layer replay are unchanged.

Single-station drafts remain editable. Their height/foundation controls work before the other endpoint is placed; terrain and scenery previews wait for both endpoints. Apply still requires a complete, valid line. See the placement hotfix record in [V3 notes](v3-checkpoint.md).


## Approved station types

The construction panel offers a lift-wide Station type selector. Original station preserves the native model; an approved alternative changes both end stations together. Fixed-grip chairs offer Delta B, monocable gondolas offer Princesse B, Solo offers Faron B, and the reversible funitel offers Bouquetin C. No detachable-chair alternative was approved. Dedicated middle/angle structures keep their existing designs.

Building geometry is shared with the station workshop and adapted to native lane widths and passenger floors. Cable profiles, boarding positions, capacities, carrier motion and operating controls remain runtime-owned. Delta motors follow cable motion and its support triangles clear the wider four-seat chairs. The funitel keeps its existing coupled return routing rather than adopting an independently driven study layout. Faron's entrance clearance adapts to the haul rope; its wing pad stays outside the cliff corridor. Raised foundations reach existing terrain and do not sculpt it.

A compatible optional `stationStyle` is stored inside the existing version 3 lift record. No document version bump or lift ID changes are made. Missing styles preserve legacy appearance. The selector uses construction Apply/Cancel, local Undo/Redo and session history. Footprints, scenery clearing and terrain previews include the alternative architecture. Backup failures block saving as before; source snapshots are under `archive/backups/approved-stations-game/` and browser snapshots use `lift-co-pre-station-styles-20261020:<original key>`.

Verification (2026-10-20): syntax checks passed. All ten compatible lift models created two approved endpoints with finite transforms; all ten reloaded with station style, tilt, grouping and operating settings intact. A valid fixed-grip build passed Apply, local Undo/Redo and session Undo/Redo. Incompatible styles were rejected. The live game loaded with an empty error overlay and offered the expected per-type choices. No repository test suite was added or run. Original index.html remains unchanged.


## Local pylon preview correction, 20 October 2026

Circulating expansion pylons keep their crossbeam, maintenance platform and rails rigid and level. Inboard sheave supports follow the cable profile and transition to fixed upper attachments. Hold-down wheels move above the rope without reflecting slices of the merged structural mesh, which previously stretched frame and railing triangles into panels. Mast feet remain fixed and wheel centres retain cable-normal contact. Static head geometry is merged again after adaptation; wheel animation remains separate.

Profile redraws preserve the pressed SVG dot and update its attributes during dragging. Construction, terrain tools and camera gestures now abort pointer capture cleanly when pointer lock or cancellation invalidates the pointer. Camera pointer-down events during pointer-lock release do not reach OrbitControls. Document versions and saved lift settings are unchanged. This correction is local only.

Local verification: syntax checks passed for the four changed JavaScript files and main inline module. Browser probes covered all four circulating expansion models and both support/hold-down pylons. The rigid head vertices remained unchanged, transforms stayed finite, an actual mouse profile drag changed tower height and recorded undo, and canceled/invalid capture returned cleanly. The error overlay remained empty. No repository test suite was added or run, and no VPS work was performed.


## Shared gondola pylons, local update

The eight-person passenger-mid-station gondola now calls the same `gondola-pylons.js` builder as the original gondolas. Frame dimensions, maintenance decks, railings, wheel geometry, articulated pairs and lights are shared. Its adapter places each pylon along the appropriate span and samples that span's cable profile. Wheel contact accounts for its existing thinner rope; rotation follows each lane's travel. Hold-down supports yield to passing grips with the same bearing mechanism. Tower identities, fixed feet, tilt, grouped foundations, mid-station routing and saved settings retain their meaning.

Local browser checks covered preview and operating versions of both gondolas with support and hold-down pylons. Both used the shared factory, retained finite geometry, spun their wheels and yielded their hold-down bearings. The error overlay remained empty. Syntax checks passed. No repository test suite was added or run; no VPS changes were made.

Preview parity follow-up: the shared mid-station pylon uses one selectable owner for its merged frame and wheel parts. Its preview wheels stay in that hierarchy so selection colors match the original gondolas; operating fleets retain wheel instancing. Local script versions were updated to replace previously cached runtime code. A geometry probe confirmed twelve visible sheaves per standard pylon with one selection owner covering both frame and wheels.

Pointer capture follow-up: Upper Snowfields imports the local OrbitControls module with a versioned URL. Its initial capture now rejects pointer lock, disconnected targets, InvalidStateError and NotFoundError before registering a gesture. Release checks for an existing capture. A focused local reproduction confirmed canceled capture, normal dragging afterward, pointer-lock rejection and already-released capture handling. The existing 14 m transfer-structure exclusion remains a conservative placement guard; it is unrelated to pointer capture. No save schema or VPS changes were made.

Mid-station sway sign correction: the expansion gondola's fore/aft response now uses positive local pitch during acceleration and negative pitch during braking. The carrier root faces its actual travel direction, so this convention applies on both lanes. Four runtime probes confirmed that the cabin trails its grip while accelerating and moves ahead of it while braking through M in both directions. Speed profiles and save data are unchanged. Local runtime cache version updated; no VPS changes.

Placed wheel rendering correction: the standard wheel rotor is now a Group containing sibling rim, hub, centre and spoke meshes. Previously the instanced rim's hidden source mesh was also the parent of the other wheel parts, so the built-lift visibility pass suppressed those parts. A local runtime probe reproduced 24 of 96 wheel parts rendering before the fix and all 96 afterward. Preview visibility and selection ownership also passed. Wheel geometry, frame dimensions, cable profiles and save data are unchanged; the local pylon asset version was updated. No VPS changes.

## Local construction and machinery polish, 20 October 2026

Unfinished lifts now autosave separately from the committed resort. The Resort panel lists recoverable drafts with Resume, Download and Discard; construction also offers JSON download/import. Cancel retains the draft without building it. A draft preserves its lift type, approved station type, station positions and datums, tower identities/tilt/grouping, operating settings and the last ten local undo/redo snapshots. Partially placed or conflicting lines can be recovered and repaired. Apply still requires valid construction and removes that lift's draft after a successful resort commit. Applying a lift inside a pending terrain transaction retains its recovery draft until the resort is committed; the remaining draft can then be discarded. Drafts are local to the current map slot and device. Storage failures leave editing and JSON download available with an explicit message.

Drafts use the independent `lift-co-construction-drafts:v1:` namespace, outside the resort backup prefixes. Their standalone file format is version 1; the resort document remains version 3. Download resort backup includes a separate `drafts` list alongside its committed `current` resort. Import draft accepts a standalone draft JSON, rather than a whole resort backup. No lift IDs, V1 migration, existing backup gates or committed terrain layers change.

The dedicated middle/angle structure's existing 14 m exclusion is now visible in the world and elevation profile. Tower-specific messages distinguish a foundation from a tilted wheel head entering the corridor and suggest a direction and minimum movement. Clicking a listed conflict selects that tower. Exact 14 m boundary placement is valid. Relevant foot markers and profile dots turn red; selected tower bodies retain gold. This corridor reserves space for the transfer machinery, carrier envelope and approach clearance. It remains a conservative game placement rule, rather than a manufacturer-specific engineering calculation. Endpoint connection rings remain green/red and snap targets remain teal.

The expansion detachable endpoint boarding gates now sit inside both the crawl and door-opening windows. The previous gate lay outside the opening zone, preventing endpoint boarding. Palace8 still supports all six directed A/M/B journeys; through passengers remain aboard. Closing boarding lets existing passengers finish, while Stop freezes the coupled lift and its machinery. Fixed-grip gates and speed rules are unchanged. The synchronized intermediate cable model remains the approximation described above.

All four expansion models retain visible pylon wheel parts in construction previews while operating fleets keep instancing. Compact station guide wheels now use sibling rim/hub/spoke meshes beneath a rotating Group, preventing hidden source meshes from suppressing instanced detail. Approved Princesse timber halls have framed pedestrian openings on both sides of their front apron, with network access points aligned to those openings. Their end-station return shaft reaches its lower and upper supports. These are refinements of the approved structures, without new lift or station choices.

Verification: syntax checks passed for all 53 JavaScript sources and the main inline module. An isolated local Chrome session loaded with an empty error overlay and no failed asset requests. Browser checks covered draft reload, Cancel, single-station recovery, an unblurred name, storage failure feedback, JSON download/import, malformed import rejection, valid Apply cleanup, local and session Undo/Redo, and a fresh version-3 save reload preserving type, tilt, grouping and operations. Six focused passenger journeys completed, including through travel, closed boarding with a rider aboard and Stop/Resume. Preview/placed probes matched all pylon wheel positions across the four expansion models and confirmed animation. Occupied-fleet visibility checks found no suppressed machinery parts; empty ski racks remain intentionally hidden. Geometry probes confirmed clear pedestrian openings at both supported boarding-floor heights and a continuous return shaft. No repository test suite was added or run. Original `index.html` remains unchanged. Actual laptop/iPad frame rate and a full visual survey of every historical station remain user review items. Source snapshots are in `archive/backups/construction-midstation-polish-local-20261020/`. No VPS changes were made.


## Village and automatic shuttle

The local village milestone adds accommodation, editable roads, terminal stops
and one automatic 24-seat shuttle to version 3 documents. See
[village construction and simulation](village-shuttle.md) for the implemented
controls, data contracts, guest journeys and deliberate simplifications.
