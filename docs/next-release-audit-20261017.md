# Upper Snowfields: current state and next release

> Historical audit. Solo integration and subsequent machinery/arrival work are now implemented; see [the current behavior specification](build-operate.md). On 18 October the user moved the next design priority to [three chairlifts and the Palace8 mid-station gondola](chairlift-expansion-studies.md), beginning with separate HTML studies. The turning chairlift and mid-station gondola will be dedicated build options. The recommendations below retain their original audit date.

Research and source audit, 17 October 2026. The requested téléphérique is **Solo,
the approved single-arm cabin**. This report proposes work; it does not enable
new game features. [Build and operate](build-operate.md) remains the current
behavior specification. The resort document remains version 2.

## Recommendation

Make the next release **Solo, station choice, and a readable resort network**.
Its defining experience should be: build a distinctive cliff-terminal shuttle,
connect a suitable descent, watch guests complete the outing, and understand
why the resort works or where it needs a connection.

Start with one complete Solo outing. Then expose compatible station designs and
reorganize the UI around Build, Operate and Inspect. Include a network overlay
and guest journey explanations as actual new capabilities. Keep the cozy
sandbox: instant construction, instant fleet changes, and no economy or failures.

## What exists, and how confidently we can describe it

| Area | Current implementation | Evidence and remaining limit |
| --- | --- | --- |
| Lift collection | Eight buildable types: Classic gondola; Classic fixed chair; 6-Seater detachable; Panorama, Touring, Arbois and SP77 gondolas; 3-Section Train | All eight were constructed during the checkpoint; seat/standing slots matched catalog capacities. Solo, Heritage, Glacier and 3S are not currently buildable. |
| Lift construction | Station movement/elevation/foundation choice; tower movement, tilt, grouping, copy/paste; validation and previews; Apply/Cancel and history | Targeted placement and actual invalid-drag probes passed. This does not establish every multi-line arrangement or occupied-infrastructure scenario. |
| Operations | Boarding availability, running state, ramped speed, linked fleet controls, camera reservation and readouts | Runtime checkpoint covered motion, clamps, stop and boarding windows. Capacity is a theoretical upper bound, not measured service. |
| Snow and routes | Four brushes; editable independent pistes/paths; widths, shaping layers, signage, explicit endpoint connections/junctions | Present in source and described in the spec. Comprehensive interactive earthworks/restoration scenarios remain to be reviewed. |
| Guests | Four abilities, reachable descent outings with entrance return, both-end lift travel, queues and replanning | Routing code exists; the checkpoint deliberately preserved it. A representative connected resort still needs sustained gameplay review. |
| Persistence | Version 2 document; V1 conversion; pre-change backups; operations persistence | Fresh save/reload and migration/backup-failure probes passed. A player-facing import/restore workflow is absent. |
| Rendering | Instancing, distance limits and capped rendering features | Retain these. Laptop performance under connected-resort demand has not been established. |

