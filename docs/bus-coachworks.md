# Bus coachworks

Open [the bus showroom](../designs/bus-showroom.html) over local HTTP.
Five original procedural designs share one interactive showroom:

| Model | Body | Nominal length | Axles | Joints |
| --- | --- | --- | --- | --- |
| Sprig 08 | Compact Alpine shuttle, round headlights | 8.6 m | 2 | 0 |
| Current 12 | Battery electric city bus, LED running lights | 12.0 m | 2 | 0 |
| Panorama DD | Panoramic double-decker, vertical lamp stacks | 13.2 m | 3 | 0 |
| Ribbon 18 | Articulated mountain bus | 18.15 m | 3 | 1 |
| Tandem 24 | Double-articulated electric bus | 24.6 m | 4 | 2 |

Choose a model card or Compare all five. The lineup uses a common scale and
aligns front bumpers. Five camera presets, drag orbit and scroll/pinch zoom
support inspection. Model thumbnails are rendered from the actual meshes.

The bend slider rotates real passenger modules around separate joints. Pleated
bellows deform between their moving endpoint frames; the rear module of the
Tandem follows a second joint. Turntable floors, roof safety links and steering
knuckles move with their mechanism. Bring it to life cycles steering and bends
while rotating wheels. The bodies remain on the studio floor for inspection.

Passenger doors have independent leaves and actual openings in the body wall.
Opening them pauses wheel motion; closing finishes before the wheels resume.
See inside removes the roof and door-side wall. Both passenger decks, individual
seats, poles, hanging grips, driver controls and the double-decker stairwell are
modeled. Winter kit adds roof snow and a rear ski carrier. Paint and light
controls work on the selected model. Shared inspection toggles also apply to
all five in the comparison view.

Models use metre units, Y up and +Z forward. `createBus` in
`src/vehicles/bus-fleet-models.js` returns root, specification, wheel/door/joint
handles, modeled seat locations, dimensions, update, finish controls and dispose.
Appearance and seats are design-study assets, not a live passenger-capacity
contract. These buses are not yet integrated with road routing or the automatic
shuttle. Existing game, save data and the earlier vehicle workshop are unchanged.

Static geometry is merged by material within articulation-safe groups. Wheels,
door leaves, accordion surfaces, cutaway sections and winter kits retain their
independent transforms. LED destination boards use generated pixel textures;
there are no downloaded models, logos or texture assets. The viewer uses the
repository's local Three.js and OrbitControls, with one renderer for its live
view and thumbnail generation.

## Verification

Focused isolated Node probes constructed all five models with the actual
Three.js geometry implementation. Checks covered finite vertices and bounds,
axle/joint counts, both bend extremes, accordion endpoint seams, opening doors,
wheel distance, stopping while doors are open, winter kits, cutaways and
idempotent disposal. Independent offscreen OpenGL renders of the actual meshes
were inspected for all five models. The approximate geometry range is 33,000 to
73,000 triangles per bus before any future game-specific detail reduction.

Camera-fit probes checked all five views at four viewport aspect ratios for
each individual model and the lineup: 120 frames kept their bounds inside the
viewport. The renderer rests when the camera and mechanisms are idle.

Syntax and local resource references are checked separately. No repository test
suite was added or run. Browser automation was unavailable in this session;
actual browser layout, touch behavior and device frame rate still need review.
