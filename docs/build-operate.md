# Build and operate the Upper Snowfields resort

Entry point: `empty-map.html`. The original `index.html` and approved lift model
sources are unchanged. The new controls use the existing sidebar and camera.

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
- Cancel discards the preview. Construction pauses guests and machinery while
  camera navigation stays available. Apply rebuilds affected runtimes in place.
- The workbench provides session Undo/Redo. Each committed construction edit is
  one action; pending brushes, point drags and lift edits have local Undo/Redo.
  Ctrl/Cmd+Z and Shift+Ctrl/Cmd+Z select the appropriate history.

## Operations

Choose a lift in Your resort. Open/Closed governs new boarding; Run/Stop governs
that line's motion. Cable speed ramps at 0.65 m/s² and carriers retain their
current loop positions. Fixed-grip chairs use the selected speed throughout;
detachable terminal crawl remains controlled by the model.

Carrier count and dispatch spacing are linked and clamped to catalog dispatch
pitch. Dispatch spacing is the equivalent line distance at catalog maximum
speed, rather than the packed distance inside a detachable terminal. Fleet
changes rebuild immediately and return assigned guests to the terminal where
they boarded. One carrier remains reserved for the camera. The train's two
paired carriers cannot be reconfigured. Readouts show queues, occupants and an
estimated capacity; capacity is an estimate rather than a throughput guarantee.

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

## Persistence and verification

The document is version 2: stable-ID lifts, pistes, paths, junctions, ordered
terrain layers and an entrance-station reference. V1 lift types, heights, tilt
and grouping remain intact. Legacy automatic pistes become independent entities
once. Operating settings persist. Browser slots are copied to
`lift-co-before-build-operate:<original slot>` before migration; saving is
blocked if the pre-change browser backup cannot be made. Export includes it.

Source originals are in `archive/backups/before-build-operate-20261016/`.

Completed verification: JavaScript syntax checks, local script-reference and
HTML-ID inspection, and direct console inspection of layer restoration,
ability-aware return routing, migration and history data. No automated test
suite was added or run. Browser tools reported no available browser; visual
acceptance scenarios 1–10 and laptop rendering/performance remain unverified.
