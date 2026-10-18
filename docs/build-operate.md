# Build and operate the Upper Snowfields resort

Entry point: `empty-map.html`. The original `index.html` stays separate; the approved carrier designs are retained. The new controls use the existing sidebar and camera.

## Construction

- Edit a lift and choose Station A/B to set its boarding floor in 0.25 m steps.
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

The entrance selector chooses either terminal of any lift; the first built
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

The document is version 2: stable-ID lifts, pistes, paths, junctions, ordered
terrain layers and an entrance-station reference. V1 lift types, heights, tilt
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
No save-schema change: version 2 and the version-1 migration remain in place. A
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
not a full structural/tension-load simulation. Save version remains 2.


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
in the existing version-2 lift definition; older absent values mean inclined.

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
