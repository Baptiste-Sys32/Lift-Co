# Station workshop, second study

Open [the workshop](../designs/station-variants.html). The original study explored five categories and 15 proposals, shared across compatible carriers. The detachable-chair proposals have since been removed because none were approved. Fixed-grip chairs have their own category. Selecting another approved carrier changes the scale reference, not the set of station designs.

This replaces the first workshop. Its source is backed up under `archive/backups/station-workshop-v1-20261020`. The user selected Fixed B, Gondola B, Tramway B and Funitel C. All detachable-chair proposals were rejected. The four approved designs are now optional end-station types in the main game. The 13 lift type IDs and operating rules are unchanged; the existing version 3 lift record stores an optional `stationStyle`.

## Choices

| Category | A | B | C |
| --- | --- | --- | --- |
| Fixed-grip chairs | Poma Alpha, compact hood on two piers | Poma Delta, external triangular steel frame | Leitner enclosed drive, glazed machine room on a central pier |
| Detachable chairs | Removed, rejected | Removed, rejected | Removed, rejected |
| Monocable gondolas | Poma Satellit, longer gondola terminal | Princesse, timber passenger hall | D-Line, integrated dark station building |
| Reversible aerial tramways | Rochebrune, horizontal timber station | Faron, sloping concrete wedge and public wing | Saleve, rounded glazed hall on a concrete bridge |
| Reversible funitels | Rocharbois, timber return hall | Caboche, open braced drive hall | Bouquetin / 3 Vallees, exposed steel gallery |

These are estimated architectural adaptations, not dimensionally accurate manufacturer replicas. The photographs and drawings are available directly in the workshop, including a large reference view and source link for the selected proposal. Letter A is not an approval.

## Research and visual decisions

Research used web searches, original report photographs, manufacturer material and the architects' own project pages. Some Remontees-Mecaniques.net HTML reports block direct access. Those links are retained, but the actual visual evidence used here is the accessible photograph or brochure. No claim is made to have read blocked reports in full.

### Fixed-grip chairs