The checkpoint is a useful stable base, rather than proof that all ten original
acceptance scenarios are complete. Its exact verification scope is recorded in
[the spec](build-operate.md#persistence-and-verification).

For this audit, the current page and Solo complete-line study were also opened
in isolated headless Chrome. Both had empty error overlays. The fresh paused
resort UI measured 1,330 px of sidebar content against a 768 px viewport. Live
screenshots confirmed the stacked workbench layout. These are load/layout
observations, not an FPS benchmark or a new acceptance pass.

## Parked work worth reusing

| Asset | What is retained | What remains before game use |
| --- | --- | --- |
| **Solo** | Approved 4.5 m cabin, eight-wheel single-arm carriage, Heavy Portal supports, inclined cages, shared reversible line runtime, complete-line experiment | Adapt to the current builder, foundations, terrain, operations, network and save/load path. This is the first priority. |
| **Train station alternatives** | Timber return, Caboche frame and Open gallery are already modeled | Current runtime selects the timber variant at both ends. Other variants need role, footprint, clearance and access integration. |
| **3S families** | Coblence/Zeta, Campitello/Atria and Alpin Express/Gangloff; each has three cabin and three tower proposals | Design selection and a new circulating ropeway/station runtime. They are visual studies, not almost-finished game types. |
| **Heritage / Glacier** | Large téléphérique cabin studies | Extract reusable geometry and build a suitable runtime after Solo establishes the shuttle integration. |
| **Physical garages** | An explicit deferred goal | Storage tracks, switches, vehicle routing and dispatch logic. Keep deferred while station interfaces are still being settled. |

Sources: [catalog](../src/lifts/catalog.js), [Solo runtime](../src/lifts/solo-runtime.js),
[Solo line](../experiments/solo-line.html), [train designs](../src/lifts/funitel-rocharbois.js),
[train runtime](../src/lifts/funitel-runtime.js), [3S inventory](3s-studies.md),
[large cabin studies](../designs/telepheriques.html).

## Solo: substantial reusable work, substantial integration work

The retained Solo line already models two opposing cars on one displacement,
an arc-length speed schedule, 10.25 m/s open-span travel, a shared 7 m/s pylon
restriction, 0.65 m/s² acceleration, eight-second dwell, opening doors and
inclined docking. Its base/top approaches are 12°/20°. Preserve the approved
model and its 12 standing places; restoring it is not a reason to enlarge it.

This is a different kind of lift from the circulating gondolas. LEITNER's
description of aerial tramways distinguishes the supporting rope(s), haul rope
and back-and-forth cabin travel. That supports the shuttle approach; it does
not validate our particular guide mechanism or dimensions.
[Manufacturer description](https://www.leitner.com/en/products/ropeway-systems/detail/aerial-tramways/).

The concrete integration gaps are:

1. **Factory and layout selection.** `empty-map.html` does not load the Solo
   sources; its special construction/runtime branches currently select the
   train. Loading the scripts and enabling the catalog entry alone is insufficient.
2. **Station geometry and boarding datum.** Generic construction assumes a
   0.52 m boarding offset; Solo's runtime uses 0.60 m. Its inclined channels and
   projected cliff platform need their own footprint and clearance envelope.
3. **Terrain and access.** Use the current authoritative edited terrain, station
   elevation and foundation settings. Define actual Solo entrances/queues rather
   than inheriting the ordinary terminal's lateral access point. Validate both
   directions, not just the valley boarding demonstration.
4. **Operations.** Reversible cycle estimation currently has train-specific
   logic. Solo must expose its own schedule so capacity is nonzero and includes
   the slowdowns at either car's supports. Preserve position and assignments
   during speed changes. Keep a shared drive for both cars.
5. **Boarding and departure.** Sequential walking can consume much of an
   eight-second stop. Observe real boarding, alighting and missed departures;
   do not equate twelve slots with twelve successfully served passengers.
6. **Camera and capacity.** Today's rule reserves one entire carrier. With two
   paired cars this leaves one passenger car, reducing capacity relative to two
   passenger cars. Preserve that rule during initial restoration and label the
   estimate honestly. A future occupied-cabin camera would be a separate change.
7. **Compatibility.** Preserve stable IDs and operations in current V2 saves.
   Check old Solo definitions against present validation. Saved backups from the
   hold period must not be silently merged into a changed resort or duplicated.

Use a small per-model interface for layout, factory, boarding floor, terminal
footprint, access points and operating-cycle data. Extract these decisions
incrementally from existing branches. A framework rewrite would add risk without
making the first Solo outing more playable.

The retained rig deliberately omits a complete haul drive/return circuit, and
its yielding clamp guides are a visual proposal. The technical pass should
identify which machinery remains schematic and show a coherent drive/return
arrangement where visible. Keep engineering claims separate from visual
plausibility. The historical notes already identify these limitations in
[Solo's complete-line description](lift-types.md#solo-complete-line-test).

**Completion gate:** place Solo on suitable terrain; connect an ability-appropriate
piste and access; board, descend and return; close it with riders, stop/resume,
edit/cancel/apply/undo, reload and remove/restore. Include cliff access and a
terrain edit near the station in the review. Animation alone is not completion.

## More stations: meaningful choice with compatible machinery

Separate the **mechanical terminal**, **architectural shell**, and **pedestrian
access/foundation**. A façade change should retain the rope path, towers and
carrier phase when it fits the same envelope. A change that alters the envelope
must preview and validate its earthworks and clearances.

Real designs support this distinction: LEITNER describes different station and
drive configurations, while MOJA's Garaventa Peak Line project uses alternative
façades around a modular tramway station. These are references for our design
organization, not evidence that every shell fits every lift.
[LEITNER components](https://www.leitner.com/en/company/useful-information/elements-of-ropeways/),
[MOJA's Peak Line project](https://moja-design.de/en/projects/modulare-seilbahn-pendelbahn/).

Recommended sequence:

- First integrate the existing **Caboche frame and Open gallery** alongside the
  train's timber design. Check their different lengths and keep drive/return
  machinery roles explicit; the current runtime requests return assemblies at
  both ends, so it is not yet a complete visual drive arrangement.
- Keep Solo's approved open cage as the first usable terminal. Add a **timber
  mountain hall** and a **glazed machinery gallery** around its compatible docking
  structure after it works. Give the valley and summit independent choices.
- Later extend the ordinary detachable family with compact/open and longer
  covered shells. Keep the fixed-grip canopy a distinct family.

Show small real geometry previews, footprint, entrance location and compatible
lift families. Avoid an unrestricted parts kit with impossible combinations.
Roofs, service access and passenger coverage should make the silhouettes
different rather than merely changing colors. LEITNER's Premium Station is a
useful functional reference for extended cover and relocated access.
[Premium Station](https://www.leitner.com/en/products/ropeway-components/premium-station/).

No style field is added in this audit. Implementation should retain document
version 2, existing IDs and migration behavior; any optional style metadata
needs explicit defaults and round-trip verification before it ships.

## A new UI that adds understanding

Keep snow-paper panels, forest-green type and brass selection. The current
identity suits the game. Reorganize the information around three activities:

| Context | Main tools | New information |
| --- | --- | --- |
| **Build** | Lift/station palette, terrain, piste and path tools; context inspector; profile while editing | Click an issue to focus its location. See entrances, footprints and construction conflicts together. |
| **Operate** | Selected lift controls and a compact line diagram | Queues at each end, usable/camera fleet, current shuttle positions, boarding/departure phase, next arrival, estimated versus observed service. |
| **Inspect** | Resort schematic/overlays, guest selection, ability filter | What is reachable, whether a descent has a return, and the actual reason a guest cannot start an outing. |

A compact left palette/list and a contextual inspector can replace the long
all-purpose sidebar. Hide irrelevant controls; show only the active construction
profile. Validate the arrangement at laptop widths before polishing animation.
Preserve teal snap targets and green/red connected/disconnected endpoint status
as distinct systems, with labels/icons as well as color.

Two researched precedents are particularly useful: Transport Fever 2 exposes
object details, line frequency and data layers; Planet Coaster 2 uses heatmaps
to explain conditions across a park. Apply those information patterns to our
small mountain, rather than importing their economic systems.
[Transport Fever 2 manual](https://www.transportfever2.com/wiki/doku.php?id=gamemanual%3Astatisticsdatalayers),
[Planet Coaster 2 developer explanation](https://www.planetcoaster.com/en-US/news/2024-09-25/deep-dive-mastering-management).

The strongest first overlay is **“Can a green skier complete an outing and get
home?”** Highlight the entrance, feasible descents and return connections. A
connected endpoint alone cannot answer that question. Guest inspection should
distinguish no suitable descent, missing connection, no return and a closed or
stopped lift using actual graph/state evidence. These explanations do not yet
exist; they should reuse the current routing rules rather than replace them.

## New ideas ranked by usefulness

Effort here is relative to this codebase, not a calendar estimate.

| Idea | Player value | Relative effort | Recommendation |
| --- | --- | --- | --- |
| Ability/return overlay and guest journey inspector | Makes existing network building understandable | Medium | Core next release |
| Solo line diagram with next arrival and both queues | Makes the new shuttle enjoyable to watch and operate | Medium | Core next release |
| Compatible station selector | Gives the resort distinct architecture using retained designs | Medium | Core, after Solo integration |
| Bounded demand presets and observed throughput | Lets players see a quiet resort become busy, and assess queues | Medium | Follow core integration, with laptop profiling |
| Backup import/restore with validation and preview | Makes the existing export practically useful | Small–medium | Good contained follow-up |
| Named circuit preview and station trail-map boards | Gives routes identity and makes the network legible in-world | Medium | Follow the inspection tools |
| Sightseeing outings | Gives a summit shuttle a purpose before every visitor needs a piste | Medium | Later guest objective, with guaranteed return and no run credit |
| Motion-driven machinery/door sound | Adds character when riding and inspecting stations | Small–medium | Polish after machinery state is reliable |

Demand deserves attention before more headline capacities: automatic arrivals
currently stop at 18 guests, although loaded saves allow more. That is useful
for a quiet sandbox but not enough to evaluate a 75-place train. Add modest
presets only with measured frame time and queue behavior; do not assume thousands
of detailed avatars are the answer. Separate theoretical transport potential,
observed boardings and the existing completed-piste-runs counter.

Sightseeing is particularly relevant to Solo: current outings seek a piste
descent. A beautiful isolated lift does not by itself create a guest outing.
The first release should prove a connected ski outing; later, an explicit
scenic trip can add that missing purpose without pretending lift-only travel is
a completed run.

## Release order and back burner

1. **Prove the base:** one saved two-lift network with a beginner return and a
   harder alternative. Review routing, closures, occupied edits and restoration;
   record laptop performance. Do not replace already working ability/terrain logic.
2. **Restore Solo fully:** minimal model interface, correct stations/earthworks,
   operating cycle and both-way guests. Pass the full-outing gate above.
3. **Ship station choice and the new workbench:** retained train variants,
   compatible Solo architecture, Build/Operate/Inspect, ability/return overlay
   and focused issue navigation. Default old saves to their current appearance.
4. **Make service visible:** bounded demand and measured service, followed by
   restore/import, wayfinding and ambient sound as separately reviewable additions.

Keep physical garages, 3S, Heritage/Glacier, middle/angle stations, dedicated
stairs/bridges and village systems deferred. Garages require carrier track
routing; 3S requires circulating carriers on fixed track ropes and detachable
station handling, rather than just swapping a cabin onto Solo. The manufacturer
distinguishes that system explicitly.
[Doppelmayr system overview, 3S section](https://www.doppelmayr.com/wp-content/uploads/2023/02/DM_Imagebroschuere2020_ENG.pdf).

Weather shutdowns, maintenance failures, finances and construction timers are
not needed to make this release interesting. Network design, station architecture
and watching a distinctive lift serve guests already supply a clear purpose.

## Documentation and verification boundaries

Some older pages still describe V1 saves, automatic return pistes, the former
walking transfers or a fixed 1.8 m/s chair speed. Treat historical release notes
as historical. Keep the current specification authoritative, and update the
current lift guide/README when the next release actually changes behavior.

This audit changed documentation only. It added no lift type, save field,
runtime change or automated test suite. Primary sources were consulted for
ropeway/station concepts and UI precedents; the release ranking and architecture
recommendations are our design judgments. Detailed engineering validation of
the approved visual mechanisms remains outside the evidence gathered here.
