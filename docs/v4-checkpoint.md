# Upper Snowfields V4 - 21 October 2026

V4 is a local stability checkpoint of the current village, automatic pistes, terrain-following skiers and station-side access. It keeps the existing map, lift catalog and construction workflow. Open `empty-map.html` as usual; the header identifies V4.

## Fixes in this checkpoint

- Lift boarding, running, speed and fleet changes now save before committing their operation state and session history. Failed writes or unavailable backups restore the previous settings and show a notice. Resort entrance changes receive the same protection.
- Live operation readouts leave the carrier-count and spacing fields alone while the player is typing. Submitted values reflect the resulting fleet or the restored value after a failure.
- Selecting a manual route handle no longer moves it or disconnects its endpoint. Both manual routes and automatic-piste handles use a small movement threshold.
- Pointer cancellation and window blur restore the in-flight route drag or terrain stroke. Cancel releases pointer capture, clears gesture state and restores the edit's ground. A late pointer event after closing the editor is harmless. Undo during a gesture cancels that gesture first.
- Automatic piste reversal now reverses its stored endpoints and passage order while remapping attached routes. Existing paths stay connected to the same physical location. Reversing twice restores the original connections, including other automatic pistes' endpoint and passage references.
- Splitting a route at a junction redirects connections to the original far end onto the new second segment. Splitting a road retains its authored junction height.
- Connected road endpoints share their explicit junction elevation. Changing it reshapes affected neighboring roads with their own terrain layers, so the neighboring carriageway follows the new height. Cancel and history retain those layers.
- Zero-length routes cannot be applied or used as guest walking/skiing edges. Removed or unknown network nodes cannot masquerade as a valid empty journey.
- Rebuilding or deleting lifts and piste boundary poles releases their instance buffers. Shared feature geometry, materials and textures are disposed once per cleared group.

## Saves and rollback

Release identity is `releaseVersion: 4`; the resort document schema remains `version: 3`. Map identity, generation revision, dimensions, slot keys and device graphics settings retain their existing meanings. V1/V2/V3 saves continue through the existing migration.

Before writes, existing Upper Snowfields slots receive a one-time byte-for-byte backup under `lift-co-pre-v4-20261021:<original key>`. Failure participates in the existing save gate and blocks commits. Earlier backups remain available. Download resort backup includes this new backup family and uses a V4 filename.

Source rollback before this pass is `archive/releases/pre-v4-20261021/`. The completed playable source checkpoint is `archive/releases/v4-20261021/`, with a SHA-256 manifest, game pages, source, assets, designs, experiments and documentation. These archives are local and ignored by Git.

## Verification

No repository test suite was added or run. Temporary focused scenarios exercised production modules with Three.js and DOM interaction, with rendering dependencies stubbed where needed:

- Endpoint selection, cancelled drag, focus loss, Cancel, late pointer cancellation, piste reversal, route splitting, road-junction elevation changes, terrain rollback, operation field focus and V4 workspace navigation.
- Failed saves for boarding, running, speed, fleet and resort entrance, the backup gate, successful operation persistence, and unchanged history on failure.
- V1/V2/V3 and fresh-document compatibility for lift types, station styles, elevations, foundations, tower tilt/grouping, operations, map identity, terrain owners, village records and station-side connection IDs. The V4 backup retains original bytes across reload and blocks writes on failure.
- Automatic piste generation, difficulty, mandatory passages, nature planting, Apply, Cancel, local/session Undo/Redo, persistence and terrain reload. A generated journey contains walking, a lift, a suitable descent and a return home; a closed run blocks a new outing.
- Six lift families at rotated terminals and passenger mid-stations, both exterior sides, three pistes sharing a station, opposite-side returns, perimeter walking and legacy footpath detours. Door windows reject closed/partial doors, wrong stations, departure lanes and insufficient reversible dwell. Guests retain their seat until they reach the platform.
- A full 24-seat shuttle leaves one additional guest waiting. Doors close before movement, boarding closure preserves current riders, passengers unload at the destination, wheels rotate, and the return trip reaches the original terminal. Removing an occupied connection releases seats, returns affected guests home and emits a notice. Accommodation populates without lifts, fills gradually, distributes guests and respects the 120-person cap.
- Four skiing styles, terrain alignment, ski contact, bounded turns, frame-rate consistency, push approaches, endpoint precision, powder limits, nature ownership and the shared-terrain grooming surface. Completed descents are counted once.
- Disposal events confirm release of lift and piste instance buffers and single disposal of shared lift geometry/material.

Syntax validation passed for all 71 source JavaScript modules and the game inline module. All 59 referenced local scripts, styles and pages returned HTTP 200. The original `index.html` retains SHA-256 `5323a8d68078ad30f053b11945eb9adc035e784299c1e392c3ccdbd5aeb8f50e`.

Browser control exposed no browser in this session. Actual WebGL rendering, error-overlay observation, tablet layout and device performance remain unverified in this pass. The focused DOM and geometry scenarios do not establish GPU performance. The original resort and VPS were not changed.
