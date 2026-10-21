# Vehicle workshop

Open [the local vehicle workshop](../designs/vehicles.html). It is separate from the resort: no traffic simulation, resort-save writes or schema changes are included.

The first set contains twelve original procedural models:

| Category | Models |
| --- | --- |
| Buses | Village shuttle, valley regional bus, Alpine coach |
| Cars | Compact hatchback, touring estate, village saloon, mountain SUV, sport coupe, resort pickup |
| Winter service | Piste groomer, road snowplough, compact snow carrier |

Choose a category and vehicle, inspect the five camera angles, change paint, toggle roof snow and wireframe, and run the wheels/tracks. Wheeled vehicles have front steering. Bus doors open into actual entrance apertures; the viewer stops wheel motion while the doors are open. Winter blades can swivel. Doors, steering and blade articulation are inspection mechanisms, rather than a vehicle physics simulation. Models stay on the inspection pad while their running gear moves.

## Reuse

`src/vehicles/models.js` exports `vehicles` and `createVehicle(id, options)`. The factory returns the root, specification, wheel/track/door/attachment handles, dimensions, triangle count, `update`, `setColor`, `setSnow` and `dispose`. Coordinates use metres, Y up and +Z forward. `update(dt, {speed, steer, doorsOpen, bladeAngle})` accepts metres per second and radians. Wheels rotate around their axle, steering acts at a separate knuckle, and tread cleats circulate around each track. Forward-running belts move backwards along their ground-contact run.

Body geometry is batched by material, and each wheel rotor is batched separately so it remains animated. Geometry and materials are disposed when changing vehicles, including original geometry consumed by batching and destination-sign textures. Body paint is shared within one model, not across independently recoloured vehicles. There are no external model or texture requests. Bus destination signs use a small generated canvas texture; the other surfaces use simple materials.

The intended passenger counts are preliminary design metadata. Interior seating is simplified and is not yet a complete seating or boarding layout. Traffic routing, seat occupancy, actual vehicle movement, bus stops, collisions, snow displacement, hydraulic linkage simulation and terrain-following suspension remain future game work. A future traffic runtime should batch repeated vehicles and treads and apply distance-based detail limits; the current workshop draws one vehicle at a time.

## Reference desk

The public thumbnails of these user-selected Sketchfab listings informed the general vehicle families and low-poly direction:

- [Cartoon Low Poly Winter Vehicles Pack, antonmoek](https://sketchfab.com/3d-models/cartoon-low-poly-winter-vehicles-pack-766d81703bf740928b64ff4e98da3244)
- [Low Poly Bus Pack, Sidra](https://sketchfab.com/3d-models/low-poly-bus-pack-7e4a4f86520e49638bab09086c2ad752)
- [Low-poly Car Pack, Sidra](https://sketchfab.com/3d-models/low-poly-car-pack-f977e1a3d04e43c9be89ea226f7f1fa8)

These models are independently authored approximations of common vehicle categories, not recovered copies of the unavailable meshes. No source meshes, textures, logos or reference thumbnails are bundled. The separate downloadable Ultimate Low-Poly Car Pack 2 has not been imported.

## Local verification

Syntax checks passed for both JavaScript modules and the HTML import map. Isolated Chrome loaded all twelve models with finite geometry and an empty error panel. Focused checks exercised rotating wheels, steering knuckles, bus-door motion and clear entrance apertures, paint, roof snow, wireframe, the five camera presets and the collapsible controls. Landscape and portrait tablet layouts were inspected. Vehicle geometry is approximately 1,800 to 4,100 triangles per model in this first set. This is a geometry count, not an iPad frame-rate measurement. No repository test suite was added or run. Existing game and save files are unchanged.
