# Village and automatic shuttle

Local milestone for `empty-map.html`, built from the current Upper Snowfields
sources on 2026-10-20. The original resort (`index.html`) and VPS are unchanged.
The milestone was developed and verified in an isolated working copy, then
installed in the local project. Standalone studies and asset sources are unchanged.

## Construction

Open Terrain & routes, then Village & shuttle. Chalet, Apartments and Hotel add
individual accommodation with 6, 24 and 48 beds. Click snow to place or move the
selected home; coordinates, rotation, name and floor elevation are editable.
The gold preview includes the entrance terrace. Supported foundations extend
to the ground; the whole building footprint must clear the hillside. Raise its
floor or move it if a foundation conflict blocks Apply.

Draw road uses the existing point editor, including point dragging, elevation,
naming, deletion and Make junction. Carriageways are fixed at 6 m with a dashed
centre line and two directional lanes. Roads have a maximum 12% grade and a
minimum 10 m centre-line turning radius. Invalid geometry stays editable and
blocks Apply with its cause. Crossings and nearby endpoints create no edges.
Connect road endpoints to explicit junctions. Junction approaches must have
continuous valid tangents; a sharp intersection does not invent a bus turn.
Splitting a road remaps its stops to the appropriate half, retaining stop IDs.

Bus stop adds a terminal. Click a road to snap it, or choose a road and distance
percentage. Switch road side changes its side. A terminal has a conservative
30 m radius paved turning pad, a level boarding bay, a separate pedestrian
point and a visible approach ramp. The complete pad and terrain shaping are
previewed. Stops need level ground at their boarding datum; conflicting road
or sculpting work blocks Apply. Homes, stops, roads, lift structures and open
pistes participate in combined footprint validation.

Draw footpaths between the teal entrance, stop pedestrian and lift access
snaps. Select a snap while drawing, or select an endpoint and Confirm connection.
The boarding point is connected to its pedestrian point by the terminal's
owned access. Proximity creates no guest connection. Place paths outwards from
a building entrance; a connected path may use its terrace but cannot cut
through the building.

Connect stops creates the single supported shuttle connection. Choose two
stops, name it and Apply. The shortest valid connected road path is selected
automatically. Disconnected roads and invalid junction turns block Apply.
Open/Closed is edited in the same transaction. Readouts report occupants out
of 24 seats, queued guests and an estimated round-trip time.

All new work uses the existing combined construction transaction, pauses the
simulation, and supports local Undo/Redo, Cancel, Apply and session Undo/Redo.
Cancel restores models, scenery and terrain. Deleting an object removes only
its owned earthworks. Deleting a road also removes its stops and their shuttle;
deleting a stop removes its shuttle. Other owners' layers are replayed intact.
Direct lift edits are also checked against village and road structures.

## Shuttle and guests

One bus is assigned automatically. It follows the two road lanes and terminal
curves, accelerates at up to 0.9 m/s/s, anticipates bends, brakes, and stays below
30 km/h. Doors move only while stopped; departure waits for fully closed doors.
Dwell is at least 8 simulation seconds and extends for loading or unloading.
Wheel rotation follows actual distance. Front wheels steer independently of
the rotors. There are 24 explicit seat anchors and exactly 24 matching slots.

Closing prevents new boarding and preserves existing riders until they unload.
The closed vehicle continues circulating. Removing or rerouting occupied
transport returns affected guests home with a notice. There is no off-road
replacement trip or invisible transfer. Cancel preserves current riders.

Accommodation fills gradually, at most one admission per simulation second,
shared across buildings in proportion to free capacity. The existing active
population limit remains 120. Each resident keeps a home-building ID during
this simulation and requires an ability-appropriate descent with a valid
return to that home before departing. Walking, lift queues, shuttle travel and
expected waiting all contribute to outing selection. Residents can wait at
home before any lift exists.

With homes present, Add skiers becomes an explanatory disabled control. Existing
entrance visitors finish their outings and then leave; vacancies can fill with
residents while respecting the shared cap. Without accommodation the original
entrance arrivals remain available. Deleting a home sends its residents to the
legacy entrance, or removes them from the active simulation if no entrance
exists. Only a completed piste descent increments runs served.

## Data and model contracts

Documents remain version 3. Optional `world`, `buildings`, `roads`, `stops` and
`shuttles` fields default to the current fixed landscape and empty collections.
World identity is `upper-snowfields-v1`, generator revision is
`twin-summit-snowfields-1`, and dimensions are 3600 by 3600 m. Changing the browser
slot does not regenerate the mountain.

New entities have stable IDs. Stops reference road IDs and normalized arc
positions; shuttle records reference two stop IDs. Footpaths explicitly
reference building entrance or stop pedestrian nodes. Snapshots, export,
transactions and session history carry every new record. Guest positions and
seat reservations are runtime state, as with the existing lift guests.

Before writes, existing slots are copied to
`lift-co-before-village-20261020:<original key>`. Failure participates in the
existing shared blocking backup gate. Export includes these backups.

- `src/resort/village.js`: bed/dimension/entrance contracts, footprints,
  foundation validation and replaceable building models.
- `src/resort/roads.js`: design curves, grade/radius checks, owned road and stop
  earthworks, explicit road graph and shortest valid routing.
- `src/resort/shuttle.js`: motion, vehicle placeholder, seat anchors, door and
  passenger-capacity contract, graph edges and operational readouts.
- `src/resort/village-tools.js`: placement controls and scene previews adapted
  to the existing transaction.
- `src/resort/document.js`, `guest-network.js` and `resort-tools.js`: persistence,
  terrain sampling, resident/boarding states and integration.

The terrain height field remains authoritative. Road stamps carry a local
longitudinal grade so their full carriageway stays planar across its width.
Ground meshes receive local refinement around buildings, roads and terminals.
Models use metres, Y up and +Z forward. Replacement assets must preserve the
contracts for dimensions, entrances, boarding and seat anchors; mesh appearance
does not determine simulation capacity or connectivity.

## Deliberate simplifications

Building shells and the bus are procedural placeholders. Foundations use corner
supports and a small owned terrace. Terminal pads are deliberately generous,
with conservative collision boxes. Terminal motion is sampled curve following,
not tyre/contact physics. There is no traffic, vehicle collision solver,
physical suspension, fleet configuration, speed setting or timetable editor.
Road edits conservatively return guests whose current trip uses a shuttle,
even when an edited road was not their particular segment. Undo restores world
records, rather than rewinding passenger positions or the simulation clock.

No building interiors, economy, private cars, jams, bridges, tunnels, random
mountains, enlarged maps or population increase are included. Actual M1 iPad
performance still needs device review before increasing either limit.

## Verification

Focused isolated Chrome scenarios and JavaScript syntax checks were used.
No repository test suite was added or run. Checks include migration of V1/V2/V3
records across the existing lift catalog, new-field history, terrain ownership,
a real road placement/handle drag, invalid grades, Cancel, occupied route and
stop deletion, session Undo/Redo, closures and full boarding.

Six residents completed two full outings each through footpath, bus, lift,
piste, return bus and home: exactly 12 completed descents. The observed maximum
was 30 km/h, with no moving/open-door frames, duplicate seats or vehicle centre
samples outside road/terminal surfaces. Wheel distance differed from travelled
distance by less than 0.000001 m. A 48-guest queue boarded 24 unique seats and
left 24 waiting. Closing retained all 24 riders and unloaded them without new
boarding. Five hotels filled to the shared cap of 120, with 24 residents each.

The empty error overlay, browser save reload, backup failure, tablet layouts and
rendering/resource checks are recorded in `village-verification.md`.
