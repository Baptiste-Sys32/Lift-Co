# Solo station machinery

Open [the Solo playground](../experiments/solo-playground.html), then choose
**Valley machinery** or **Summit tension**. Those views remove the architectural
shell, ground and station foundations; leaving them restores the preceding view
settings. Enable **Cable travel markers** to follow the traction paths.

## Reference

The [Rochebrune technical report](https://www.remontees-mecaniques.net/bdd/reportage-tph33-de-rochebrune-heckel-poma-1886.html)
by Raphaël B and undertaker documents a lower double-groove drive, twin traction,
upper haul-rope return/tension and separate support-rope anchoring/tensioning.
Its diagrams and on-site photographs are the source for this arrangement:

- [Overall cable diagram](https://www.remontees-mecaniques.net/galerie/albums/photos_utilisateurs/10282/04-03-2008-15-13-18-923_modifie-1.jpg).
- [Upper return arrangement](https://www.remontees-mecaniques.net/galerie/albums/photos_utilisateurs/10282/05-02-2008-22-49-39-578-1.jpg).
- [Drive assembly](https://www.remontees-mecaniques.net/galerie/albums/photos_utilisateurs/10282/P1110723.jpg).
- [Upper deflection sheaves](https://www.remontees-mecaniques.net/galerie/albums/photos_utilisateurs/11273/retour_01.jpg).
- [Staggered returns and weight](https://www.remontees-mecaniques.net/galerie/albums/photos_utilisateurs/11273/retour.jpg).

The source photos are linked, not bundled or used as textures. The model is an
adaptation for Solo's existing cabin, stations and lane spacing, not a surveyed
reconstruction of Rochebrune. In particular, exact rope-splice interconnections,
structural dimensions and counterweight travel are not established by this model.

## What is modeled

`src/lifts/solo-machinery.js` owns the terminal cable paths and associated wheels.
Each path is built from straight tangent sections, circular sheave arcs and the
shared cable profiles. Circular deflections supply both the visible cable
and the sheave centre, axis and pitch radius, keeping them aligned.

The model draws two synchronized, closed traction paths. Each leaves the valley
drive, follows one lane to the summit, passes over an upright sheave, descends to
an offset vertical return wheel, rises through the opposite upright sheave and
returns along the other lane to its drive groove. This gives four upper entry
sheaves and two staggered returns. It illustrates the routing; it does not claim
to resolve hidden splice details on the real installation.

The adapted valley drive has a 2.3 m pitch radius and grooves 0.72 m apart. The
upper entry sheaves have a 0.95 m radius; the returns use the 5.1 m half-gauge.
Their planes are separated by 1.25 m, with lateral centres offset by ±0.85 m.
These are game dimensions chosen to fit the current hall. They are not dimensions
quoted from the report.

The drive includes a motor casing, cooling fins, coupling/fast shaft, reduction
housing, slow shaft, double-groove wheel, rim brakes and ring gear. A parked
hydraulic auxiliary assembly and compact V12-shaped power unit are also shown.
They are standby geometry; there is no failure or auxiliary-operation simulation.
The motor ratio makes its shaft reach 1,100 rpm at native catalog cruise speed.

Fixed support ropes end separately, at upper anchor frames and lower socket
connections. The lower connections continue through larger tension lines and
chain guides to two weights. They do not run around the traction bullwheel.
The summit traction returns share a weighted carriage. Counterweight positions
remain static: rope stretch, loading and tension transients are not simulated.

## Cable statics and contact

`solo-runtime.js` solves separate carrying-rope and traction-rope profiles.
Free spans are catenaries under their own weight, with a common horizontal
`tension / weight-per-length` parameter within each profile. The selected sag
factor requests a minimum sag. If that tension would lift a rope off a pylon,
the solver reduces it until all open pylon saddles carry the rope from below.
Terminal transitions are constrained docking-guide paths, excluded from that
unilateral-contact check. Treating their fixed angles as open saddles previously
caused excessive global slack. This prescribed station constraint is a game
approximation; structural guide forces are not simulated. The playground
reports this adjustment and the resulting greatest midspan sag. It also keeps
its terrain-clearance warning: lower tension can require taller supports.
The continuous-mountainside preset raises the valley floor by 6 m and summit
floor by 24 m so its starting layout clears the hillside with seated ropes.
An arrangement that cannot be seated is rejected while the previous line stays
available for inspection.

Each pylon guide is a downward-curving saddle, solved together with the adjoining
spans. Its centre retains the selected tower height; its entry and exit match
the span tangents. The fixed carrying rope rests in a continuous grooved shoe,
rather than floating over a row of large spinning wheels. The traction pair
has separate recessed roller banks, with narrow side webs and exposed working
rims. Station approaches retain the small boarding-guide rollers, add saddle
inserts between them, and carry both traction ropes on recessed rollers as far
as their terminal deflection leads. Bearing centres use the local cable normal
and the wheel/rope radii. Station hanger bars sit outside the rope corridors.

Each change of direction behind the boarding area has a corresponding sheave.
Straight tangent leads connect the rollers, deflection wheels, drive grooves
and staggered returns. Carrying-rope sockets follow the docking incline and
connect to the upper anchor frame or lower tension chains. Drive brake calipers
sit below the running grooves; deflection-wheel supports are cantilevered away
from the leads, and return-carriage crossbeams sit behind the vertical rope runs. Carriage axles and collar pads adjust slightly
through curved guides to keep the wheel grooves and traction jaws seated.
The split-collar underside remains open for passage over the haul rollers.

This is a static game model. Rope elasticity, moving cabin-load deflection,
wind, friction, dynamic tension and counterweight travel are not simulated.
The haul pair uses a fitted common profile; no material properties or real
counterweight masses are inferred from the reference. The carrying rope and its continuous station saddles stay stationary;
the separate haul rollers turn with the moving traction ropes. Repeated rollers
are instanced;
editing rebuilds their geometry, while playback only updates poses.

## Integration and preserved behavior

The slim wheel beam, exposed upper/lower wheel rims and cabin dimensions remain.
Two low split collars bolt into the front cross-brace of the running beams. There are no upright hook arms. The haul datum is 0.18 m
above the trolley origin (0.493 m above the carrying-rope datum). Both traction
ropes sit at lateral offsets of ±0.85 m, outside the running wheels and hanger. Small collar pads
follow the same traction profile through curved guides.

The guide banks are hung from slim yokes outside the carriage envelope; low
cross-members do not cut across the hanger or front attachment. The lower
terminal leads pass above the carrying-rope sockets before descending through
an additional pair of deflections to the drive grooves. Station approach slab
corners flare away from the hanger until the cabin reaches boarding height.
The boarding floor and native speed limits are unchanged. The original 12°/20° docking angles remain the legacy profile; the main game also offers a flat upper hall.
Pylons retain their Heavy Portal shafts. Compact guide beams sit at the actual
traction-rope height, without the earlier large wheels or tall upper crown.

All traction wheels and the main coupling use the shared signed haul
displacement. The closed-path convention travels uphill in the negative-X lane;
its drive input is reversed relative to Solo 01's uphill journey in the positive-X
lane. This keeps the visible haul flow, rollers and cabins moving together.
They reverse together and stop during dwell or a paused simulation. Readouts
show drive/motor rpm and the model's brake state. Travel sleeves use cumulative
path length. This does not add a separate engine clock or fleet simulation.

The playground and original complete-line page share this solver. The cabin
workshop shows the same traction clamps. Solo remains separate from the main
resort; the version 2 document and browser saves are untouched.


## Level upper hall

An optional `arrivalProfile: 'flat'` selects a 0° upper guide. Its carrying datum
uses `dockOffset(0)` to retain the same boarding-floor height. The guide is level
through 15 m towards the valley, then joins the free catenary through a tangent
transition extending to 18 m. The façade is at 15.5 m, so only 2.5 m of the
transition is exposed; the supporting girder ends at 18.25 m (2.75 m overhang). The traction profile propagates the same terminal
angle and guide extents, with a vertical rope separation in the level section.
A compact Heavy Portal-style mast, with flared feet and X-bracing, is embedded
in the front podium. It supports the short carrying/haul guide head from below.
The old long external cage is removed; the internal cage stays inside the hall.
Carrying-saddle brackets use 1.6 m pitch and haul rollers about 1.4 m pitch for
the flat upper hall. A continuous saddle supports the fixed rope; the old idle
carrying-rope roller rows are removed. The
hall envelope and boarding deck retain their dimensions. Return-entry sheaves
already derive their angle/height from the profile and become horizontal leads.
Both cabins still share one drive displacement. Existing isolated studies and
older saved definitions without the option retain their inclined guides.

## Suspended cabin response

The runtime reparents the trolley directly beneath the carrier root, then pivots
the arm/body beneath the existing upper pin (x=0.4 m, trolley y+0.23 m). The arm's
upper vertex therefore stays attached as the trolley pitches over the profile;
running axles and haul collars never inherit cabin swing. `suspension` remains the
moving body coordinate frame used by the ride camera, and standing passengers
continue sampling `body.matrixWorld`.

`SuspensionMotion` integrates a 5.6 m effective damped pendulum in substeps of at
most 1/120 s, driven by changes in signed horizontal and vertical carriage speed.
Longitudinal response is stronger than the small coupled lateral response. Limits
are 0.028 rad pitch and 0.00314 rad roll, reduced near the station by progressive
capture damping. The model is a visual approximation, not elastic rope or hanger
stress simulation. Operations pass actual elapsed time separately from the scaled
native shuttle clock. Stopped cables retain fixed carrier positions while the
pendulum settles; zero elapsed time freezes it. Seeking explicitly resets its
history. The pin transform, people, camera and moving doors share the same body
pose; rope statics and machinery routing remain independent of that pose.


Small haul rollers at both stations and pylons derive their phase directly from
signed rope displacement / radius, rather than accumulating frame deltas. A single
silver face mark on each side avoids the stationary appearance of the small,
nearly symmetric roller faces. Wheel geometry remains instanced and follows the
same lane directions and reversal as the haul circuits. The carrying rope is fixed
and rests on stationary continuous saddle rails, without ornamental idle rollers.

The outer haul-roller bank uses an outer-side cheek and cantilever axle journals,
leaving the hanger-facing side open. Inner banks retain two-sided bearings. This
clearance is needed for the single-arm suspension to swing through the compact
entrance and pylon heads; neither haul-rope position is shifted.