- [POMA, Mieussy-Sommand Alpha brochure](https://membres.remontees-mecaniques.net/monchu/pdf/dpmieussy.pdf), with the [Alpha photo report](https://forum.stationsdeski.net/t2564-les-gares-alpha-telesieges-fixes-poma): a compact machine cover and two aligned supports. The model has an opaque crown, front glazing, visible bullwheel, service ladder and separate operator hut. It does not use a detachable station core.
- [Les Gardes Delta report](https://www.remontees-mecaniques.net/forums/index.php?showtopic=10045): the original lolo42 photograph shows the external triangular steel frame and narrow curved casing. Both are modeled separately. The triangles, rather than a box building, carry the station.
- [LEITNER, fixed-grip chairlifts](https://www.leitner.com/en/products/ropeway-systems/detail/fixed-grip-chairlifts/): the manufacturer distinguishes an enclosed load-bearing machinery room from the compact Unifix mushroom. The study uses its Bichlalm photograph for the enclosed room, with high glazing, rounded shoulders and a red fascia. This proposal is deliberately not called Unifix.

All three keep the fixed-grip bullwheel and have no tyre conveyor, grip-detachment track or invented detachable boarding operation. Drive equipment appears in the valley inspection; the summit inspection uses a return wheel without the drive motor.

### Detachable chairs and gondolas

- [POMA, La Princesse press dossier](https://membres.remontees-mecaniques.net/monchu/pdf/dpprincesse.pdf), printed page A5: actual Satellit mechanical cutaway and terminal photo. The raised envelope, glazing belt, oval ends and supporting frame inform the study. [Grand Massif Express](https://lacpse.remontees-mecaniques.net/pdf/grandmassifexpress.pdf) provides another primary Satellit reference.
- [LEITNER station components](https://www.leitner.com/en/products/ropeway-components/detail/leitner-station/): the Busa Fonda photograph and manufacturer station brochure support the compact silver housing, clipped shoulders and low proportions. The short station is a real manufacturer option. HCL boarding is not simulated or added to the game.
- [Doppelmayr UNI-G configuration, Mount Snow public planning submission](https://anrweb.vt.gov/PubDocs/ANR/Planning/2W0359-65/Application%20Documents/023%20Terminals%20and%20Opr%20Huts%20Colors%20and%20Photos_2021-11-15.pdf): the manufacturer rendering shows the dark curved shell, repeated ribs, pale portal edges, cable-entry trumpets and supporting piers. The local image includes only the rendering, excluding the submission's contact details.
- [La Princesse report](https://www.remontees-mecaniques.net/bdd/reportage-tcd8-de-la-princesse-poma-4832.html): retained original station photographs inform the timber cladding, pitched roof, glazing and visible bents. This is a passenger building around machinery, not a recolored detachable capsule.
- [Gschwandtl & Partner, D-Line lift station](https://www.gp.co.at/projects/d-line-liftstation): the project photo shows a broad, low, dark building, open cable frontage and raised service volume. Proposal C follows that integrated building, not the standalone D-Line R2 machinery cover. The game carriers remain the approved models.

The study's detachable core uses the existing detailed machinery factory, with distinct terminal lengths, a circular bullwheel, paired tyre lanes and a rear half-circle carrier rail. Wheels are not distorted by scaling a complete terminal. Gondola platforms sit outside the cabin envelope. Building cutaway reveals the equipment. These are inspection layouts, not new production cable paths.

### Reversible systems

- [Rochebrune report](https://www.remontees-mecaniques.net/bdd/reportage-tph33-de-rochebrune-heckel-poma-1886.html): the retained Monchu summit photograph shows a horizontal timber-clad station and substantial base. The study follows its low building vocabulary instead of adding a generic tall chalet.
- [Patrick Jouffret, Faron station project](https://patrickjouffret.com/project/gares-du-faron-scenographie/): exterior photography shows Pascalet's white concrete wedge, circular openings and separate low public wing. The study adapts that silhouette around two game docks. The selected refinement now extrudes the concrete walls with actual circular openings, fitted glass and a pedestrian opening into the public wing.
- [AHA, Saleve restoration](https://aha-paris.com/fr/projets/le-telepherique-du-saleve): project photographs and description show Braillard's concrete bridge and rounded glazed hall. The model adapts the upper hall, supporting side beams and pedestrian access to the Solo dock spacing. It does not reproduce the full cliff structure or real building scale.
- [Rocharbois report](https://www.remontees-mecaniques.net/bdd/reportage-fun-v-rocharbois-poma-4761.html): original retained photos distinguish the timber return and Caboche's open, braced drive frame. The proposals preserve that difference in roof pitch, enclosure and support structure.
- [Bouquetin / 3 Vallees photo report](https://forum.stationsdeski.net/t3767-funitel-a-va-et-vient-double-monocable-des-3-vallees): the actual elevated steel frame, tubular legs and maintenance gallery inform C. This is a reversible funitel reference, not a circulating gondola station. Architecture is adapted to the existing three-section trains, not a claim that the real installation uses those carriers.

Solo retains its approved terminal receptors and local haul machinery. The summit inspection uses the existing flat-arrival configuration. Reversible funitels retain the paired-rope drive/return arrangement. Architecture studies do not change in-game terrain or cliff-clearance rules.

## Controls and storage

- Select a category, an approved carrier for scale, and a valley or summit inspection.
- Select A, B or C; compare all three; inspect cable-entry, side, plan and machinery views.
- Toggle the building, carriers and machinery animation separately. Drag to orbit, scroll to zoom and right-drag to pan.
- Use Reference photo to open the selected source. The reference desk also gives credits, observed features and an original-source link.
- The four approved directions are locked for both endpoint inspections and restored on refresh. Detachable chairs stay explicitly unselected. Older alternatives remain inspectable as archived options. Browser preferences use `lift-co-station-workshop-v2`, separate from resort saves.
- Export produces a version-2 workshop selection file with `categoryId`, `role`, `variant` and design name, plus the explicitly rejected chair category. This is not a resort document or a new resort save version.

This study covers end terminals. Panoramabahn's angle transfer and Princesse's passenger middle station remain their existing dedicated game layouts; this page introduces no universal angle or middle-station option.

## Rendering and verification

Static study meshes are batched by material; moving terminal wheels are instanced. The viewer caps pixel ratio at 1.25 and rendering at 30 fps. It uses local Three.js modules and local reference assets. Desktop and iPad landscape layouts keep the camera controls and building caption outside the model viewport.

Verification covers JavaScript syntax, browser loading of all 15 proposals at both endpoints, approved carrier substitutions, comparison labels, cutaway, wheel motion, category choice storage and export. It does not establish engineering safety, exact dimensions or laptop/iPad hardware performance. No automated game test suite is added or run.

## Selected-design refinement, 20 October 2026

The four approvals are recorded in `approvedVariants` in the workshop data module. They take precedence over old local letter picks. The exported study JSON contains the four approved categories at both endpoints and lists detachable chairs as rejected. This remains independent of resort document versions.

- Delta B: closed curved casing with inspection panes, vents and seams; a suspended structural cradle; wider steel triangles clear of the four-seat chair envelope; bolted footplates; a motor bed; and a service hut moved away from the steel legs. The fixed clamp is placed at the rope height instead of below it. The rope now has tangent leads and a real bullwheel return.
- Princesse B: continuous foundation and sill panels, framed window openings, closed corners, matching roof/gable geometry, fascia, gutters, standing seams, an internal control booth and entrance steps. The rear is closed except for pedestrian access. Platform height follows the chosen carrier's actual floor datum. Inner and outer platforms clear its body envelope. The rear turn remains clear of the central platform. Reversed cabin hangers are oriented to put their running wheels on the station rail.
- Faron B: thick sloping concrete walls with real oculus holes, a seated roof slab, a closed rear service wall, framed front cable portals and a complete public wing. The wing floor, entrance, glazing, roof and steps meet on the same boarding datum. The paired cable openings remain intentionally open.
- Bouquetin C: the old hidden-housing adapter has been replaced by one steel structure around the existing paired-rope terminal routing factory. There is no second timber frame inside it. Tubular legs, bolted footings, receptor supports, return bearing supports, lattice girders, a guarded maintenance walk, a landing ladder and a closed rear service pod have explicit connections. Its front is deliberately open, as in the reference.

The motion preview is now driven by elapsed simulation time and signed cable displacement. Fixed chairs keep one speed around the return wheel. Detachable gondolas crawl at 0.65 m/s while the hauling rope runs at an illustrative 3 m/s; opposite tyre lanes turn in opposite directions. Grip running wheels, motor fans and couplings animate independently of stationary bearings and housings. Circular haul returns follow the bullwheel groove. Circulating carriers reset beyond the end of the finite inspection section; this is not a full resort simulation.

Solo and the train show paired inverse motion, gradual acceleration and braking, a boarding dwell and reversal. Doors finish closing before movement. Wheel angles and exposed drive parts use the same signed travel, so they stop and reverse with the carriers. Solo uses one smooth carrying-rope profile for geometry, trolley pitch and carrier height, with arc-length travel rather than planar distance. Carrying ropes extend beyond the station saddle and remain stationary. A small acceleration response acts below the trolley while the running gear stays on its carrying rope. The summit preview remains flat. The funitel uses a level terminal approach in this isolated study.

Contact shadows and lower light exposure make foundations, supports and wall thickness readable. Glass does not cast an opaque shadow. These are geometric and kinematic inspection improvements, not structural engineering calculations or production lift physics. Main-game geometry, operating parameters, terrain and save data remain unchanged.

The refinement pass was checked in the browser at both endpoints for the four approved categories, including both fixed chairs and all six gondola carriers (20 carrier/endpoint configurations). All poses remained finite, all cutaways toggled, the reversible wheel angles stayed constant during dwell and changed sign on reversal, and the paired train kept its inverse travel relationship. Screenshots were reviewed from perspective, side and plan views. These are temporary browser and numerical inspection probes, not a repository test suite or a substitute for review on the actual iPad.


## Main-game integration, 20 October 2026

Construction offers Original station plus the approved design for each compatible lift. One Station type selection changes both end stations. Existing lifts can be edited in the same panel. The eight-person gondola keeps its dedicated middle station; the angled chairlift keeps its native transfer structure. Detachable chairlifts retain only their original stations.

`station-architecture.js` reuses the approved building geometry around each runtime's native cable routing, carrier paths and animated machinery. Delta replaces the complete fixed terminal, with a circular bullwheel sized to the existing lane spacing and an external frame widened for the four-seat model. Princesse uses a wider timber hall to clear the game's existing passenger decks. Faron's entrance headroom follows the native haul rope; its public wing gets a separate small terrain pad outside the cliff approach. Bouquetin retains the game's coupled paired-rope mechanism, replaces the timber envelope and uses steel receptor supports aligned with the gallery. This does not add independent funitel drives.

New foundations reach the authoritative ground surface. Placement envelopes include the Faron wing and extended timber hall. Changing station type refreshes the terrain preview; Cancel and history restore the previous shaping. Existing no-style saves retain their original stations. Optional style values are checked against lift type before loading or applying. Existing browser slots are backed up once under `lift-co-pre-station-styles-20261020:`; backup failure continues to block saving.

The workshop's rear gondola tyres now spin on a child rotor under their fixed yaw mount. Its Solo trolley and haul clamps use the production hierarchy and carriage-seating calculation, independently of the cabin pendulum. The main game already used that arrangement.
