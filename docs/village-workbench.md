# Building your village

Open `empty-map.html` over local HTTP, then choose **Village** in the sidebar.

1. Choose a building card. Move the preview onto snow. Q/E or Rotate turns it.
2. Click to set it down. Check its footprint and green entrance ring, then
   press **Build** in the bottom bar. Invalid sites explain the conflict.
3. Click a placed building to rename or rotate it. Drag it to move it, or use
   **Move**. Press **Save** to keep the change, or **Cancel** to restore it.
4. Use **Draw a path from the entrance** to start at the front door. Add bends
   on snow, click the destination's connection ring, then **Finish path**.
   Paths need an explicit connection to a stop or lift access point.
5. For a shuttle, draw a road, place two bus stops beside it, then choose
   **Shuttle connection**. Click the two shelters and **Build connection**.

Roads and paths have a rubber-band preview between the last point and cursor.
Click their finished surfaces or choose them under **Your village** to edit.
Drag control points to adjust the shape. Fine adjustments expose elevation,
junction and point-removal controls. Roads grade automatically by default;
invalid slopes and bends remain editable with a visible reason.

Escape cancels construction. Enter finishes a valid staged edit. Undo/Redo
uses the existing combined construction history. Preview movement does not
write the save. A building's foundation fits the snow automatically; manual
floor elevation is an advanced option.

The guide checks actual connectivity. After a path reaches a lift it advances
to the ski-run step, and distinguishes missing, closed, invalid or disconnected
pistes, missing returns, guest ability and a paused simulation.

New pistes start open. Finish valid construction to make them available; existing
closed pistes keep their setting and can be opened in the route editor. Pistes
use white snow and edge poles rather than a road center line. Start at the lift
higher station circle and finish at the lower station circle.

Lift platform earthworks are crossed on visible 3 m station walking paths. The
ski descent begins and ends outside those earthworks; its report includes the
walking distance. Guests walk these explicit graph edges, including any climb
onto a base platform. The foundation is preserved. Genuine uphill terrain
outside station approaches still blocks the piste.

Guests require a complete suitable outing and return route before leaving.
Build a lift and piste, then connect the village through walking paths or the
shuttle. Guests can wait at home while the resort is still under construction.

## Interface revision, 2026-10-21

The Village tab replaces the earlier controls buried in Terrain. The collection
uses rendered model thumbnails. Placement uses cursor previews, automatic
foundations and a persistent action bar. Numerical positioning is optional.
The visual direction uses warm cream, pine green, copper, stone and timber.
Buildings have pitched roofs, snow, balconies, glazing, entrance canopies and
planters; the shuttle uses the detailed vehicle workshop bus. Static building
parts are batched by material to keep draw calls bounded.

Models remain replaceable. Dimensions, beds, access nodes, 24 seat anchors and
simulation contracts are unchanged. There are no interiors or imported assets.
Terminal pads remain deliberately generous for the existing turning curves.
Automatic grading is an initial suggestion, rather than a road-design solver.
Actual M1 iPad performance still needs device review.

## Focused verification

Isolated local Chrome checks used real pointer placement, dragging and snap
selection. No repository test suite was added or run.

- Hover previews did not change committed records; rotation, click placement,
  Apply, dragging, Cancel and Escape behaved correctly. Overlap blocked Build.
- Connected road endpoints created a shared explicit junction and passed Apply.
  Undo restored the previous road. Joined earthworks are clipped at the
  junction so a new grade cannot reshape the neighboring road.
- A three-point road, two stops and a shuttle were created through the UI.
  An entrance path retained both explicit connections and opened for walking.
- Save/reload retained buildings, road, stops, shuttle and path connections.
  Naming followed by session Undo/Redo restored exact document contents.
- Both bus directions were exercised for 480 simulation seconds. Maximum speed
  was 30 km/h, with zero moving/open-door frames and zero door-animation
  mismatches. All 24 anchors were unique; wheel-distance error was zero.
- Tablet layouts at 1024 by 768 and 768 by 1024 had no horizontal document
  overflow. The action bar and commit button remained inside the viewport.
- The inspected village frame submitted 126 draw calls and 348,546 triangles,
  with 93 geometries and 4 textures. These are view-dependent observations,
  not device FPS measurements. Error overlay and runtime exceptions were empty.

The earlier milestone's simulation checks remain documented in
[village-verification.md](village-verification.md). This revision's focused
checks do not repeat the complete earlier journey matrix.

## Path, piste and platform repair

Focused runtime checks reproduced a 7.53 m uphill section caused by the actual
station terrace sampler on an otherwise downhill run. Splitting the station
walking approaches left a valid descent with zero uphill rise. A separate real
hill still failed slope validation. Both approaches were explicit walk edges
with rendered paths. A resident waited without a piste, then left the chalet
once an open connected descent and return were available.

Additional probes exercised the actual route-creation handler and geometry
builder: Draw piste created an open piste, not a road, and rendering produced
white snow, edge poles and station paths. Guide and action-bar logic was checked
for missing/closed/disconnected runs, missing returns, ability and pause state.
Syntax checks passed. These were isolated runtime/geometry and minimal-DOM
probes; no repository test suite was added or run. Browser automation was not
available for a fresh visual check of this repair.

## Rough-run tolerance and direction

The uphill tolerance is 3 m of continuous rise. Duration by itself no longer
rejects a small, gentle rise: 2.1 m over 56 m passes. Substantial uphill terrain
and excessive cross-slope remain invalid. The report shows actual start and
finish elevations; lift access labels identify the higher and lower station
from sampled elevation, independently of the lift's internal A/B names.

Reverse piste direction reverses the existing control points and endpoint
connections in the construction transaction. Incoming references to the piste
start/end are remapped to preserve their physical connection. This preserves
identity, widths, manual heights and Open/Closed state, and supports existing
Undo/Redo. Close an invalid pending piste and Apply to save its shape before
reloading; then edit it, reverse if necessary, open it and Apply.

Focused checks accepted the reported 2.1 m rise, rejected 168.2 m and a separate
4 m hill, and verified that reversing twice restored the exact draft and its
incoming connections. These extend the runtime probes described above.

## Unrestricted piste testing

Enable **Test mode: allow any slope** in a piste's editor, then Open and Apply.
The flag is saved per piste as `testTerrain` and participates in Cancel,
Undo/Redo and export. It bypasses uphill, cross-slope, station-area and guest
ability restrictions for that piste, so a rough near-vertical test run can be
used immediately. Measured slopes and difficulty remain visible. It does not
invent endpoint connections or a return route, and closed pistes stay closed.
Normal pistes retain their usual terrain checks.

Focused runtime probes accepted an approximately 84 degree descent and cross-
slope with test mode enabled, confirmed that a beginner guest could plan a
complete outing, and preserved the flag through migration and history. The
same geometry remained invalid in normal mode. Uphill checks were also bypassed
in test mode.
